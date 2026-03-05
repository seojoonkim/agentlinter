/* ─── Rule: skills-vs-commands ─── */

import { Rule, Diagnostic } from "../types";

/* ─── Descriptive vs Imperative analysis ─── */

const IMPERATIVE_STARTERS = /^(use|run|always|never|do|don't|don't|set|add|create|remove|delete|ensure|avoid|keep|make|write|install|configure|check|update|include|exclude|apply|follow|implement|test|deploy|build|push|pull|call|handle|throw|return|import|export)\b/i;
const DESCRIPTIVE_STARTERS = /^(the|this|it|that|these|those|is|are|was|were|has|have|had|a|an|our|we|you|there)\b/i;

function analyzeDescriptiveRatio(lines: string[]): { total: number; descriptive: number } {
  let total = 0;
  let descriptive = 0;
  let codeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      codeBlock = !codeBlock;
      continue;
    }
    if (codeBlock) continue;

    const trimmed = line.trim();
    // Skip headings, empty lines, list markers only, code refs
    if (!trimmed || trimmed.startsWith("#") || trimmed === "-" || trimmed === "*") continue;

    // Strip list markers
    const content = trimmed.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "");
    if (content.length < 10) continue; // skip very short lines

    total++;
    if (DESCRIPTIVE_STARTERS.test(content)) {
      descriptive++;
    }
  }

  return { total, descriptive };
}

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

  // v2.1: descriptive-ratio — descriptive vs imperative sentence ratio
  {
    id: "claude-code/descriptive-ratio",
    category: "clarity",
    severity: "warning",
    description:
      "Analyzes descriptive vs imperative sentence ratio. Agent instruction files work best with imperative (command) style.",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      for (const file of files) {
        if (!file.name.endsWith(".md")) continue;

        const { total, descriptive } = analyzeDescriptiveRatio(file.lines);
        if (total < 10) continue; // skip tiny files

        const ratio = Math.round((descriptive / total) * 100);

        if (ratio > 60) {
          diagnostics.push({
            severity: "warning",
            category: "clarity",
            rule: this.id,
            file: file.name,
            message: `Descriptive statements are ${ratio}% of content (${descriptive}/${total} sentences). Agent files are more effective with imperative style.`,
            fix: `Convert descriptive sentences to commands. Example: "The system does X" -> "Do X". "This project uses Y" -> "Use Y".`,
          });
        }
      }

      return diagnostics;
    },
  },
];
