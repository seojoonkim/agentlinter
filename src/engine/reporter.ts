/* ─── Output Reporter ─── */

import { LintResult, CATEGORY_LABELS, Diagnostic } from "./types";

/**
 * Format lint result as terminal output
 */
export function formatTerminal(result: LintResult): string {
  const lines: string[] = [];

  lines.push("");
  lines.push("🔍 AgentLinter v0.1.0");
  lines.push(`📁 Scanning workspace: ${result.workspace}`);
  lines.push(`📄 Files found: ${result.files.map((f) => f.name).join(", ")}`);
  lines.push("");

  // Overall score
  const scoreEmoji =
    result.totalScore >= 90
      ? "🏆"
      : result.totalScore >= 70
        ? "✅"
        : result.totalScore >= 50
          ? "⚠️"
          : "❌";

  lines.push(`${scoreEmoji} Overall Score: ${result.totalScore}/100`);
  lines.push("");

  // Category scores
  for (const cat of result.categories) {
    const bar = makeBar(cat.score);
    const label = CATEGORY_LABELS[cat.category].padEnd(14);
    lines.push(`  ${label} ${bar} ${cat.score}`);
  }
  lines.push("");

  // Diagnostics
  const errors = result.diagnostics.filter((d) => d.severity === "error");
  const warnings = result.diagnostics.filter((d) => d.severity === "warning");
  const infos = result.diagnostics.filter((d) => d.severity === "info");

  const counts = [
    errors.length > 0 ? `${errors.length} error(s)` : null,
    warnings.length > 0 ? `${warnings.length} warning(s)` : null,
    infos.length > 0 ? `${infos.length} info(s)` : null,
  ]
    .filter(Boolean)
    .join(", ");

  if (counts) {
    lines.push(`📋 ${counts}`);
    lines.push("");
  }

  // List diagnostics grouped by severity
  for (const diag of [...errors, ...warnings, ...infos]) {
    const icon =
      diag.severity === "error"
        ? "❌ ERROR"
        : diag.severity === "warning"
          ? "⚠️  WARN"
          : "ℹ️  INFO";

    const location = diag.line ? `${diag.file}:${diag.line}` : diag.file;
    lines.push(`  ${icon}  ${location}`);
    lines.push(`         ${diag.message}`);
    if (diag.fix) {
      lines.push(`         💡 Fix: ${diag.fix}`);
    }
    lines.push("");
  }

  // Fixable count
  const fixable = result.diagnostics.filter((d) => d.fix).length;
  if (fixable > 0) {
    lines.push(
      `💡 ${fixable} issue(s) have suggested fixes above. Apply them manually to improve your score.`
    );
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Format lint result as JSON
 */
export function formatJSON(result: LintResult): string {
  return JSON.stringify(
    {
      score: result.totalScore,
      categories: result.categories.map((c) => ({
        name: CATEGORY_LABELS[c.category],
        score: c.score,
        weight: c.weight,
        issues: c.diagnostics.length,
      })),
      diagnostics: result.diagnostics.map((d) => ({
        severity: d.severity,
        category: d.category,
        rule: d.rule,
        file: d.file,
        line: d.line,
        message: d.message,
        fix: d.fix,
      })),
      files: result.files.map((f) => f.name),
      timestamp: result.timestamp,
    },
    null,
    2
  );
}

/**
 * Make a progress bar
 */
function makeBar(score: number): string {
  const filled = Math.round(score / 10);
  const empty = 10 - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}
