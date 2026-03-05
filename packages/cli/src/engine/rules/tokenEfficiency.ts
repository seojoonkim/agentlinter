/* ─── Token Efficiency Score Rules ─── */
// Grades files by line count: A (≤150), B (≤300), C (≤500), D (>500)
// v2.1: + duplicate-content, obvious-statements, token-budget-range

import { Rule, Diagnostic, FileInfo } from "../types";

interface GradeInfo {
  grade: string;
  severity: "info" | "warning" | "critical";
  message: string;
  fix: string;
}

function getGrade(lineCount: number): GradeInfo {
  if (lineCount <= 150) {
    return {
      grade: "A",
      severity: "info",
      message: `Token Efficiency Score: A (${lineCount} lines) — Excellent! Concise and agent-friendly.`,
      fix: "Great job keeping it lean. Continue monitoring as the file grows.",
    };
  } else if (lineCount <= 300) {
    return {
      grade: "B",
      severity: "info",
      message: `Token Efficiency Score: B (${lineCount} lines) — Good. Consider trimming redundant sections.`,
      fix: "Review and consolidate duplicate instructions. Aim to move infrequently-used details to separate files (e.g., compound/) linked via references.",
    };
  } else if (lineCount <= 500) {
    return {
      grade: "C",
      severity: "warning",
      message: `Token Efficiency Score: C (${lineCount} lines) — Getting heavy. Large files consume more context tokens.`,
      fix: "Split the file into focused modules (e.g., SECURITY.md, FORMATTING.md). Keep only the most critical rules in the main file. Target < 300 lines.",
    };
  } else {
    return {
      grade: "D",
      severity: "critical",
      message: `Token Efficiency Score: D (${lineCount} lines) — Critical! This file is too long and will exceed agent context windows.`,
      fix: "Immediately refactor: extract non-essential sections to separate files, remove stale/duplicate rules, and use @import or file references. Target < 300 lines for main agent files.",
    };
  }
}

/* ─── 3-gram Jaccard Similarity ─── */

function getNgrams(text: string, n: number): Set<string> {
  const words = text.toLowerCase().replace(/[^a-z0-9가-힣\s]/g, "").split(/\s+/).filter(Boolean);
  const grams = new Set<string>();
  for (let i = 0; i <= words.length - n; i++) {
    grams.add(words.slice(i, i + n).join(" "));
  }
  return grams;
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/* ─── Token Estimation ─── */

function estimateTokens(content: string): number {
  let tokens = 0;
  for (const char of content) {
    // Korean characters: ~1.5 chars per token
    if (/[\u3131-\uD79D]/.test(char)) {
      tokens += 1 / 1.5;
    } else {
      // English/ASCII: ~4 chars per token
      tokens += 1 / 4;
    }
  }
  return Math.round(tokens);
}

function getTokenGrade(tokenCount: number): { grade: string; severity: "info" | "warning" | "critical" } {
  if (tokenCount <= 2000) return { grade: "A", severity: "info" };
  if (tokenCount <= 5000) return { grade: "B", severity: "info" };
  if (tokenCount <= 10000) return { grade: "C", severity: "warning" };
  return { grade: "D", severity: "critical" };
}

/* ─── Obvious Statements Patterns ─── */

const OBVIOUS_PATTERNS = [
  /\bbe accurate\b/i,
  /\brespond correctly\b/i,
  /\bfollow instructions\b/i,
  /\bbe professional\b/i,
  /\bdo a good job\b/i,
  /\bbe thorough\b/i,
  /\bmake sure to\b/i,
  /\bremember to\b/i,
  /\bdon'?t forget to\b/i,
  /\bplease note that\b/i,
  /정확하게 답변/,
  /지시를 따르/,
  /실수하지 마/,
];

export const tokenEfficiencyRules: Rule[] = [
  // Existing: line-based grading
  {
    id: "clarity/token-efficiency-score",
    category: "clarity",
    severity: "warning",
    description:
      "Grades each agent file by line count to ensure token efficiency (A≤150, B≤300, C≤500, D>500)",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const targetFiles = files.filter(
        (f) => !f.name.startsWith("compound/") && !f.name.startsWith("memory/") && f.name.endsWith(".md")
      );

      for (const file of targetFiles) {
        const lineCount = file.lines.length;
        if (lineCount < 5) continue;

        const { severity, message, fix } = getGrade(lineCount);

        diagnostics.push({
          severity,
          category: "clarity",
          rule: this.id,
          file: file.name,
          line: undefined,
          message,
          fix,
        });
      }

      return diagnostics;
    },
  },

  // v2.1: Duplicate content detection (3-gram Jaccard)
  {
    id: "clarity/duplicate-content",
    category: "clarity",
    severity: "warning",
    description:
      "Detects duplicate sections within and across files using 3-gram Jaccard similarity (≥ 0.6)",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const targetFiles = files.filter(
        (f) => !f.name.startsWith("compound/") && !f.name.startsWith("memory/") && f.name.endsWith(".md")
      );

      // Collect all sections with their ngrams
      const sectionData: Array<{
        file: string;
        heading: string;
        line: number;
        ngrams: Set<string>;
      }> = [];

      for (const file of targetFiles) {
        for (const section of file.sections) {
          const content = section.content.trim();
          if (content.split(/\s+/).length < 10) continue; // skip tiny sections
          sectionData.push({
            file: file.name,
            heading: section.heading,
            line: section.startLine + 1,
            ngrams: getNgrams(content, 3),
          });
        }
      }

      // Compare all pairs
      for (let i = 0; i < sectionData.length; i++) {
        for (let j = i + 1; j < sectionData.length; j++) {
          const a = sectionData[i];
          const b = sectionData[j];
          const sim = jaccardSimilarity(a.ngrams, b.ngrams);
          if (sim >= 0.6) {
            const pct = Math.round(sim * 100);
            const location = a.file === b.file
              ? `"${a.heading}" and "${b.heading}" in ${a.file}`
              : `"${a.heading}" (${a.file}) and "${b.heading}" (${b.file})`;
            diagnostics.push({
              severity: "warning",
              category: "clarity",
              rule: this.id,
              file: a.file,
              line: a.line,
              message: `Sections ${location} are ${pct}% similar. Consider merging.`,
              fix: "Consolidate duplicate sections into one to reduce token waste.",
            });
          }
        }
      }

      return diagnostics;
    },
  },

  // v2.1: Obvious statements detection
  {
    id: "clarity/obvious-statements",
    category: "clarity",
    severity: "info",
    description:
      'Detects unnecessary "obvious" instructions that are default LLM behavior (e.g., "be accurate", "follow instructions")',
    check(files) {
      const diagnostics: Diagnostic[] = [];

      for (const file of files) {
        let codeBlock = false;
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];
          if (line.trim().startsWith("```")) {
            codeBlock = !codeBlock;
            continue;
          }
          if (codeBlock) continue;

          for (const pattern of OBVIOUS_PATTERNS) {
            if (pattern.test(line)) {
              diagnostics.push({
                severity: "info",
                category: "clarity",
                rule: this.id,
                file: file.name,
                line: i + 1,
                message: `Obvious statement detected: "${line.trim().substring(0, 60)}..."`,
                fix: "This instruction describes default LLM behavior. Removing it won't affect performance and saves tokens.",
              });
              break; // one match per line is enough
            }
          }
        }
      }

      return diagnostics;
    },
  },

  // v2.1: Token-based budget range
  {
    id: "clarity/token-budget-range",
    category: "clarity",
    severity: "warning",
    description:
      "Estimates actual token count (English: 4 chars/token, Korean: 1.5 chars/token) and grades A≤2K, B≤5K, C≤10K, D>10K",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const targetFiles = files.filter(
        (f) => !f.name.startsWith("compound/") && !f.name.startsWith("memory/") && f.name.endsWith(".md")
      );

      for (const file of targetFiles) {
        if (file.lines.length < 5) continue;

        const tokenCount = estimateTokens(file.content);
        const { grade, severity } = getTokenGrade(tokenCount);

        diagnostics.push({
          severity,
          category: "clarity",
          rule: this.id,
          file: file.name,
          line: undefined,
          message: `Token Budget: Grade ${grade} (~${tokenCount.toLocaleString()} estimated tokens)`,
          fix: grade === "A"
            ? "Token usage is excellent."
            : grade === "B"
              ? "Token usage is acceptable. Monitor as the file grows."
              : grade === "C"
                ? "High token usage. Split into focused modules to stay within context budgets."
                : "Critical token usage (>10K). Immediately refactor to reduce context consumption.",
        });
      }

      return diagnostics;
    },
  },
];
