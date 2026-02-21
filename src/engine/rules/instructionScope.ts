/* ─── Instruction Scope Rules ─── */
/* Detects task-specific instructions in global CLAUDE.md/AGENTS.md */

import { Rule, Diagnostic } from "../types";

const TASK_SPECIFIC_PATTERNS: { pattern: RegExp; label: string }[] = [
  // Language-specific
  { pattern: /\bPython\s+\d+\.\d+/i, label: "Python version constraint" },
  { pattern: /\bTypeScript\s+strict\s+mode/i, label: "TypeScript strict mode" },
  { pattern: /\buse\s+(?:pytest|jest|mocha|vitest|unittest)\b/i, label: "Testing framework directive" },
  { pattern: /\bNode\.?js\s+\d+/i, label: "Node.js version constraint" },
  { pattern: /\bJava\s+\d+/i, label: "Java version constraint" },
  { pattern: /\bGo\s+\d+\.\d+/i, label: "Go version constraint" },
  { pattern: /\bRust\s+\d+/i, label: "Rust version constraint" },
  { pattern: /\bRuby\s+\d+/i, label: "Ruby version constraint" },
  // Tool-specific
  { pattern: /\b(?:run|execute|use)\s+npm\s+(?:test|run|install)\b/i, label: "npm command directive" },
  { pattern: /\buse\s+(?:black|ruff|flake8|pylint|mypy)\s+(?:formatter|linter)?\b/i, label: "Python tool directive" },
  { pattern: /\buse\s+(?:prettier|eslint|biome)\b/i, label: "JS/TS tool directive" },
  { pattern: /\b(?:cargo|pip|yarn|pnpm|bun)\s+(?:install|add|run|test)\b/i, label: "Package manager command" },
  // Framework-specific
  { pattern: /\b(?:use|prefer)\s+(?:React|Vue|Angular|Svelte|Next\.?js|Nuxt)\b/i, label: "Framework preference" },
  { pattern: /\b(?:Django|Flask|FastAPI|Express|NestJS)\s+(?:app|server|project)/i, label: "Framework-specific instruction" },
  // Build/deploy specific
  { pattern: /\b(?:docker|kubernetes|k8s)\s+(?:build|deploy|compose)/i, label: "Container directive" },
  { pattern: /\bvercel\s+(?:deploy|--prod)/i, label: "Vercel deployment directive" },
  { pattern: /\b(?:webpack|vite|rollup|esbuild)\s+(?:config|build)/i, label: "Bundler directive" },
];

export const instructionScopeRules: Rule[] = [
  {
    id: "instruction-scope/task-specific-in-global",
    category: "consistency",
    severity: "warning",
    description: "Task-specific instructions in global CLAUDE.md/AGENTS.md should be moved to SKILL.md or conditional loading",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const globalFiles = files.filter(
        (f) => /^(CLAUDE|AGENTS)\.md$/i.test(f.name)
      );

      for (const file of globalFiles) {
        let matchCount = 0;
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];
          for (const { pattern, label } of TASK_SPECIFIC_PATTERNS) {
            if (pattern.test(line) && matchCount < 5) {
              matchCount++;
              diagnostics.push({
                severity: "warning",
                category: "consistency",
                rule: this.id,
                file: file.name,
                line: i + 1,
                message: `Task-specific instruction in global scope: ${label} — "${line.trim().substring(0, 60)}"`,
                fix: "Move to a project-specific SKILL.md or use conditional loading. Global config should contain universal instructions only.",
              });
            }
          }
        }
      }
      return diagnostics;
    },
  },
];
