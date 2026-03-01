/* ─── Position Risk Warning (v1.1.0) ─── */
// Critical rules buried in the middle of a file (lines 20%–80%) are
// easy to miss. Important instructions should be near the top (≤20%)
// or — with justification — near the bottom (≥80%).

import { Rule, Diagnostic } from "../types";

const CRITICAL_KEYWORDS =
  /절대|금지|CRITICAL|반드시|never|always|MUST\s*NOT|MUST\s*NEVER|DO\s*NOT|FORBIDDEN|STRICT/i;

export const positionRiskRules: Rule[] = [
  {
    id: "clarity/position-risk-warning",
    category: "clarity",
    severity: "warning",
    description:
      "Critical rules (절대/금지/CRITICAL/반드시/never/always) found in the middle section (20–80%) of a file are easy to overlook. Move them to the top.",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      for (const file of files) {
        const total = file.lines.length;
        if (total < 10) continue;

        const start = Math.floor(total * 0.20);
        const end = Math.floor(total * 0.80);

        for (let i = start; i < end; i++) {
          const line = file.lines[i];
          if (CRITICAL_KEYWORDS.test(line)) {
            diagnostics.push({
              severity: "warning",
              category: "clarity",
              rule: this.id,
              file: file.name,
              line: i + 1,
              message: `Critical rule buried in middle of file (line ${i + 1}/${total}, ${Math.round(((i + 1) / total) * 100)}%). LLMs read top-down; rules here may be deprioritized.`,
              fix: "Move critical rules to a ## CRITICAL RULES section near the top of the file (within the first 20% of lines). Use bold/emoji to increase salience.",
            });
          }
        }
      }

      return diagnostics;
    },
  },
];
