/* ─── .claudeignore Best Practices Checker ─── */

import { Rule, Diagnostic } from "../types";
import { RECOMMENDED_CLAUDEIGNORE_PATTERNS } from "../budget";

export const claudeIgnoreRules: Rule[] = [
  {
    id: "best-practices/claude-ignore-missing",
    category: "completeness",
    severity: "warning",
    description: ".claudeignore file is missing. This can cause large files to be included unnecessarily.",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const hasClaudeIgnore = files.some((f) => f.name === ".claudeignore");

      if (!hasClaudeIgnore) {
        diagnostics.push({
          severity: "warning",
          category: "completeness",
          rule: this.id,
          file: "workspace root",
          message:
            "No .claudeignore file found. Create one to exclude large/irrelevant files from Claude Code analysis. Recommended patterns: " +
            RECOMMENDED_CLAUDEIGNORE_PATTERNS.join(", "),
          fix: `Create .claudeignore with recommended patterns:\n${RECOMMENDED_CLAUDEIGNORE_PATTERNS.map((p) => p).join("\n")}`,
        });
      }

      return diagnostics;
    },
  },
  {
    id: "best-practices/claude-ignore-patterns",
    category: "completeness",
    severity: "info",
    description: ".claudeignore is missing some recommended patterns for optimization.",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const claudeIgnoreFile = files.find((f) => f.name === ".claudeignore");

      if (claudeIgnoreFile) {
        const content = claudeIgnoreFile.content;
        const missing = RECOMMENDED_CLAUDEIGNORE_PATTERNS.filter(
          (pattern) => !content.includes(pattern)
        );

        if (missing.length > 0) {
          diagnostics.push({
            severity: "info",
            category: "completeness",
            rule: this.id,
            file: ".claudeignore",
            message: `Missing ${missing.length} recommended patterns: ${missing.join(", ")}`,
            fix: `Add these lines to .claudeignore:\n${missing.join("\n")}`,
          });
        }
      }

      return diagnostics;
    },
  },
];
