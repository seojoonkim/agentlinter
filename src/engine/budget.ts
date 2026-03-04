/* ─── Context Window Budget Estimator ─── */

import { FileInfo } from "./types";
import { countInstructions } from "./rules/instructionCount";

/** Recommended patterns for .claudeignore */
export const RECOMMENDED_CLAUDEIGNORE_PATTERNS = [
  "node_modules/",
  ".git/",
  "dist/",
  ".next/",
  "*.lock",
  "*.log",
  "coverage/",
  ".env*",
  "__pycache__/",
];

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
  /** Total estimated tokens across all files */
  totalTokens: number;
  /** Recommended token limit */
  tokenLimit: number;
  /** Token usage percentage (0-100+) */
  tokenPercentage: number;
  /** Token budget health status */
  tokenStatus: "ok" | "warning" | "over";
  /** Estimated token savings if modularized (.claude/rules/ split, ~30% reduction) */
  savingsIfModular: number;
  /** Savings percentage */
  savingsPct: number;
  /** Whether .claudeignore file exists in workspace */
  hasClaudeIgnore: boolean;
  /** Recommended .claudeignore patterns not yet present */
  claudeIgnoreRecommendations: string[];
}

/** Estimate tokens: words * 1.3 + korean chars * 0.5 */
export function estimateTokens(content: string): number {
  const words = content.split(/\s+/).filter(Boolean).length;
  const koreanChars = (content.match(/[\uAC00-\uD7AF]/g) || []).length;
  return Math.round(words * 1.3 + koreanChars * 0.5);
}

/**
 * Estimate the instruction budget usage for a workspace.
 */
export function estimateBudget(files: FileInfo[]): BudgetReport {
  const SYSTEM_RESERVED = 50;
  const INSTRUCTION_LIMIT = 150;
  const TOKEN_LIMIT = 5000;

  const claudeMdFiles = files.filter(
    (f) => f.name === "CLAUDE.md" || f.name === "AGENTS.md"
  );
  const rulesFiles = files.filter((f) => f.name.startsWith(".claude/rules/"));
  const agentsFiles = files.filter((f) => f.name.startsWith(".claude/agents/"));
  const skillsFiles = files.filter((f) => f.name.startsWith(".claude/skills/"));
  const hasClaudeIgnore = files.some((f) => f.name === ".claudeignore");

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

  // Calculate tokens
  const claudeMdTokens = claudeMdFiles.reduce((s, f) => s + estimateTokens(f.content), 0);
  const totalTokens = claudeMdTokens + 
    rulesFiles.reduce((s, f) => s + estimateTokens(f.content), 0) +
    agentsFiles.reduce((s, f) => s + estimateTokens(f.content), 0) +
    skillsFiles.reduce((s, f) => s + estimateTokens(f.content), 0);

  const userTotal = claudeMdCount + rulesCount + agentsCount + skillsCount;
  const totalCount = SYSTEM_RESERVED + userTotal;
  const percentage = Math.round((userTotal / INSTRUCTION_LIMIT) * 100);
  const tokenPercentage = Math.round((totalTokens / TOKEN_LIMIT) * 100);

  // Estimate savings if modularized (30% reduction of CLAUDE.md tokens)
  const savingsIfModular = Math.round(claudeMdTokens * 0.3);
  const savingsPct = claudeMdTokens > 0 ? Math.round((savingsIfModular / claudeMdTokens) * 100) : 0;

  // Check .claudeignore recommendations
  const claudeIgnoreContent = files.find((f) => f.name === ".claudeignore")?.content || "";
  const claudeIgnoreRecommendations = RECOMMENDED_CLAUDEIGNORE_PATTERNS.filter(
    (pattern) => !claudeIgnoreContent.includes(pattern)
  );

  return {
    systemReserved: SYSTEM_RESERVED,
    claudeMdCount,
    rulesCount,
    agentsCount,
    skillsCount,
    totalCount,
    limit: INSTRUCTION_LIMIT,
    percentage,
    status: percentage >= 100 ? "over" : percentage >= 80 ? "warning" : "ok",
    totalTokens,
    tokenLimit: TOKEN_LIMIT,
    tokenPercentage,
    tokenStatus: tokenPercentage >= 100 ? "over" : tokenPercentage >= 80 ? "warning" : "ok",
    savingsIfModular,
    savingsPct,
    hasClaudeIgnore,
    claudeIgnoreRecommendations,
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

  const userTotal =
    report.claudeMdCount +
    report.rulesCount +
    report.agentsCount +
    report.skillsCount;

  const statusText =
    report.status === "over"
      ? "Over limit!"
      : report.status === "warning"
        ? `Near limit (${report.percentage}%)`
        : `OK (${report.percentage}%)`;

  const divider = "─".repeat(42);

  const tokenIcon =
    report.tokenStatus === "over"
      ? "🔴"
      : report.tokenStatus === "warning"
        ? "⚠️ "
        : "✅";

  const tokenStatusText =
    report.tokenStatus === "over"
      ? "Over limit!"
      : report.tokenStatus === "warning"
        ? `Near limit (${report.tokenPercentage}%)`
        : `OK (${report.tokenPercentage}%)`;

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
    report.skillsCount > 0
      ? `  .claude/skills/:    ${report.skillsCount} instructions`
      : null,
    `  ${divider}`,
    `  User total: ${userTotal}/${report.limit}  ${statusIcon} ${statusText}`,
    "",
    "🪙 Token Budget",
    `  Total tokens: ${report.totalTokens.toLocaleString()} / ${report.tokenLimit.toLocaleString()}  ${tokenIcon} ${tokenStatusText}`,
    report.savingsIfModular > 0
      ? `  Modular savings: ~${report.savingsIfModular} tokens (${report.savingsPct}% reduction)`
      : null,
    !report.hasClaudeIgnore
      ? `  ⚠️  .claudeignore missing — recommended patterns: ${report.claudeIgnoreRecommendations.join(", ")}`
      : report.claudeIgnoreRecommendations.length > 0
        ? `  💡 .claudeignore could add: ${report.claudeIgnoreRecommendations.join(", ")}`
        : null,
  ]
    .filter((l) => l !== null)
    .join("\n");
}
