/* ─── Position Risk Warning Rules ─── */
// Detects critical rules buried in the middle (20-80%) of a file

import { Rule, Diagnostic } from "../types";

const CRITICAL_KEYWORDS = [
  /절대/,
  /금지/,
  /CRITICAL/i,
  /반드시/,
  /never/i,
  /always/i,
  /must\s+not/i,
  /do\s+not/i,
  /forbidden/i,
  /mandatory/i,
  /required/i,
  /important/i,
  /WARNING/,
  /danger/i,
  /prohibited/i,
];

export const positionRiskRules: Rule[] = [
  {
    id: "structure/position-risk-warning",
    category: "structure",
    severity: "warning",
    description:
      "Critical rules buried in the middle of a file (20-80%) are easy to miss. Place them near the top.",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const targetFiles = files.filter(
        (f) => !f.name.startsWith("compound/") && !f.name.startsWith("memory/") && f.name.endsWith(".md")
      );

      for (const file of targetFiles) {
        const total = file.lines.length;
        if (total < 10) continue;

        const startLine = Math.floor(total * 0.2);
        const endLine = Math.floor(total * 0.8);

        for (let i = startLine; i < endLine; i++) {
          const line = file.lines[i];

          const isHeading = /^#{1,4}\s/.test(line);
          if (!isHeading) continue;

          const hasCriticalKeyword = CRITICAL_KEYWORDS.some((kw) => kw.test(line));
          if (!hasCriticalKeyword) continue;

          diagnostics.push({
            severity: "warning",
            category: "structure",
            rule: this.id,
            file: file.name,
            line: i + 1,
            message: `Critical rule section "${line.trim()}" is buried at ${Math.round(((i + 1) / total) * 100)}% of the file — agents may not read it.`,
            fix: "Move critical rules (CRITICAL/금지/절대/never/always) to the top 20% of the file so agents always see them first. Consider a dedicated '🚨 CRITICAL RULES' section at the very top.",
          });
        }
      }

      return diagnostics;
    },
  },
];
