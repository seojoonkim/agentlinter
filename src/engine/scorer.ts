/* ─── Scoring Engine ─── */

import {
  FileInfo,
  Category,
  CategoryScore,
  LintResult,
  Diagnostic,
  CATEGORY_WEIGHTS,
} from "./types";
import { allRules } from "./rules";

/**
 * Run all rules and compute scores
 */
export function lint(workspacePath: string, files: FileInfo[]): LintResult {
  // Separate core agent files from skill files
  const coreFiles = files.filter((f) => !f.name.startsWith("skills/"));
  const skillFiles = files.filter((f) => f.name.startsWith("skills/"));

  // Run all rules — skill files only go through skillSafety + runtime rules
  const allDiagnostics: Diagnostic[] = [];
  for (const rule of allRules) {
    try {
      const targetFiles =
        rule.category === "skillSafety" || rule.category === "runtime"
          ? files       // these categories check everything
          : coreFiles;  // other categories only check core agent files
      const diagnostics = rule.check(targetFiles);
      allDiagnostics.push(...diagnostics);
    } catch (e) {
      // Rule failed — skip silently
      console.error(`Rule ${rule.id} failed:`, e);
    }
  }

  // Group by category
  const categories: Category[] = [
    "structure",
    "clarity",
    "completeness",
    "security",
    "consistency",
    "memory",
    "runtime",
    "skillSafety",
  ];

  const categoryScores: CategoryScore[] = categories.map((cat) => {
    const catDiagnostics = allDiagnostics.filter((d) => d.category === cat);
    const score = computeCategoryScore(cat, catDiagnostics, files);

    return {
      category: cat,
      score,
      weight: CATEGORY_WEIGHTS[cat],
      diagnostics: catDiagnostics,
    };
  });

  // Compute total weighted score
  const totalScore = Math.round(
    categoryScores.reduce((sum, cs) => sum + cs.score * cs.weight, 0)
  );

  return {
    workspace: workspacePath,
    files,
    categories: categoryScores,
    totalScore,
    diagnostics: allDiagnostics,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Compute score for a category based on diagnostics
 */
function computeCategoryScore(
  category: Category,
  diagnostics: Diagnostic[],
  files: FileInfo[]
): number {
  // Start at 100, deduct for issues
  let score = 100;

  const criticals = diagnostics.filter((d) => d.severity === "critical");
  const errors = diagnostics.filter((d) => d.severity === "error");
  const warnings = diagnostics.filter((d) => d.severity === "warning");
  const infos = diagnostics.filter((d) => d.severity === "info");

  // Deductions (with caps to prevent info avalanche from tanking score)
  score -= criticals.length * 20; // criticals are showstoppers
  score -= errors.length * 15; // errors are severe
  score -= warnings.length * 5; // warnings are moderate
  score -= Math.min(infos.length * 1, 20); // infos are minor, capped at -20

  // Bonus points for good practices (category-specific)
  score += computeBonus(category, files);

  // Clamp to 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Bonus points for positive signals
 */
function computeBonus(category: Category, files: FileInfo[]): number {
  let bonus = 0;

  switch (category) {
    case "structure":
      // Bonus for modular files
      const mdFiles = files.filter((f) => f.name.endsWith(".md"));
      if (mdFiles.length >= 3) bonus += 5;
      if (mdFiles.length >= 5) bonus += 5;
      break;

    case "clarity":
      // Bonus for having examples
      const hasExamples = files.some(
        (f) => f.content.includes("```") || /example/i.test(f.content)
      );
      if (hasExamples) bonus += 5;
      break;

    case "completeness":
      // Bonus for having all key files
      const keyFiles = ["SOUL.md", "IDENTITY.md", "USER.md", "TOOLS.md", "SECURITY.md"];
      const foundKeys = keyFiles.filter((k) =>
        files.some((f) => f.name === k)
      ).length;
      bonus += foundKeys * 2;
      break;

    case "security":
      // Bonus for having security file
      if (files.some((f) => f.name === "SECURITY.md")) bonus += 5;
      // Bonus for injection defense
      const allContent = files.map((f) => f.content).join("\n");
      if (/inject|jailbreak/i.test(allContent)) bonus += 5;
      // Bonus for SHIELD.md (security policy)
      const shieldFile = files.find((f) => f.name === "SHIELD.md");
      if (shieldFile) {
        bonus += 5; // Base bonus for having SHIELD.md
        // Additional bonus for complete sections
        const shieldContent = shieldFile.content.toLowerCase();
        const shieldHeadings = shieldFile.sections.map((s) => s.heading.toLowerCase());
        const requiredPatterns = [
          ["purpose", "목적", "overview"],
          ["scope", "범위", "coverage"],
          ["threat", "위협", "attack", "공격", "risk"],
          ["enforcement", "시행", "state", "level", "mode"],
          ["decision", "결정", "authorization", "권한", "approval", "승인"],
        ];
        const sectionsFound = requiredPatterns.filter((patterns) =>
          patterns.some((p) => shieldHeadings.some((h) => h.includes(p)) || shieldContent.includes(p))
        ).length;
        // +2 per section found (max +10 for all 5 sections)
        bonus += sectionsFound * 2;
      }
      break;

    case "consistency":
      // Bonus for consistent naming
      const rootMd = files.filter(
        (f) => f.name.endsWith(".md") && !f.name.includes("/")
      );
      const allUpper = rootMd.every(
        (f) => f.name === f.name.toUpperCase().replace(/\.MD$/, ".md")
      );
      if (allUpper && rootMd.length > 1) bonus += 5;
      break;

    case "memory":
      // Bonus for having memory-related files
      if (files.some((f) => f.name === "MEMORY.md")) bonus += 5;
      if (files.some((f) => f.name === "HEARTBEAT.md")) bonus += 3;
      if (files.some((f) => f.name.includes("progress"))) bonus += 3;
      // Bonus for memory directory
      if (files.some((f) => f.name.includes("memory/"))) bonus += 5;
      break;

    case "runtime":
      // Bonus for having a runtime config
      if (files.some((f) => f.name === "clawdbot.json" || f.name === "openclaw.json")) bonus += 5;
      break;

    case "skillSafety":
      // Bonus for having skills with proper metadata
      const skillFiles = files.filter((f) => f.name.includes("skills/") && f.name.endsWith("SKILL.md"));
      if (skillFiles.length > 0) {
        const withFrontmatter = skillFiles.filter((f) => f.content.startsWith("---"));
        if (withFrontmatter.length === skillFiles.length) bonus += 5;
      }
      // If no skills present, give full marks (nothing to check)
      if (skillFiles.length === 0) bonus += 10;
      break;
  }

  return bonus;
}
