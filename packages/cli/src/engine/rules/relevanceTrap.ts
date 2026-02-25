/* ─── Rule: relevance-trap ─── */

import { Rule, Diagnostic } from "../types";

// Patterns that indicate context-specific instructions
// (likely to be filtered out by Claude Code's relevance filter)
const SPECIFIC_PATH_RE = /(?:src\/|lib\/|app\/|pages\/|components\/|api\/)[a-zA-Z0-9_/.-]+\.[a-zA-Z]+/;
const SPECIFIC_FILE_RE = /(?:when editing|in file|for file|only in|specific to)\s+[`"]?[a-zA-Z0-9_/.-]+\.[a-zA-Z]+/i;
const CONDITIONAL_CONTEXT_RE = /(?:if working on|when (?:using|modifying|touching|editing)|only for)\s+(?:the\s+)?[a-zA-Z0-9_/.-]+/i;
const FRAMEWORK_SPECIFIC_RE = /(?:in (?:Next\.js|React|Vue|Svelte|Django|Rails|Express|FastAPI|Nuxt|Remix|Astro)(?:\s+(?:projects?|apps?|code))?)/i;

export const relevanceTrapRules: Rule[] = [
  {
    id: "claude-code/relevance-trap",
    category: "clarity",
    severity: "warning",
    description:
      "Context-specific instructions in CLAUDE.md may be ignored due to Claude Code's relevance filter",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      // Only check root-level agent config files that get system-reminder wrapped
      const rootFiles = files.filter(
        (f) => f.name === "CLAUDE.md" || f.name === "AGENTS.md"
      );

      for (const file of rootFiles) {
        const inCodeBlock: boolean[] = [];
        let codeBlockOpen = false;

        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];

          // Track code blocks — don't flag lines inside code blocks
          if (line.trim().startsWith("```")) {
            codeBlockOpen = !codeBlockOpen;
          }
          inCodeBlock[i] = codeBlockOpen;
          if (codeBlockOpen || line.trim().startsWith("```")) continue;

          const patterns = [
            { re: SPECIFIC_PATH_RE, reason: "specific file path" },
            { re: SPECIFIC_FILE_RE, reason: "file-conditional instruction" },
            { re: CONDITIONAL_CONTEXT_RE, reason: "context-conditional instruction" },
            { re: FRAMEWORK_SPECIFIC_RE, reason: "framework-specific instruction" },
          ];

          for (const { re, reason } of patterns) {
            if (re.test(line)) {
              diagnostics.push({
                severity: "warning",
                category: "clarity",
                rule: "claude-code/relevance-trap",
                file: file.name,
                line: i + 1,
                message: `Potentially context-specific instruction (${reason}): "${line.trim().substring(0, 80)}". Claude Code wraps CLAUDE.md in a relevance filter — this may be silently ignored.`,
                fix: "Move to .claude/rules/{specific-context}.md where it will only load when relevant",
              });
              break; // Only report one pattern match per line
            }
          }
        }
      }

      return diagnostics;
    },
  },
];
