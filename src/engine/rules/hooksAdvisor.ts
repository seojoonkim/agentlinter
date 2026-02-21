/* ─── Claude Code Hooks Advisor ─── */
/* Suggests Claude Code Hooks when CLAUDE.md has enforceable rules but no hooks configured */

import { Rule, Diagnostic } from "../types";

const ENFORCEABLE_PATTERNS = [
  { pattern: /\b(?:run|execute)\s+(?:tests?|lint|linter|format|formatter|check)\b/i, label: "test/lint/format" },
  { pattern: /\b(?:always|must|should)\s+(?:run|execute)\s+\w+\s+(?:before|after)\b/i, label: "pre/post action" },
  { pattern: /\bnpx?\s+(?:tsc|eslint|prettier|vitest|jest)\b/i, label: "tool invocation" },
  { pattern: /\b(?:before|after)\s+(?:commit|push|merge|deploy)\b/i, label: "git hook pattern" },
  { pattern: /\bformat\s+(?:code|files?|on\s+save)\b/i, label: "auto-format" },
  { pattern: /\b(?:type[- ]?check|typecheck)\b/i, label: "type checking" },
];

export const hooksAdvisorRules: Rule[] = [
  {
    id: "hooks-advisor/suggest-hooks",
    category: "runtime",
    severity: "info",
    description: "Suggests Claude Code Hooks for automatically enforcing rules found in CLAUDE.md",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      // Check if .claude/settings.json exists with hooks
      const settingsFile = files.find(
        (f) => f.name === ".claude/settings.json" || f.name.endsWith(".claude/settings.json")
      );
      const hasHooks = settingsFile?.content?.includes('"hooks"');
      if (hasHooks) return diagnostics; // Already configured

      const configFiles = files.filter(
        (f) => /^(CLAUDE|AGENTS)\.md$/i.test(f.name)
      );

      const foundLabels = new Set<string>();
      for (const file of configFiles) {
        for (const line of file.lines) {
          for (const { pattern, label } of ENFORCEABLE_PATTERNS) {
            if (pattern.test(line)) foundLabels.add(label);
          }
        }
      }

      if (foundLabels.size > 0) {
        const labels = Array.from(foundLabels).join(", ");
        diagnostics.push({
          severity: "info",
          category: "runtime",
          rule: this.id,
          file: configFiles[0]?.name ?? "CLAUDE.md",
          message: `Found enforceable rules (${labels}) but no Claude Code Hooks configured. Hooks can auto-enforce these.`,
          fix: `Add .claude/settings.json with hooks. Example:\n{\n  "hooks": {\n    "PostToolUse": [{\n      "matcher": "write|edit",\n      "hooks": [{\n        "type": "command",\n        "command": "npx tsc --noEmit 2>&1 | head -20"\n      }]\n    }]\n  }\n}`,
        });
      }
      return diagnostics;
    },
  },
];
