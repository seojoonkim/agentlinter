/* ─── Advanced Rules (AL-* series) ─── */
// Added 2026-02-22: Stale Override, Duplication, Generic Instruction,
// Aspirational, Contradiction, Dead Reference, Placeholder Leak

import * as fs from "fs";
import * as path from "path";
import { Rule, Diagnostic } from "../types";

// ─── Helper: parse YYYY-MM-DD date from a string ───
function parseDate(str: string): Date | null {
  const m = str.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return new Date(`${m[1]}-${m[2]}-${m[3]}`);
}

// ─── Helper: extract keywords from a line (lowercase, length > 3) ───
function keywords(str: string): string[] {
  return str
    .toLowerCase()
    .replace(/[^\w\s가-힣]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);
}

// ─── AL-STL: Stale Override Detector ───
const alStl: Rule = {
  id: "AL-STL",
  category: "consistency",
  severity: "error",
  description:
    "Detects dated instructions that have been superseded by a later override/금지/무관 directive on the same topic",
  check(files) {
    const diagnostics: Diagnostic[] = [];

    for (const file of files) {
      if (!file.name.endsWith(".md")) continue;

      // Collect all dated lines: { date, lineIndex, text, keywords }
      const datedLines: {
        date: Date;
        lineIndex: number;
        text: string;
        kw: string[];
      }[] = [];

      const OVERRIDE_WORDS =
        /금지|무관|override|취소|삭제|완전\s*무관|완전\s*금지|더\s*이상|폐기|중단|deprecated|removed|cancel/i;

      for (let i = 0; i < file.lines.length; i++) {
        const line = file.lines[i];
        const date = parseDate(line);
        if (!date) continue;
        datedLines.push({
          date,
          lineIndex: i,
          text: line,
          kw: keywords(line),
        });
      }

      // For each dated line, check if a later-dated line in the same file
      // contains override keywords AND shares ≥2 keywords
      for (let a = 0; a < datedLines.length; a++) {
        for (let b = 0; b < datedLines.length; b++) {
          if (a === b) continue;
          const older = datedLines[a];
          const newer = datedLines[b];
          if (newer.date <= older.date) continue;
          if (!OVERRIDE_WORDS.test(newer.text)) continue;

          const shared = older.kw.filter((w) => newer.kw.includes(w));
          if (shared.length >= 2) {
            diagnostics.push({
              severity: "error",
              category: "consistency",
              rule: this.id,
              file: file.name,
              line: older.lineIndex + 1,
              message: `[AL-STL] Stale instruction (line ${older.lineIndex + 1}) may be overridden by later directive at line ${newer.lineIndex + 1}. Shared topic: "${shared.slice(0, 3).join(", ")}". Newer: "${newer.text.trim().substring(0, 80)}"`,
              fix: "Remove or update the older instruction to reflect the newer override.",
            });
            break; // one diagnostic per stale line
          }
        }
      }
    }
    return diagnostics;
  },
};

// ─── AL-DUP: Duplication Detector (within same file) ───
const alDup: Rule = {
  id: "AL-DUP",
  category: "consistency",
  severity: "warning",
  description:
    "Detects identical or near-identical lines appearing 2+ times in the same file",
  check(files) {
    const diagnostics: Diagnostic[] = [];

    for (const file of files) {
      if (!file.name.endsWith(".md")) continue;

      // Map: normalized line text → first occurrence line number
      const seen = new Map<string, number>();
      const reported = new Set<string>();

      for (let i = 0; i < file.lines.length; i++) {
        const raw = file.lines[i].trim();
        // Skip short lines, headings, blank lines, table rows, code fences
        if (raw.length < 25) continue;
        if (raw.startsWith("#") || raw.startsWith("|") || raw.startsWith("```") || raw === "") continue;

        const normalized = raw
          .toLowerCase()
          .replace(/\s+/g, " ")
          .replace(/[`*_~]/g, "")
          .trim();

        if (normalized.length < 25) continue;

        const firstLine = seen.get(normalized);
        if (firstLine !== undefined) {
          if (!reported.has(normalized)) {
            reported.add(normalized);
            diagnostics.push({
              severity: "warning",
              category: "consistency",
              rule: this.id,
              file: file.name,
              line: i + 1,
              message: `[AL-DUP] Duplicate line in same file (first at line ${firstLine}): "${raw.substring(0, 80)}"`,
              fix: "Remove the duplicate. Keep the instruction in one place only.",
            });
          }
        } else {
          seen.set(normalized, i + 1);
        }
      }
    }
    return diagnostics;
  },
};

// ─── AL-GEN: Generic Instruction Warning ───
const alGen: Rule = {
  id: "AL-GEN",
  category: "clarity",
  severity: "warning",
  description:
    "Detects generic LLM-training platitudes that add no information (e.g. 'write clean code', 'be helpful', 'be careful')",
  check(files) {
    const diagnostics: Diagnostic[] = [];

    const GENERIC_PATTERNS: { pattern: RegExp; label: string }[] = [
      { pattern: /\bwrite clean code\b/i, label: "write clean code" },
      { pattern: /\bwrite good code\b/i, label: "write good code" },
      { pattern: /\bbe helpful\b/i, label: "be helpful" },
      { pattern: /\bbe careful\b/i, label: "be careful" },
      { pattern: /\bbe accurate\b/i, label: "be accurate" },
      { pattern: /\bbe professional\b/i, label: "be professional" },
      { pattern: /\bdo your best\b/i, label: "do your best" },
      { pattern: /\buse best practices\b/i, label: "use best practices" },
      { pattern: /\bfollow best practices\b/i, label: "follow best practices" },
      { pattern: /\bthink carefully\b/i, label: "think carefully" },
      { pattern: /\bthink step.?by.?step\b/i, label: "think step-by-step" },
      { pattern: /\bbe thoughtful\b/i, label: "be thoughtful" },
      { pattern: /\bbe thorough\b/i, label: "be thorough" },
      { pattern: /\brespond professionally\b/i, label: "respond professionally" },
      { pattern: /\balways be polite\b/i, label: "always be polite" },
      { pattern: /\bensure quality\b/i, label: "ensure quality" },
      { pattern: /\bmaintain quality\b/i, label: "maintain quality" },
      { pattern: /\bwrite readable code\b/i, label: "write readable code" },
      { pattern: /\bdo not make mistakes\b/i, label: "do not make mistakes" },
      // Korean equivalents
      { pattern: /최선을 다해/i, label: "최선을 다해" },
      { pattern: /신중하게 생각/i, label: "신중하게 생각" },
      { pattern: /전문적으로 답변/i, label: "전문적으로 답변" },
    ];

    const coreFiles = files.filter(
      (f) =>
        !f.name.startsWith("compound/") &&
        !f.name.startsWith("memory/") &&
        f.name.endsWith(".md")
    );

    for (const file of coreFiles) {
      for (let i = 0; i < file.lines.length; i++) {
        const line = file.lines[i];
        // Skip code blocks
        if (line.trim().startsWith("```") || line.trim().startsWith("//")) continue;

        for (const { pattern, label } of GENERIC_PATTERNS) {
          if (pattern.test(line)) {
            diagnostics.push({
              severity: "warning",
              category: "clarity",
              rule: this.id,
              file: file.name,
              line: i + 1,
              message: `[AL-GEN] Generic instruction "${label}" — LLMs already know this. It wastes context tokens without adding value.`,
              fix: "Replace with a specific, observable behavior (e.g., 'keep functions under 50 lines' instead of 'write clean code').",
            });
            break; // one per line
          }
        }
      }
    }
    return diagnostics;
  },
};

// ─── AL-ASP: Aspirational vs Operational ───
const alAsp: Rule = {
  id: "AL-ASP",
  category: "clarity",
  severity: "warning",
  description:
    "Flags action directives that have no concrete command, file path, or value — likely aspirational rather than operational",
  check(files) {
    const diagnostics: Diagnostic[] = [];

    // Indicators that a line IS operational (concrete)
    const OPERATIONAL_SIGNALS =
      /`[^`]+`|\/[A-Za-z][\w/.]+|https?:\/\/|\b\d+\b|sessionKey|sessions_spawn|sessions_send|\$[A-Z_]+|\.[a-z]{2,5}\b|→\s*\w+\s*\(|\.sh\b|\.json\b|\.md\b/;

    // Imperative verbs that signal a directive (action)
    const DIRECTIVE_PATTERN =
      /^[-*]\s*(always|never|must|ensure|check|read|write|send|create|run|use|do|don't|avoid|make sure|remember|update|add|remove|notify|report|follow|handle|process|반드시|항상|절대|꼭|확인)/i;

    // ASCII flowchart patterns (entire code blocks that are purely text arrows)
    const FLOWCHART_LINE = /^\s*(↓|→|↑|←|\|)\s*$/;

    const coreFiles = files.filter(
      (f) =>
        !f.name.startsWith("compound/") &&
        !f.name.startsWith("memory/") &&
        f.name.endsWith(".md")
    );

    for (const file of coreFiles) {
      let inCodeBlock = false;
      let flowchartLineCount = 0;
      let flowchartStartLine = -1;

      for (let i = 0; i < file.lines.length; i++) {
        const line = file.lines[i];
        const trimmed = line.trim();

        // Track code blocks
        if (trimmed.startsWith("```")) {
          if (!inCodeBlock) {
            inCodeBlock = true;
            flowchartLineCount = 0;
            flowchartStartLine = i + 1;
          } else {
            // End of code block — if it was a flowchart (mostly arrow lines), flag it
            if (flowchartLineCount >= 3) {
              diagnostics.push({
                severity: "warning",
                category: "clarity",
                rule: this.id,
                file: file.name,
                line: flowchartStartLine,
                message: `[AL-ASP] ASCII flowchart at lines ${flowchartStartLine}–${i + 1} is aspirational. No concrete commands or paths.`,
                fix: "Replace the flowchart with a numbered list of specific commands or file references.",
              });
            }
            inCodeBlock = false;
          }
          continue;
        }

        if (inCodeBlock) {
          if (FLOWCHART_LINE.test(trimmed) || trimmed === "↓" || /^\s*[가-힣a-zA-Z\s]+\s*$/.test(trimmed)) {
            flowchartLineCount++;
          }
          continue;
        }

        // Check directive bullet points without operational content
        if (DIRECTIVE_PATTERN.test(trimmed) && !OPERATIONAL_SIGNALS.test(trimmed)) {
          const words = trimmed.split(/\s+/).length;
          // Only flag if long enough to plausibly be a real directive (not a heading)
          if (words >= 5 && words <= 20) {
            diagnostics.push({
              severity: "warning",
              category: "clarity",
              rule: this.id,
              file: file.name,
              line: i + 1,
              message: `[AL-ASP] Directive with no concrete reference: "${trimmed.substring(0, 80)}". Aspirational?`,
              fix: "Add a specific command, file path, tool name, or value to make this actionable.",
            });
          }
        }
      }
    }
    return diagnostics;
  },
};

// ─── AL-CON: Contradiction Detector ───
const alCon: Rule = {
  id: "AL-CON",
  category: "consistency",
  severity: "error",
  description:
    "Detects same-keyword contradictions within a file (e.g. '항상 해라' vs '절대 하지 마라')",
  check(files) {
    const diagnostics: Diagnostic[] = [];

    // Positive directive patterns (must/always/do)
    const POSITIVE_PATTERNS = [
      /\b(always|must|반드시|항상|꼭)\s+(.{3,40})/i,
    ];
    // Negative directive patterns (never/don't/금지)
    const NEGATIVE_PATTERNS = [
      /\b(never|do not|don't|절대|금지|하지\s*마|하면\s*안)\s+(.{3,40})/i,
    ];

    for (const file of files) {
      if (!file.name.endsWith(".md")) continue;

      type Directive = { text: string; line: number; kw: string[] };
      const positives: Directive[] = [];
      const negatives: Directive[] = [];

      for (let i = 0; i < file.lines.length; i++) {
        const line = file.lines[i];
        // Skip code blocks (simple heuristic)
        if (line.trim().startsWith("```")) continue;

        for (const pat of POSITIVE_PATTERNS) {
          const m = line.match(pat);
          if (m) {
            positives.push({ text: m[2] || line, line: i + 1, kw: keywords(m[2] || line) });
          }
        }
        for (const pat of NEGATIVE_PATTERNS) {
          const m = line.match(pat);
          if (m) {
            negatives.push({ text: m[2] || line, line: i + 1, kw: keywords(m[2] || line) });
          }
        }
      }

      // Cross-check: same keyword cluster, opposite polarity
      const reported = new Set<string>();
      for (const pos of positives) {
        for (const neg of negatives) {
          const shared = pos.kw.filter((w) => neg.kw.includes(w));
          if (shared.length >= 2) {
            const key = `${pos.line}:${neg.line}`;
            if (reported.has(key)) continue;
            reported.add(key);
            diagnostics.push({
              severity: "error",
              category: "consistency",
              rule: this.id,
              file: file.name,
              line: neg.line,
              message: `[AL-CON] Contradiction: "always/must ${pos.text.substring(0, 40)}" (line ${pos.line}) vs "never/금지 ${neg.text.substring(0, 40)}" (line ${neg.line}). Shared keywords: ${shared.slice(0, 3).join(", ")}`,
              fix: "Resolve the contradiction. Pick one directive or add a conditional that explains both cases.",
            });
          }
        }
      }
    }
    return diagnostics;
  },
};

// ─── AL-REF: Dead Reference Detector ───
const alRef: Rule = {
  id: "AL-REF",
  category: "consistency",
  severity: "warning",
  description:
    "Detects compound/xxx.md or skills/xxx/SKILL.md references that point to non-existent files",
  check(files) {
    const diagnostics: Diagnostic[] = [];

    // Build set of known file names (relative paths)
    const knownFiles = new Set(files.map((f) => f.name));

    // Pattern: compound/something.md or skills/something/SKILL.md
    const REF_PATTERN =
      /`?(compound\/[\w\-./]+\.md|skills\/[\w\-./]+\.md)`?/g;

    for (const file of files) {
      if (!file.name.endsWith(".md")) continue;

      for (let i = 0; i < file.lines.length; i++) {
        const line = file.lines[i];
        const matches = line.matchAll(REF_PATTERN);
        for (const m of matches) {
          const refPath = m[1];
          // Normalize: remove leading ./
          const normalized = refPath.replace(/^\.\//, "");
          if (!knownFiles.has(normalized) && !knownFiles.has(refPath)) {
            diagnostics.push({
              severity: "warning",
              category: "consistency",
              rule: this.id,
              file: file.name,
              line: i + 1,
              message: `[AL-REF] Dead reference: "${refPath}" not found in uploaded workspace files.`,
              fix: `Create the file at "${refPath}" or remove/update the reference.`,
            });
          }
        }
      }
    }
    return diagnostics;
  },
};

// ─── AL-PLC: Placeholder Leak ───
const alPlc: Rule = {
  id: "AL-PLC",
  category: "completeness",
  severity: "warning",
  description:
    "Detects unfilled placeholders like YYYY-MM-DD, [내용], {변수} left in agent config files",
  check(files) {
    const diagnostics: Diagnostic[] = [];

    const PLACEHOLDER_PATTERNS: { pattern: RegExp; label: string }[] = [
      // Date placeholder (not inside a filename pattern like memory/YYYY-MM-DD.md)
      {
        pattern: /(?<![\w/])YYYY-MM-DD(?!\.md\b)/g,
        label: "YYYY-MM-DD (unfilled date)",
      },
      // Square bracket placeholders
      {
        pattern: /\[내용\]|\[content\]|\[TODO\]|\[FIXME\]|\[작성\]|\[여기\]|\[placeholder\]/gi,
        label: "square-bracket placeholder",
      },
      // Curly brace placeholders (but not template literals like ${var} in code)
      {
        pattern: /(?<!\$)\{[가-힣A-Za-z_][가-힣A-Za-z0-9_]*\}(?!\s*[:{])/g,
        label: "curly-brace placeholder",
      },
      // Generic YOUR_ or ENTER_ patterns
      {
        pattern: /\bYOUR_[A-Z_]+\b|\bENTER_[A-Z_]+\b|\bINSERT_[A-Z_]+\b/g,
        label: "YOUR_/ENTER_/INSERT_ placeholder",
      },
      // Korean unfilled markers
      {
        pattern: /\[미정\]|\[TBD\]|\[추후\s*결정\]/gi,
        label: "TBD placeholder",
      },
    ];

    // Skip files that are templates or example files
    const SKIP_FILES = /template|example|sample|보일러|scaffold/i;

    for (const file of files) {
      if (!file.name.endsWith(".md")) continue;
      if (SKIP_FILES.test(file.name)) continue;

      for (let i = 0; i < file.lines.length; i++) {
        const line = file.lines[i];
        // Skip code fence lines themselves (but not content inside)
        if (line.trim() === "```" || line.trim().startsWith("```")) continue;

        for (const { pattern, label } of PLACEHOLDER_PATTERNS) {
          // Reset lastIndex for global patterns
          pattern.lastIndex = 0;
          if (pattern.test(line)) {
            diagnostics.push({
              severity: "warning",
              category: "completeness",
              rule: this.id,
              file: file.name,
              line: i + 1,
              message: `[AL-PLC] Unfilled placeholder (${label}): "${line.trim().substring(0, 80)}"`,
              fix: "Replace the placeholder with the actual value, or remove the line if not applicable.",
            });
            break; // one per line
          }
        }
      }
    }
    return diagnostics;
  },
};

// ─── Export ───
export const advancedRules: Rule[] = [alStl, alDup, alGen, alAsp, alCon, alRef, alPlc];
