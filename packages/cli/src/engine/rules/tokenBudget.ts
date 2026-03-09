/* ─── Rule: token-budget (enhanced v2.2.0) ─── */

import { Rule, Diagnostic, FileInfo, Section } from "../types";

/** Padding phrases that can be compressed */
const PADDING_PATTERNS = [
  { pattern: /\bAlways remember to\b/gi, suggestion: "Just state the instruction directly" },
  { pattern: /\bMake sure to\b/gi, suggestion: "Use imperative: 'Do X'" },
  { pattern: /\bPlease ensure that\b/gi, suggestion: "Use imperative: 'Ensure X'" },
  { pattern: /\bIt is important to\b/gi, suggestion: "Remove — all instructions are important" },
  { pattern: /\bYou should always\b/gi, suggestion: "Use: 'Always X'" },
  { pattern: /\bPlease make sure\b/gi, suggestion: "Use imperative: 'Ensure X'" },
  { pattern: /\bKeep in mind that\b/gi, suggestion: "State the instruction directly" },
  { pattern: /\bDon'?t forget to\b/gi, suggestion: "Use imperative form directly" },
  { pattern: /\bIt is recommended that\b/gi, suggestion: "Use: 'Prefer X' or 'Use X'" },
  { pattern: /\bYou need to make sure\b/gi, suggestion: "Use imperative: 'Ensure X'" },
  { pattern: /\bAs a reminder,?\b/gi, suggestion: "Remove — just state the rule" },
  { pattern: /\bNote that you should\b/gi, suggestion: "State directly" },
];

/** Estimate token count from text (words × 1.3 for English, chars / 1.5 for Korean) */
function estimateTokens(text: string): number {
  const koreanChars = (text.match(/[\uAC00-\uD7AF\u3130-\u318F\uA960-\uA97F]/g) || []).length;
  const nonKoreanText = text.replace(/[\uAC00-\uD7AF\u3130-\u318F\uA960-\uA97F]/g, "");
  const englishWords = nonKoreanText.split(/\s+/).filter(Boolean).length;
  return Math.round(englishWords * 1.3 + koreanChars / 1.5);
}

/** Compute per-section token weights */
function computeSectionWeights(file: FileInfo): { heading: string; tokens: number; percent: number }[] {
  const sections = file.sections;
  if (sections.length === 0) return [];

  const sectionTokens = sections.map((s) => ({
    heading: s.heading || "(untitled)",
    tokens: estimateTokens(s.content),
    percent: 0,
  }));

  const total = sectionTokens.reduce((sum, s) => sum + s.tokens, 0);
  if (total === 0) return sectionTokens;

  for (const s of sectionTokens) {
    s.percent = Math.round((s.tokens / total) * 100);
  }

  return sectionTokens.sort((a, b) => b.tokens - a.tokens);
}

export const tokenBudgetRules: Rule[] = [
  {
    id: "token-budget/total-tokens",
    category: "clarity",
    severity: "warning",
    description: "Total token count should stay within recommended limits",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const RECOMMENDED_MAX = 3000;
      const ERROR_MAX = 5000;

      for (const file of files) {
        if (!file.name.endsWith(".md") && !file.name.endsWith(".txt")) continue;
        if (file.name.startsWith("memory/") || file.name.startsWith("skills/")) continue;
        // MEMORY.md is the designated long-term memory store — large size is expected by design
        if (file.name === "MEMORY.md") continue;

        const tokens = estimateTokens(file.content);
        const bytes = Buffer.byteLength(file.content, "utf-8");

        if (tokens > ERROR_MAX) {
          diagnostics.push({
            severity: "error",
            category: "clarity",
            rule: this.id,
            file: file.name,
            message: `File uses ~${tokens} tokens (${bytes} bytes). Recommended: ≤${RECOMMENDED_MAX} tokens. Current usage is critically high.`,
            fix: `Split into smaller files or move sections to .claude/rules/*.md. Target ≤${RECOMMENDED_MAX} tokens.`,
          });
        } else if (tokens > RECOMMENDED_MAX) {
          diagnostics.push({
            severity: "warning",
            category: "clarity",
            rule: this.id,
            file: file.name,
            message: `File uses ~${tokens} tokens (${bytes} bytes). Recommended: ≤${RECOMMENDED_MAX} tokens.`,
            fix: `Consider splitting heavy sections into separate files. Current: ${tokens}/${RECOMMENDED_MAX} tokens.`,
          });
        }
      }

      return diagnostics;
    },
  },

  {
    id: "token-budget/section-weight",
    category: "clarity",
    severity: "info",
    description: "Identifies the heaviest sections consuming the most tokens",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      for (const file of files) {
        if (!file.name.endsWith(".md")) continue;
        if (file.name.startsWith("memory/") || file.name.startsWith("skills/")) continue;
        if (file.sections.length < 2) continue;

        const weights = computeSectionWeights(file);
        const heaviest = weights[0];

        if (heaviest && heaviest.percent >= 40) {
          const top3 = weights
            .slice(0, 3)
            .map((s) => `"${s.heading}" (${s.tokens} tokens, ${s.percent}%)`)
            .join(", ");
          diagnostics.push({
            severity: "info",
            category: "clarity",
            rule: this.id,
            file: file.name,
            message: `Heaviest sections: ${top3}. Section "${heaviest.heading}" dominates at ${heaviest.percent}% of file tokens.`,
            fix: `Consider extracting "${heaviest.heading}" into its own file to balance token distribution.`,
          });
        }
      }

      return diagnostics;
    },
  },

  {
    id: "token-budget/compressible-padding",
    category: "clarity",
    severity: "warning",
    description: "Detects padding phrases that waste tokens without adding meaning",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      for (const file of files) {
        if (!file.name.endsWith(".md") && !file.name.endsWith(".txt")) continue;
        if (file.name.startsWith("memory/") || file.name.startsWith("skills/")) continue;

        let inCodeBlock = false;
        const paddingFound: { line: number; phrase: string; suggestion: string }[] = [];

        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];
          if (line.trim().startsWith("```")) {
            inCodeBlock = !inCodeBlock;
            continue;
          }
          if (inCodeBlock) continue;

          for (const { pattern, suggestion } of PADDING_PATTERNS) {
            pattern.lastIndex = 0;
            const match = pattern.exec(line);
            if (match) {
              paddingFound.push({ line: i + 1, phrase: match[0], suggestion });
            }
          }
        }

        if (paddingFound.length >= 3) {
          const examples = paddingFound
            .slice(0, 3)
            .map((p) => `"${p.phrase}" (line ${p.line})`)
            .join(", ");
          diagnostics.push({
            severity: "warning",
            category: "clarity",
            rule: this.id,
            file: file.name,
            message: `${paddingFound.length} compressible padding phrases found: ${examples}. These add ~${paddingFound.length * 4} wasted tokens.`,
            fix: "Remove filler phrases. Use direct imperative instructions instead.",
          });
        } else if (paddingFound.length > 0) {
          for (const p of paddingFound) {
            diagnostics.push({
              severity: "info",
              category: "clarity",
              rule: this.id,
              file: file.name,
              line: p.line,
              message: `Padding phrase "${p.phrase}" wastes tokens.`,
              fix: p.suggestion,
            });
          }
        }
      }

      return diagnostics;
    },
  },

  {
    id: "token-budget/under-150-tokens",
    category: "clarity",
    severity: "warning",
    description: "Files with fewer than 150 tokens may be too sparse to be useful",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const MIN_TOKENS = 150;

      const coreFiles = files.filter(
        (f) =>
          (f.name.endsWith(".md") || f.name.endsWith(".txt")) &&
          !f.name.startsWith("memory/") &&
          !f.name.startsWith("skills/") &&
          !f.name.startsWith("compound/")
      );

      for (const file of coreFiles) {
        const tokens = estimateTokens(file.content);
        if (tokens > 0 && tokens < MIN_TOKENS) {
          diagnostics.push({
            severity: "warning",
            category: "clarity",
            rule: this.id,
            file: file.name,
            message: `File has only ~${tokens} tokens (recommended ≥${MIN_TOKENS}). May be too sparse to provide meaningful guidance.`,
            fix: "Add more specific instructions, examples, or merge into a parent file.",
          });
        }
      }

      return diagnostics;
    },
  },
];
