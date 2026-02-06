/* ─── AgentLinter Core Types ─── */

export type Severity = "critical" | "error" | "warning" | "info";

export type Category =
  | "structure"
  | "clarity"
  | "completeness"
  | "security"
  | "consistency"
  | "memory"
  | "runtime"
  | "skillSafety";

/**
 * Lint context — determines which rules apply
 * - claude-code: Project-scoped (CLAUDE.md, .claude/)
 * - openclaw-runtime: Workspace-scoped (AGENTS.md, USER.md, ~/.openclaw/)
 * - universal: Applies to both contexts
 */
export type LintContext = "claude-code" | "openclaw-runtime" | "universal";

export interface Diagnostic {
  severity: Severity;
  category: Category;
  rule: string;
  file: string;
  line?: number;
  message: string;
  fix?: string; // suggested fix description
}

export interface FileInfo {
  name: string;
  path: string;
  content: string;
  lines: string[];
  sections: Section[];
  context: LintContext;
}

export interface Section {
  heading: string;
  level: number;
  startLine: number;
  endLine: number;
  content: string;
}

export interface CategoryScore {
  category: Category;
  score: number; // 0-100
  weight: number; // 0-1
  diagnostics: Diagnostic[];
}

export interface LintResult {
  workspace: string;
  context: LintContext;
  files: FileInfo[];
  categories: CategoryScore[];
  totalScore: number;
  diagnostics: Diagnostic[];
  timestamp: string;
}

export interface Rule {
  id: string;
  category: Category;
  severity: Severity;
  description: string;
  applicableContexts?: LintContext[]; // If undefined, applies to all contexts
  check: (files: FileInfo[]) => Diagnostic[];
}

export const CATEGORY_WEIGHTS: Record<Category, number> = {
  structure: 0.12,
  clarity: 0.20,
  completeness: 0.12,
  security: 0.15,
  consistency: 0.08,
  memory: 0.10,
  runtime: 0.13,
  skillSafety: 0.10,
};

export const CATEGORY_LABELS: Record<Category, string> = {
  structure: "Structure",
  clarity: "Clarity",
  completeness: "Completeness",
  security: "Security",
  consistency: "Consistency",
  memory: "Memory",
  runtime: "Runtime Config",
  skillSafety: "Skill Safety",
};
