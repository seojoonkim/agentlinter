/* ─── Rule: progressive-disclosure ─── */

import { Rule, Diagnostic } from "../types";

export const progressiveDisclosureRules: Rule[] = [
  {
    id: "claude-code/progressive-disclosure",
    category: "structure",
    severity: "warning",
    description: "Long CLAUDE.md should be modularized into .claude/rules/",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const claudeMd = files.find((f) => f.name === "CLAUDE.md");
      if (!claudeMd) return diagnostics;

      const lineCount = claudeMd.lines.length;
      const hasRulesDir = files.some((f) => f.name.startsWith(".claude/rules/"));

      // Error: extremely long CLAUDE.md
      if (lineCount > 200) {
        diagnostics.push({
          severity: "error",
          category: "structure",
          rule: "claude-code/progressive-disclosure",
          file: "CLAUDE.md",
          message: `CLAUDE.md is ${lineCount} lines — extremely long. Claude Code may not process all instructions effectively.`,
          fix: "Keep CLAUDE.md under 150 lines. Move details to .claude/rules/*.md",
        });
      } else if (lineCount > 50 && !hasRulesDir) {
        // Warning: long without modularization
        diagnostics.push({
          severity: "warning",
          category: "structure",
          rule: "claude-code/progressive-disclosure",
          file: "CLAUDE.md",
          message: `CLAUDE.md is ${lineCount} lines but no .claude/rules/ directory found. Long monolithic configs reduce signal-to-noise ratio.`,
          fix: "Split into modular .claude/rules/*.md files for better context loading",
        });
      }

      return diagnostics;
    },
  },
];
