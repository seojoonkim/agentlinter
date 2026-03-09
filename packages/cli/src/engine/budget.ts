/* ─── Context Window Budget Estimator ─── */

import { FileInfo } from "./types";
import { countInstructions } from "./rules/instructionCount";

export interface BudgetReport {
  /** Fixed system-level instructions reserved by Claude Code (~50) */
  systemReserved: number;
  /** Instructions in CLAUDE.md / AGENTS.md */
  claudeMdCount: number;
  /** Instructions in .claude/rules/ files */
  rulesCount: number;
  /** Instructions in .claude/agents/ files */
  agentsCount: number;
  /** Instructions in .claude/skills/ files */
  skillsCount: number;
  /** Total including system reserved */
  totalCount: number;
  /** Recommended user instruction limit */
  limit: number;
  /** Percentage of user budget consumed (0-100+) */
  percentage: number;
  /** Budget health status */
  status: "ok" | "warning" | "over";
}

/**
 * Estimate the instruction budget usage for a workspace.
 */
export function estimateBudget(files: FileInfo[]): BudgetReport {
  const SYSTEM_RESERVED = 50;
  const LIMIT = 150;

  const claudeMdFiles = files.filter(
    (f) => f.name === "CLAUDE.md" || f.name === "AGENTS.md"
  );
  const rulesFiles = files.filter((f) => f.name.startsWith(".claude/rules/"));
  const agentsFiles = files.filter((f) => f.name.startsWith(".claude/agents/"));
  const skillsFiles = files.filter((f) => f.name.startsWith(".claude/skills/"));

  const claudeMdCount = claudeMdFiles.reduce(
    (s, f) => s + countInstructions(f.content),
    0
  );
  const rulesCount = rulesFiles.reduce(
    (s, f) => s + countInstructions(f.content),
    0
  );
  const agentsCount = agentsFiles.reduce(
    (s, f) => s + countInstructions(f.content),
    0
  );
  const skillsCount = skillsFiles.reduce(
    (s, f) => s + countInstructions(f.content),
    0
  );

  // Only count non-skills files against the hard limit
  // Skills are on-demand loaded and should not cause over-limit
  const coreTotal = claudeMdCount + rulesCount + agentsCount;
  const userTotal = coreTotal + skillsCount;
  const totalCount = SYSTEM_RESERVED + userTotal;
  const percentage = Math.round((coreTotal / LIMIT) * 100);

  return {
    systemReserved: SYSTEM_RESERVED,
    claudeMdCount,
    rulesCount,
    agentsCount,
    skillsCount,
    totalCount,
    limit: LIMIT,
    percentage,
    status: percentage >= 100 ? "over" : percentage >= 80 ? "warning" : "ok",
  };
}

/**
 * Format a BudgetReport as a human-readable terminal string.
 */
export function formatBudgetReport(report: BudgetReport): string {
  const statusIcon =
    report.status === "over"
      ? "🔴"
      : report.status === "warning"
        ? "⚠️ "
        : "✅";

  const coreTotal =
    report.claudeMdCount +
    report.rulesCount +
    report.agentsCount;

  const statusText =
    report.status === "over"
      ? "Over limit!"
      : report.status === "warning"
        ? `Near limit (${report.percentage}%)`
        : `OK (${report.percentage}%)`;

  const divider = "─".repeat(42);

  return [
    "📊 Context Window Budget",
    `  System reserved:    ~${report.systemReserved} instructions (fixed)`,
    `  CLAUDE.md/AGENTS.md: ${report.claudeMdCount} instructions`,
    report.rulesCount > 0
      ? `  .claude/rules/:     ${report.rulesCount} instructions`
      : null,
    report.agentsCount > 0
      ? `  .claude/agents/:    ${report.agentsCount} instructions`
      : null,
    `  ${divider}`,
    `  Core total: ${coreTotal}/${report.limit}  ${statusIcon} ${statusText}`,
    report.skillsCount > 0
      ? `  .claude/skills/:    ${report.skillsCount} instructions (on-demand, not counted against limit)`
      : null,
  ]
    .filter((l) => l !== null)
    .join("\n");
}
