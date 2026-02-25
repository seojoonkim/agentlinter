/* ─── Output Reporter ─── */

import { LintResult, CATEGORY_LABELS, Diagnostic, FileInfo } from "./types";
import { estimateBudget, formatBudgetReport } from "./budget";

/**
 * Get SHIELD.md security policy summary
 */
function getShieldSummary(files: FileInfo[]): string[] {
  const lines: string[] = [];
  const shieldFile = files.find((f) => f.name === "SHIELD.md");

  lines.push("🛡️ Security Policy");

  if (!shieldFile) {
    lines.push("  Status: Not configured");
    lines.push("  💡 Create SHIELD.md to define your agent's security boundaries");
    return lines;
  }

  lines.push("  Status: ✅ SHIELD.md present");

  // Check for required sections
  const shieldContent = shieldFile.content.toLowerCase();
  const shieldHeadings = shieldFile.sections.map((s) => s.heading.toLowerCase());

  const requiredSections = [
    { name: "Purpose", patterns: ["purpose", "목적", "overview"], icon: "🎯" },
    { name: "Scope", patterns: ["scope", "범위", "coverage"], icon: "📐" },
    { name: "Threats", patterns: ["threat", "위협", "attack", "공격", "risk"], icon: "⚠️" },
    { name: "Enforcement", patterns: ["enforcement", "시행", "state", "level", "mode"], icon: "🔒" },
    { name: "Decisions", patterns: ["decision", "결정", "authorization", "권한", "approval", "승인"], icon: "✋" },
  ];

  const present: string[] = [];
  const missing: string[] = [];

  for (const section of requiredSections) {
    const found = section.patterns.some(
      (p) => shieldHeadings.some((h) => h.includes(p)) || shieldContent.includes(p)
    );
    if (found) {
      present.push(`${section.icon} ${section.name}`);
    } else {
      missing.push(section.name);
    }
  }

  if (present.length > 0) {
    lines.push(`  Sections: ${present.join(" | ")}`);
  }

  if (missing.length > 0) {
    lines.push(`  Missing: ${missing.join(", ")}`);
  } else if (present.length === requiredSections.length) {
    lines.push("  Coverage: ✅ Complete");
  }

  return lines;
}

/**
 * Format lint result as terminal output
 */
export function formatTerminal(result: LintResult): string {
  const lines: string[] = [];

  lines.push("");
  lines.push("🔍 AgentLinter v1.0.0");
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
    const label = CATEGORY_LABELS[cat.category].padEnd(16);
    lines.push(`  ${label} ${bar} ${cat.score}`);
  }
  lines.push("");

  // Security Policy section
  const shieldLines = getShieldSummary(result.files);
  lines.push(...shieldLines);
  lines.push("");

  // Context Budget section
  const budget = estimateBudget(result.files);
  lines.push(formatBudgetReport(budget));
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
 * Get SHIELD.md status for JSON output
 */
function getShieldStatus(files: FileInfo[]): {
  hasShield: boolean;
  sections: { name: string; found: boolean }[];
} {
  const shieldFile = files.find((f) => f.name === "SHIELD.md");

  if (!shieldFile) {
    return { hasShield: false, sections: [] };
  }

  const shieldContent = shieldFile.content.toLowerCase();
  const shieldHeadings = shieldFile.sections.map((s) => s.heading.toLowerCase());

  const requiredSections = [
    { name: "Purpose", patterns: ["purpose", "목적", "overview"] },
    { name: "Scope", patterns: ["scope", "범위", "coverage"] },
    { name: "Threats", patterns: ["threat", "위협", "attack", "공격", "risk"] },
    { name: "Enforcement", patterns: ["enforcement", "시행", "state", "level", "mode"] },
    { name: "Decisions", patterns: ["decision", "결정", "authorization", "권한", "approval", "승인"] },
  ];

  const sections = requiredSections.map((section) => ({
    name: section.name,
    found: section.patterns.some(
      (p) => shieldHeadings.some((h) => h.includes(p)) || shieldContent.includes(p)
    ),
  }));

  return {
    hasShield: true,
    sections,
  };
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
      securityPolicy: getShieldStatus(result.files),
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
