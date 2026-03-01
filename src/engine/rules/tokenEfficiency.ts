/* ─── Token Efficiency Score (v1.1.0) ─── */
// Shorter files = faster reads and lower token cost.
// Grade each file by line count: A (≤150), B (≤300), C (≤500), D (>500).

import { Rule, Diagnostic } from "../types";

function grade(lines: number): { grade: string; severity: "info" | "warning" | "error" } {
  if (lines <= 150) return { grade: "A", severity: "info" };
  if (lines <= 300) return { grade: "B", severity: "info" };
  if (lines <= 500) return { grade: "C", severity: "warning" };
  return { grade: "D", severity: "error" };
}

export const tokenEfficiencyRules: Rule[] = [
  {
    id: "clarity/token-efficiency-score",
    category: "clarity",
    severity: "info",
    description:
      "Token Efficiency Score: grades files by line count. A (≤150 lines), B (≤300), C (≤500), D (>500). Shorter files load faster and reduce LLM context cost.",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      for (const file of files) {
        const total = file.lines.length;
        const { grade: g, severity } = grade(total);

        if (g === "A") {
          // Grade A is fine — emit info only for B/C/D
          continue;
        }

        const hint =
          g === "B"
            ? "Consider splitting into sub-files (e.g. move examples to docs/, move logs to memory/)."
            : g === "C"
            ? "File is getting long. Extract sections into dedicated files (services.md, progress.md, etc.) and reference them."
            : "File is very large. This increases token cost on every session load. Aggressively archive old content, split into modules, and keep the main file to core runtime instructions only.";

        diagnostics.push({
          severity,
          category: "clarity",
          rule: this.id,
          file: file.name,
          message: `Token Efficiency: Grade ${g} — ${total} lines. ${
            g === "B" ? "Acceptable but could be leaner." :
            g === "C" ? "Getting bulky; consider splitting." :
            "Too long; high token cost every session."
          }`,
          fix: hint,
        });
      }

      return diagnostics;
    },
  },
];
