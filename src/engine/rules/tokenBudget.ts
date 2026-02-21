/* ─── Token Budget Checker ─── */
/* Warns when CLAUDE.md/AGENTS.md has too many instructions for LLM to follow */

import { Rule, Diagnostic } from "../types";

/** Count instruction-like lines: bullets, numbered lists, imperative sentences */
function countInstructions(content: string): number {
  const lines = content.split("\n");
  let count = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    // Bullet points
    if (/^[-*•]\s+\S/.test(trimmed)) { count++; continue; }
    // Numbered lists
    if (/^\d+[\.\)]\s+\S/.test(trimmed)) { count++; continue; }
    // Imperative sentences (starts with verb-like word, ends with period or no punctuation)
    if (/^(Do|Don't|Don't|Never|Always|Must|Should|Ensure|Check|Run|Use|Add|Set|Keep|Make|Avoid|Read|Write|Update|Create|Delete|Send|Start|Stop|Configure|Enable|Disable|Install|Remove|Follow|Include|Exclude|Review|Test|Deploy|Build|Push|Pull|Commit|Merge)\b/i.test(trimmed) && trimmed.length > 10) {
      count++;
    }
  }
  return count;
}

function estimateTokens(content: string): number {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.round(words * 1.3);
}

export const tokenBudgetRules: Rule[] = [
  {
    id: "token-budget/instruction-limit",
    category: "clarity",
    severity: "warning",
    description: "Agent config files should stay within LLM instruction budget (~150-200 instructions, ~3000-5000 tokens)",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const configFiles = files.filter(
        (f) => /^(CLAUDE|AGENTS|RULES)\.md$/i.test(f.name) || f.name === "AGENTS.md"
      );

      for (const file of configFiles) {
        const instructions = countInstructions(file.content);
        const tokens = estimateTokens(file.content);

        if (tokens > 5000 || instructions > 200) {
          diagnostics.push({
            severity: "error",
            category: "clarity",
            rule: this.id,
            file: file.name,
            message: `Token budget exceeded — ${tokens} estimated tokens, ${instructions} instructions. LLM will silently ignore rules beyond this limit.`,
            fix: "Split into smaller files (SKILL.md, compound files) or use conditional loading. Keep core instructions under 200 / 5000 tokens.",
          });
        } else if (tokens > 3000 || instructions > 150) {
          diagnostics.push({
            severity: "warning",
            category: "clarity",
            rule: this.id,
            file: file.name,
            message: `Token budget approaching limit — ${tokens} estimated tokens, ${instructions} instructions. LLM may silently ignore some rules.`,
            fix: "Consider splitting into smaller files. Move task-specific instructions to SKILL.md or conditional loading.",
          });
        }
      }
      return diagnostics;
    },
  },
];
