/* ─── Output Reporter ─── */

import { LintResult } from "./types";
import {
  DEFAULT_LOCALE,
  Locale,
  getCategoryLabel,
  getDiagnosticBadge,
  getSuggestedFixesSummary,
  t,
} from "../i18n";
import { localizeDiagnostics } from "../i18n-diagnostics";

/**
 * Format lint result as terminal output
 */
export function formatTerminal(result: LintResult, locale: Locale = DEFAULT_LOCALE): string {
  const lines: string[] = [];
  const diagnostics = localizeDiagnostics(result.diagnostics, locale);

  lines.push("");
  lines.push("🔍 AgentLinter v0.1.0");
  lines.push(`📁 ${t(locale, "scanStart", { path: result.workspace })}`);
  lines.push(`📄 ${t(locale, "files")}: ${result.files.map((f) => f.name).join(", ")}`);
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

  lines.push(`${scoreEmoji} ${t(locale, "overallScore")}: ${result.totalScore}/100`);
  lines.push("");

  // Category scores
  for (const cat of result.categories) {
    const bar = makeBar(cat.score);
    const label = getCategoryLabel(cat.category, locale).padEnd(14);
    lines.push(`  ${label} ${bar} ${cat.score}`);
  }
  lines.push("");

  // Diagnostics
  const errors = diagnostics.filter((d) => d.severity === "critical");
  const warnings = diagnostics.filter((d) => d.severity === "warning");
  const infos = diagnostics.filter((d) => d.severity === "info");

  const counts = [
    errors.length > 0 ? t(locale, "criticalCount", { count: errors.length }) : null,
    warnings.length > 0 ? t(locale, "warningCount", { count: warnings.length }) : null,
    infos.length > 0 ? t(locale, "suggestionCount", { count: infos.length }) : null,
  ]
    .filter(Boolean)
    .join(", ");

  if (counts) {
    lines.push(`📋 ${counts}`);
    lines.push("");
  }

  // List diagnostics grouped by severity
  for (const diag of [...errors, ...warnings, ...infos]) {
    const icon = (
      diag.severity === "critical"
        ? getDiagnosticBadge(locale, "critical")
        : diag.severity === "warning"
          ? getDiagnosticBadge(locale, "warning")
          : getDiagnosticBadge(locale, "info")
    );

    const location = diag.line ? `${diag.file}:${diag.line}` : diag.file;
    lines.push(`  ${icon}  ${location}`);
    lines.push(`         ${diag.message}`);
    if (diag.fix) {
      lines.push(`         💡 ${t(locale, "fixLabel")}: ${diag.fix}`);
    }
    lines.push("");
  }

  // Auto-fixable count
  const fixable = diagnostics.filter((d) => d.fix).length;
  if (fixable > 0) {
    lines.push(getSuggestedFixesSummary(locale, fixable));
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Format lint result as JSON
 */
export function formatJSON(result: LintResult, locale: Locale = DEFAULT_LOCALE): string {
  const diagnostics = localizeDiagnostics(result.diagnostics, locale);

  return JSON.stringify(
    {
      score: result.totalScore,
      categories: result.categories.map((c) => ({
        name: getCategoryLabel(c.category, locale),
        score: c.score,
        weight: c.weight,
        issues: c.diagnostics.length,
      })),
      diagnostics: diagnostics.map((d) => ({
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
