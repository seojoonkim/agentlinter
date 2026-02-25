/* ─── Rule: agent-focus ─── */

import { Rule, Diagnostic } from "../types";

export const agentFocusRules: Rule[] = [
  {
    id: "claude-code/agent-focus",
    category: "clarity",
    severity: "warning",
    description: "Detect overly broad subagent definitions",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      // Check .claude/agents/ files
      const agentFiles = files.filter(
        (f) =>
          (f.name.includes("agents/") || f.name.includes("agent/")) &&
          f.name.endsWith(".md")
      );

      for (const file of agentFiles) {
        // Count responsibility/task bullet points
        const roleLines = file.lines.filter(
          (l) =>
            /^[-*+]\s+\S/.test(l.trim()) ||
            /^\d+[.)]\s+\S/.test(l.trim())
        );

        if (roleLines.length > 30) {
          diagnostics.push({
            severity: "warning",
            category: "clarity",
            rule: "claude-code/agent-focus",
            file: file.name,
            message: `Agent definition has ${roleLines.length} responsibility items. Focused agents (10-15 responsibilities) perform better than broad ones.`,
            fix: "Split into multiple specialized agents or use skills for specific capabilities",
          });
        }

        // Check for too many top-level sections (unfocused scope)
        const h2Sections = file.sections.filter((s) => s.level === 2);
        if (h2Sections.length > 8) {
          diagnostics.push({
            severity: "info",
            category: "clarity",
            rule: "claude-code/agent-focus",
            file: file.name,
            message: `Agent has ${h2Sections.length} top-level H2 sections — may be trying to do too much (${h2Sections.map((s) => s.heading).join(", ")})`,
            fix: "Consider splitting responsibilities across multiple specialized agents",
          });
        }
      }

      return diagnostics;
    },
  },
];
