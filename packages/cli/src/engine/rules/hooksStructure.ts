/* ─── Rule: hooks-structure ─── */

import { Rule, Diagnostic } from "../types";

const VALID_EVENTS = [
  "PreToolUse",
  "PostToolUse",
  "Stop",
  "SubagentStop",
  "Notification",
];

export const hooksStructureRules: Rule[] = [
  {
    id: "claude-code/hooks-structure",
    category: "runtime",
    severity: "warning",
    description: "Validate .claude/hooks configuration structure",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      for (const file of files) {
        const isHooksFile =
          file.name.includes("hooks") ||
          file.name === ".claude/settings.json" ||
          file.name.endsWith("settings.json");

        if (!isHooksFile) continue;

        // Check for invalid event names (CamelCase words that don't match valid events)
        const eventMatches = [
          ...file.content.matchAll(
            /["']?(PreToolUse|PostToolUse|Stop|SubagentStop|Notification|[A-Z][a-zA-Z]+)["']?\s*[:=]/g
          ),
        ];

        for (const match of eventMatches) {
          const eventName = match[1];
          if (!VALID_EVENTS.includes(eventName) && /^[A-Z]/.test(eventName)) {
            // Skip common JSON keys that happen to be PascalCase but aren't hook events
            const skipWords = ["Claude", "Model", "Type", "Name", "Command", "Path", "Config", "Settings"];
            if (skipWords.some((w) => eventName.startsWith(w))) continue;

            diagnostics.push({
              severity: "warning",
              category: "runtime",
              rule: "claude-code/hooks-structure",
              file: file.name,
              message: `Unknown hook event "${eventName}". Valid events: ${VALID_EVENTS.join(", ")}`,
              fix: `Use one of: ${VALID_EVENTS.join(", ")}`,
            });
          }
        }

        // For JSON hook files: check that hook entries have "command" field
        if (file.name.endsWith(".json")) {
          try {
            const parsed = JSON.parse(file.content);
            const hooks = parsed?.hooks;
            if (hooks && typeof hooks === "object") {
              for (const [eventName, entries] of Object.entries(hooks)) {
                const hookList = Array.isArray(entries) ? entries : [entries];
                for (const hook of hookList as Record<string, unknown>[]) {
                  if (hook && typeof hook === "object" && !hook.command) {
                    diagnostics.push({
                      severity: "error",
                      category: "runtime",
                      rule: "claude-code/hooks-structure",
                      file: file.name,
                      message: `Hook entry for "${eventName}" is missing required "command" field`,
                      fix: `Add "command": "<shell-command>" to the hook definition`,
                    });
                  }
                }
              }
            }
          } catch {
            // Not valid JSON or no hooks — skip
          }
        }
      }

      return diagnostics;
    },
  },
];
