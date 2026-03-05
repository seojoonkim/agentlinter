/* ─── Rule: instruction-count ─── */

import { Rule, Diagnostic } from "../types";

/** Count instruction-like lines in markdown content */
export function countInstructions(content: string): number {
  const lines = content.split("\n");
  let count = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip code blocks, HTML comments, empty lines
    if (!trimmed || trimmed.startsWith("```") || trimmed.startsWith("<!--")) continue;
    // Bullet points: - , * , + (not headings)
    if (/^[-*+]\s+\S/.test(trimmed)) { count++; continue; }
    // Numbered lists: 1. , 2. etc
    if (/^\d+[.)]\s+\S/.test(trimmed)) { count++; continue; }
    // Imperative sentences / directives
    if (/^(Do|Don't|Don't|Never|Always|Use|Avoid|Keep|Make|Set|Run|Check|Ensure|Follow|Include|Write|Read|Create|Delete|Add|Remove|Update|Prefer|Remember|Note|Must|Should|Shall)\b/i.test(trimmed)) {
      count++; continue;
    }
  }
  return count;
}

export const instructionCountRules: Rule[] = [
  {
    id: "claude-code/instruction-count",
    category: "clarity",
    severity: "warning",
    description: "Too many instructions may exceed Claude Code's effective context",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      const ALWAYS_LOADED = new Set(["CLAUDE.md", "AGENTS.md", "SOUL.md", "IDENTITY.md", "USER.md"]);

      // Count across core agent config files only (not memory, compound, or skills)
      const coreFiles = files.filter(
        (f) =>
          !f.name.startsWith("memory/") &&
          !f.name.startsWith("compound/") &&
          !f.name.startsWith("skills/") &&
          !f.name.startsWith(".claude/skills/") &&
          !f.name.startsWith("claude/skills/") &&
          (f.name.endsWith(".md") || f.name.endsWith(".txt"))
      );

      let alwaysLoadedTotal = 0;
      let otherCoreTotal = 0;
      const perFile: { name: string; count: number }[] = [];

      for (const file of coreFiles) {
        const count = countInstructions(file.content);
        perFile.push({ name: file.name, count });
        if (ALWAYS_LOADED.has(file.name)) {
          alwaysLoadedTotal += count;
        } else {
          otherCoreTotal += count;
        }
      }

      // Always-loaded files: 150 limit (error)
      if (alwaysLoadedTotal >= 150) {
        const topFiles = perFile
          .filter((f) => ALWAYS_LOADED.has(f.name))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3)
          .map((f) => `${f.name}(${f.count})`)
          .join(", ");
        diagnostics.push({
          severity: "error",
          category: "clarity",
          rule: "claude-code/instruction-count",
          file: "workspace",
          message: `${alwaysLoadedTotal} instructions in always-loaded files (${topFiles}). Claude Code reserves ~50 instructions internally, leaving ~100-150 for your config. You are over the reliable limit.`,
          fix: "Split instructions into .claude/rules/*.md files for context-aware loading",
        });
      } else if (alwaysLoadedTotal >= 100) {
        diagnostics.push({
          severity: "warning",
          category: "clarity",
          rule: "claude-code/instruction-count",
          file: "workspace",
          message: `${alwaysLoadedTotal} instructions in always-loaded files. Claude Code reserves ~50 instructions internally (budget: ${alwaysLoadedTotal}/150). Consider splitting into .claude/rules/*.md`,
          fix: "Move context-specific rules to .claude/rules/{context}.md",
        });
      }

      // Other core files: 350 limit (warning)
      if (otherCoreTotal >= 350) {
        const topFiles = perFile
          .filter((f) => !ALWAYS_LOADED.has(f.name))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3)
          .map((f) => `${f.name}(${f.count})`)
          .join(", ");
        diagnostics.push({
          severity: "warning",
          category: "clarity",
          rule: "claude-code/instruction-count",
          file: "workspace",
          message: `${otherCoreTotal} instructions in auxiliary core files (${topFiles}). Consider consolidating or archiving less-used files.`,
          fix: "Move infrequently-used instructions to compound/ or archive them.",
        });
      }

      return diagnostics;
    },
  },
];
