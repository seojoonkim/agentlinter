/* ─── Rule: skills-vs-commands ─── */

import { Rule, Diagnostic } from "../types";

export const skillsVsCommandsRules: Rule[] = [
  {
    id: "claude-code/skills-vs-commands",
    category: "runtime",
    severity: "warning",
    description:
      "Detect deprecated .claude/commands/ usage — migrate to .claude/skills/",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      const hasCommands = files.some(
        (f) =>
          f.name.startsWith(".claude/commands/") ||
          f.name.includes("claude/commands/")
      );
      const hasSkills = files.some(
        (f) =>
          f.name.startsWith(".claude/skills/") ||
          f.name.includes("claude/skills/")
      );

      if (hasCommands) {
        diagnostics.push({
          severity: "warning",
          category: "runtime",
          rule: "claude-code/skills-vs-commands",
          file: ".claude/commands/",
          message: `Deprecated .claude/commands/ detected. Claude Code (Feb 2026+) uses .claude/skills/ instead.`,
          fix: hasSkills
            ? "Remove .claude/commands/ — you already have .claude/skills/"
            : "Rename .claude/commands/ to .claude/skills/ and update SKILL.md format",
        });
      }

      // Check for references to deprecated path in markdown files
      for (const file of files) {
        if (!file.name.endsWith(".md")) continue;
        let codeBlockOpen = false;
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];
          if (line.trim().startsWith("```")) {
            codeBlockOpen = !codeBlockOpen;
          }
          if (codeBlockOpen) continue;

          if (/\.claude\/commands\//i.test(line)) {
            diagnostics.push({
              severity: "info",
              category: "runtime",
              rule: "claude-code/skills-vs-commands",
              file: file.name,
              line: i + 1,
              message: `Reference to deprecated .claude/commands/ path`,
              fix: "Update reference to .claude/skills/",
            });
          }
        }
      }

      return diagnostics;
    },
  },
];
