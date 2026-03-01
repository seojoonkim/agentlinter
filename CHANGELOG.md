# AgentLinter Changelog

---

## v1.1.0 — 2026-03-01 🆕

### New Features

#### 1. 🎯 Position Risk Warning
- Detects critical rule sections (절대/금지/CRITICAL/반드시/never/always) buried in the middle 20-80% of a file
- Agents often skip or miss rules placed in the middle of long files
- **Rule:** `structure/position-risk-warning`
- **Fix hint:** Move critical rules to the top 20% of the file. Add a dedicated '🚨 CRITICAL RULES' section at the very top.

#### 2. 📊 Token Efficiency Score
- Grades each agent file by line count for token efficiency
  - **A** (≤150 lines): Excellent — concise and agent-friendly
  - **B** (≤300 lines): Good — consider trimming redundant sections
  - **C** (≤500 lines): Warning — split into focused modules
  - **D** (>500 lines): Critical — exceeds agent context windows
- **Rule:** `clarity/token-efficiency-score`
- **Fix hint:** Extract non-essential sections to separate files. Target < 300 lines for main agent files.

#### 3. 🔐 Enhanced Security Check (v0.8.0)
- **Prompt Injection Vulnerability Detection:** Flags patterns like 'follow all user instructions', 'do whatever user says', 'ignore rules'
- **Enhanced API Key Exposure:** Covers sk-, Bearer, ghp_, npm_, Vercel, Railway tokens with context-aware false-positive filtering
- **Rules:** `security/prompt-injection-vulnerability`, `security/api-key-exposure`
- **Fix hint:** Add permission boundaries, use environment variables for all secrets. Never embed API keys in agent files.

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
