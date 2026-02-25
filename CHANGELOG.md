# AgentLinter Changelog

---

## v1.0.0 — 2026-02-25 🎉

> **ESLint for AI Agents — now with Claude Code deep integration**

### ✨ New Rules (6)

#### 🔴 `claude-code/instruction-count`
Counts total instructions across your core agent config files. Claude Code reserves ~50 instructions internally, leaving only 100-150 for your setup. Warns at 100+, errors at 150+. Shows top offending files so you know exactly where to trim.

#### 🔴 `claude-code/relevance-trap`
Detects context-specific instructions in `CLAUDE.md`/`AGENTS.md` that may be **silently ignored** by Claude Code's relevance filter. Claude Code wraps these files in a `<system-reminder>` with a note that content "may or may not be relevant" — file-specific rules, path-based conditionals, and framework-specific instructions should live in `.claude/rules/` instead.

#### 🟡 `claude-code/progressive-disclosure`
Warns when `CLAUDE.md` exceeds 50 lines without a `.claude/rules/` directory. Errors when it exceeds 200 lines. Long monolithic configs reduce signal-to-noise ratio and make Claude Code less effective.

#### 🟡 `claude-code/hooks-structure`
Validates `.claude/hooks/` and `settings.json` hook configurations. Checks for:
- Unknown/invalid hook event names (valid: `PreToolUse`, `PostToolUse`, `Stop`, `SubagentStop`, `Notification`)
- Missing `command` field in hook entries

#### 🟡 `claude-code/skills-vs-commands`
Detects deprecated `.claude/commands/` usage and recommends migration to `.claude/skills/` (the standard since Claude Code Feb 2026). Also flags references in markdown files.

#### 🟡 `claude-code/agent-focus`
Flags subagent definitions (`.claude/agents/*.md`) with too many responsibilities:
- Warns at 30+ bullet-point responsibility items
- Info at 8+ top-level H2 sections (may be doing too much)

---

### 📊 Context Window Budget Estimator

New **budget section** in every lint report:

```
📊 Context Window Budget
  System reserved:    ~50 instructions (fixed)
  CLAUDE.md/AGENTS.md: 63 instructions
  .claude/rules/:     12 instructions
  .claude/agents/:    8 instructions
  ──────────────────────────────────────────
  User total: 83/150  ✅ OK (55%)
```

Programmatic API:
```typescript
import { estimateBudget, formatBudgetReport } from 'agentlinter';

const budget = estimateBudget(files);
// { status: "ok" | "warning" | "over", percentage: 55, ... }
```

---

### 🔍 Full `.claude/` Directory Scanning

Parser now recursively scans the entire `.claude/` tree (depth 3):
- `.claude/agents/` — agent definitions
- `.claude/skills/` — skill configurations
- `.claude/rules/` — modular rule files
- `.claude/hooks/` — hook configurations

Previously only 1-level deep; now fully recursive.

---

### 📦 Breaking Changes
None — all new rules use existing categories (`clarity`, `structure`, `runtime`). Your existing score may change slightly due to additional diagnostics from the new rules.

---

### 🔧 Internal
- `src/engine/budget.ts` — new Context Window Budget Estimator module
- `src/engine/rules/index.ts` — 6 new rules registered
- `src/engine/parser.ts` — `scanDirRecursive()` for full `.claude/` tree scanning
- `src/engine/index.ts` — `estimateBudget`, `formatBudgetReport` exported
- `src/engine/reporter.ts` — budget section added to terminal output
- Both main engine and CLI package (`packages/cli`) updated

---

## v0.9.0 — 2026-02 (Previous)

Advanced rules: contradiction detection, vague conditionals, section cross-reference, skill scope validation, remote-ready checks.

## v0.7.0 — Previous

Token budget rules, instruction scope rules, hooks advisor, advanced patterns.

## v0.4.0 — Previous

Integration rules, autofix rules, best practices rules, Claude Code rules.

## v0.1.0 — Initial

Core rules: structure, clarity, completeness, security, consistency, memory, runtime, skill safety.
