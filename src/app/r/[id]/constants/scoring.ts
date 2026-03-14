export const SCORING_METHODOLOGY = {
  base: "Each category starts at 100 points.",
  deductions: [
    { severity: "Critical", points: -15, color: "var(--red)", description: "Issues that break agent behavior or expose secrets" },
    { severity: "Warning", points: -8, color: "var(--amber)", description: "Significant issues that degrade agent quality" },
    { severity: "Info", points: -3, color: "var(--text-dim)", description: "Minor suggestions for improvement" },
  ],
  bonuses: [
    { category: "Structure", description: "Modular files (3+ \u2192 +5, 5+ \u2192 +10)" },
    { category: "Clarity", description: "Has examples or code blocks (+5)" },
    { category: "Completeness", description: "Key files exist: SOUL, IDENTITY, USER, TOOLS, SECURITY (+2 each)" },
    { category: "Security", description: "Has SECURITY.md (+5), injection defense keywords (+5)" },
    { category: "Consistency", description: "Consistent UPPERCASE naming convention (+5)" },
  ],
  formula: "Total = \u03A3 (category_score \u00D7 category_weight)",
};
