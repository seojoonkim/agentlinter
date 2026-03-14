export function getTier(score: number) {
  if (score >= 98) return { grade: "S", color: "#c084fc", bg: "#c084fc18", label: "Exceptional", emoji: "\u{1F3C6}" };
  if (score >= 96) return { grade: "A+", color: "#a78bfa", bg: "#a78bfa18", label: "Outstanding", emoji: "\u2B50" };
  if (score >= 93) return { grade: "A", color: "#818cf8", bg: "#818cf818", label: "Excellent", emoji: "\u{1F3AF}" };
  if (score >= 90) return { grade: "A-", color: "#60a5fa", bg: "#60a5fa18", label: "Great", emoji: "\u2728" };
  if (score >= 85) return { grade: "B+", color: "#34d399", bg: "#34d39918", label: "Good", emoji: "\u{1F44D}" };
  if (score >= 80) return { grade: "B", color: "#4ade80", bg: "#4ade8018", label: "Decent", emoji: "\u{1F44C}" };
  if (score >= 75) return { grade: "B-", color: "#a3e635", bg: "#a3e63518", label: "Fair", emoji: "\u{1F4DD}" };
  if (score >= 68) return { grade: "C+", color: "#fbbf24", bg: "#fbbf2418", label: "Needs Work", emoji: "\u{1F527}" };
  if (score >= 60) return { grade: "C", color: "#f59e0b", bg: "#f59e0b18", label: "Below Average", emoji: "\u{1F4CA}" };
  if (score >= 55) return { grade: "C-", color: "#fb923c", bg: "#fb923c18", label: "Poor", emoji: "\u26A0\uFE0F" };
  if (score >= 50) return { grade: "D", color: "#ef4444", bg: "#ef444418", label: "Weak", emoji: "\u{1F6A8}" };
  return { grade: "F", color: "#991b1b", bg: "#991b1b18", label: "Failing", emoji: "\u{1F480}" };
}
