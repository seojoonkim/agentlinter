/* ─── Token Efficiency Score Rules ─── */
// Grades files by line count: A (≤150), B (≤300), C (≤500), D (>500)

import { Rule, Diagnostic } from "../types";

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

export const tokenEfficiencyRules: Rule[] = [
  {
    id: "clarity/token-efficiency-score",
    category: "clarity",
    severity: "warning",
    description:
      "Grades each agent file by line count to ensure token efficiency (A≤150, B≤300, C≤500, D>500)",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      for (const file of files) {
        const lineCount = file.lines.length;
        // Skip very small helper files
        if (lineCount < 5) continue;

        const { grade, severity, message, fix } = getGrade(lineCount);

        // Only report if grade is B or worse (C, D get warnings/errors; A only if explicitly checking)
        if (grade === "A") {
          diagnostics.push({
            severity: "info",
            category: "clarity",
            rule: this.id,
            file: file.name,
            line: undefined,
            message,
            fix,
          });
        } else {
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
      }

      return diagnostics;
    },
  },
];
