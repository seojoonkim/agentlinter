# AgentLinter Changelog

---

## [2.2.0] - 2026-03-09

### Added
- **Token Budget Linter Enhanced** (+4 rules): section-weight analysis, compression suggestions, under-150 sparse file warning, padding phrase detection
  - `token-budget/total-tokens` — byte/token measurement with 3000-token recommendation
  - `token-budget/section-weight` — identifies heaviest sections by token proportion
  - `token-budget/compressible-padding` — detects "Always remember to", "Make sure to" and other filler phrases
  - `token-budget/under-150-tokens` — warns when files are too sparse to be useful
- **Prompt Injection Defense** (+1 rule): `security/no-injection-defense` — checks for injection defense keywords, external content handling, and NEVER/DO NOT permission boundaries
- **Cognitive Blueprint Validation** (+3 rules, NEW category "blueprint"): 6-element coverage check
  - `blueprint/coverage` — identity, goals, constraints, memory, planning, validation coverage
  - `blueprint/identity-defined` — agent identity/role definition check
  - `blueprint/constraints-defined` — explicit NEVER/DO NOT constraints check
- **Multi-Framework Export**: `agentlinter export --format <cursor|copilot|gemini>`
  - `cursor` → `.cursorrules`
  - `copilot` → `.github/copilot-instructions.md`
  - `gemini` → `GEMINI.md`

### Changed
- Category weights rebalanced to accommodate new "blueprint" category (0.08)
- Scoring now covers 10 dimensions (was 9)

---

## v2.1.0 — 2026-03-05 🚀

### 🆕 New: 13 Rules Added (17 → 30 total)

#### 📊 Token Bloat Score Enhanced (+3 rules)
- **`clarity/duplicate-content`** — Detects duplicate sections via 3-gram Jaccard similarity (>= 0.6)
- **`clarity/obvious-statements`** — Flags unnecessary "obvious" instructions ("be accurate", "follow instructions" etc.)
- **`clarity/token-budget-range`** — Token-estimated grading (English: 4 chars/token, Korean: 1.5 chars/token)

#### 🕐 Freshness / Staleness Detector (+3 rules, NEW)
- **`consistency/stale-file-reference`** — Validates file paths referenced in markdown exist on disk
- **`consistency/stale-date`** — 90d+ warning, 180d+ error for outdated dates
- **`consistency/stale-package-reference`** — Cross-checks referenced packages against package.json

#### 📎 @ Import Validator (+2 rules, NEW)
- **`structure/dead-import`** — Validates @file.md import references point to existing files
- **`structure/circular-import`** — DFS cycle detection in @import graph

#### 🔀 Multi-Framework Support (+4 rules, NEW)
- **Cursor** (.cursorrules) scanning + rules
  - `cursor/rules-format` — .cursorrules structure validation
  - `cursor/no-conflicting-claude` — .cursorrules vs CLAUDE.md conflict detection
- **GitHub Copilot** (.github/copilot-instructions.md) scanning + rules
  - `copilot/instructions-format` — copilot-instructions.md format validation
  - `copilot/no-conflicting-claude` — copilot-instructions vs CLAUDE.md conflict detection

#### ✍️ Describe vs Command Classifier (+1 rule)
- **`claude-code/descriptive-ratio`** — Warns when >60% descriptive statements (should be imperative)

### 🔬 Enhanced
- Token Efficiency Score: line-based + token-estimated grading (Korean correction)
- Parser: .cursorrules, .github/copilot-instructions.md, .github/ directory scanning
- LintContext type: added `cursor`, `copilot` contexts

### 📚 Research-backed
- Website "Research-backed linting" banner
- Reference: Gloaguen et al. (2026) — "A Taxonomy of Agent Instruction Failures"

---

## v2.0.0 — 2026-03-04 🚀

### Major: v2 Analysis Engine

#### 🧠 v2 Analyzers (5 modules)
- **Cognitive Load** — measures instruction density and mental overhead
- **Token Heatmap** — visualizes token distribution across file sections
- **Modularity** — evaluates separation of concerns and file organization
- **Role Complexity** — detects over-complex role/persona definitions
- **Security Scan** — deep security analysis with 25 patterns (up from 15)

#### 🎯 Clarity Score
- 17 ambiguous pattern detections (Korean + English)
- Weighted scoring with rewrite suggestions
- Korean token correction for accurate estimation

#### 💡 Actionable Suggestions
- Every issue tagged with priority: HIGH / MED / LOW
- Fix hints with concrete rewrite examples

#### 🏷️ Badge API
- `/api/badge?score=N` endpoint — embed SVG score badge in README

#### 🔐 Security Patterns Expanded
- 25 patterns total (AWS, JWT, injection, role-hijacking, etc.)

#### 🌏 Korean Token Correction
- Accurate token estimation for Korean agent files

#### 🖥️ Token Map UI
- Budget gauge visualization
- .claudeignore card display
- v2 analyzer integration in web UI

---

## v1.2.0 — 2026-03-03

### New Features

#### 📦 Token Budget Estimator
- Calculates token usage per file with budget gauge
- Visual breakdown of token allocation in reports

#### 🚫 .claudeignore Rules
- Define files to exclude from context window analysis
- Integrated into Token Map UI

---

## v1.1.0 — 2026-03-01

### New Features

#### 1. 🎯 Position Risk Warning
- Detects critical rule sections (절대/금지/CRITICAL/반드시/never/always) buried in the middle 20-80% of a file
- **Rule:** `structure/position-risk-warning`
- **Fix hint:** Move critical rules to the top 20% of the file.

#### 2. 📊 Token Efficiency Score
- Grades each agent file by line count: A (≤150), B (≤300), C (≤500), D (>500)
- **Rule:** `clarity/token-efficiency-score`

#### 3. 🔐 Enhanced Security Check
- Prompt Injection Vulnerability Detection: flags 'follow all user instructions', 'ignore rules' etc.
- Enhanced API Key Exposure: sk-, Bearer, ghp_, npm_, Vercel, Railway tokens
- **Rules:** `security/prompt-injection-vulnerability`, `security/api-key-exposure`

---

## v1.0.0 — 2026-02-25 🎉

> **ESLint for AI Agents — now with Claude Code deep integration**

### ✨ New Rules (6)

- **`claude-code/instruction-count`** — warns at 100+, errors at 150+ total instructions
- **`claude-code/relevance-trap`** — detects context-specific instructions that Claude Code may silently ignore
- **`claude-code/progressive-disclosure`** — warns when CLAUDE.md exceeds 50 lines without `.claude/rules/`
- **`claude-code/hooks-structure`** — validates `.claude/hooks/` and `settings.json` hook configs
- **`claude-code/skills-vs-commands`** — detects deprecated `.claude/commands/` usage
- **`claude-code/agent-focus`** — flags subagent definitions with too many responsibilities

### 📊 Context Window Budget Estimator
Budget section in every report: system-reserved + user instructions + remaining.

### 🔍 Full `.claude/` Directory Scanning
Recursive scan of agents, skills, rules, hooks directories (depth 3).

---

## v0.9.0 — 2026-02

### Added
- **Token Budget Checker** — warns when agent files approach context window limits
- **Instruction Scope** — detects instructions too broad/narrow for their file's scope
- **Skills Security+** — enhanced skill security scanning with more dangerous patterns
- **Hooks Advisor** — recommends hook configurations for common workflows
- Contradiction detection between files
- Vague conditional detection (`if appropriate`, `when necessary`)
- Section cross-reference validation
- Remote-Ready Score for production readiness checks

---

## v0.8.2 — 2026-02

### Added (4 new rules)
- **`runtime/gateway-exposure`** — detects unsecured gateway configs
- **`runtime/tool-policy-audit`** — validates tool permission policies for least-privilege
- **`runtime/session-limits`** — checks session timeout and rate limit configs
- **`runtime/credential-rotation`** — warns about hardcoded credentials

### New Category
**Remote-Ready Score** for production deployment readiness.

---

## v0.8.1 — 2026-02

### Fixed (5 false positive bug fixes)
- `security/api-key-exposure`: no longer flags template placeholders like `YOUR_KEY_HERE`
- `clarity/vague-instructions`: no longer fires on intentional generic README descriptions
- `structure/file-reference`: no longer marks valid relative paths as broken
- `memory/retention-strategy`: no longer flags non-standard-format memory sections
- `consistency/tone-mismatch`: no longer incorrectly detects mixed tone in bilingual files

---

## v0.8.0 — 2026-02

### Added (7 new rules + Claude Code Feb 2026 spec)
- **`security/prompt-injection-vulnerability`** — detects injection-vulnerable instruction patterns
- **`security/api-key-exposure`** — enhanced token detection (sk-, Bearer, ghp_, npm_, Vercel, Railway)
- **`claude-code/mcp-server-validator`** — MCP JSON syntax + schema validation
- **`claude-code/skills-linter`** — SKILL.md standard compliance check
- **`claude-code/hooks-checker`** — hook script safety (shebang, `set -e`, unsafe expansion)
- **`claude-code/cross-file-references`** — validates all @import/@include/@see/@ref paths
- **`claude-code/skill-workspace-sync`** — ensures all skills in directory are documented

---

## v0.7.1 — 2026-02-14

### Fixed
- Runtime scoring calibration: typical AGENTS.md now scores 55→80 (was under-penalizing)
- Tone detection false positives in bilingual Korean/English files
- Consistency scoring for files with section headers in multiple languages

---

## v0.7.0 — 2026-02-14

### Added (25+ new rules)

**Advanced Inspection:**
- **`best-practices/instruction-counter`** — warns at 100+, errors at 150+ imperative instructions
- **`best-practices/context-bloat-detector`** — 300+ line detection, repetition (3×), modularization suggestions
- **`best-practices/progressive-disclosure`** — enforces Critical/Standard/Optional priority markers
- **`best-practices/anti-patterns`** — detects roleplay instructions, embedded credentials, code style rules in wrong files

**Auto-fix Suggestions:**
- **`best-practices/extract-instructions`** — recommends domain-based extraction to `skills/` or `.claude/rules/`
- **`best-practices/convert-code-snippets`** — flags 20+ line code blocks, suggests file references
- **`best-practices/structure-optimizer`** — enforces WHY/WHAT/HOW instruction framework
- **`best-practices/consolidate-duplicates`** — detects 80%+ similar instructions via Jaccard similarity

**Integration Validation:**
- MCP server validator, skills linter, hooks checker, cross-file references, skill-workspace sync

### Research Foundation
Based on Song et al. (TMLR 2026) "Large Language Model Reasoning Failures" — 6 failure types mapped directly to linting rules.

---

## v0.6.1 — 2026-02-13

### Fixed
- RFC 2119 keywords false positive: `MUST`, `SHOULD`, `MAY` in headers no longer flagged incorrectly
- File reference check: existing files with relative paths were reported as missing
- Security skill context: security content in skill files no longer triggers generic warnings

---

## v0.6.0 — 2026-02-11

### Added
- **`clarity/english-config-files`** — detects non-English content in core config files
  - Research basis: Non-English uses 2.4-3.8× more tokens, reduces accuracy 10-20%
  - `warning` at 30%+ non-English; `info` below 30%
- **CLI share by default** — auto-shares results (use `--local` to opt out)
- Skills security scan in default execution
- All **8 Scoring Dimensions** fully implemented

---

## v0.5.0 — 2026-02-10

### Added
- **`--audit-skill` flag** — MoltX-style trojan detection
- **Skill Safety** as 8th scoring dimension
- Dangerous pattern scanner: `curl|bash`, `rm -rf`, `~/.ssh`, `~/.aws`, `webhook.site`, etc.
- Skill scan integrated into default `npx agentlinter` run

_Inspired by Moltbook community report (4,894 upvotes) about credential stealer in 286 skill packages._

---

## v0.4.0 — 2026-02-09

### Added
- Integration rules: MCP server config detection and basic validation
- Autofix rules: `--fix` flag support for common issues
- Claude Code-specific rules: `.claude/` directory detection, CLAUDE.md validation
- SHIELD.md check: validates HiveFence-style prompt injection defense

---

## v0.3.0 — 2026-02-07

### Added
- **Auto Agent/Project Mode Detection**
  - `CLAUDE.md` only → Project Mode (memory rules skipped)
  - `AGENTS.md` or `openclaw.json` → Agent Mode (all rules)
  - `moltbot.json` → Moltbot agent mode
- OpenClaw and Moltbot added as supported frameworks

---

## v0.2.0 — 2026-02-06

### Added
- **Memory** as 6th scoring category
- `memory/retention-strategy` and `memory/session-handoff` rules
- Grade scale refined: C/C-/D+/D/D-/F grades for finer low-end distribution
- GitHub stars badge, Twitter/X ASCII share card
- "AI 에이전트한테 고쳐달라고 하세요" CTA
- Privacy section: what's local vs. shared

---

## v0.1.0 — 2026-02-05

### Initial Release 🎉

**Core concept:** ESLint for AI agent config files.

- 8 scoring dimensions: Structure, Clarity, Completeness, Security, Consistency, Memory, Runtime Config, Skill Safety
- Web interface at agentlinter.vercel.app
- CLI: `npx agentlinter` — zero-install
- GitHub repo analysis
- Share: unique report URL per lint run
- Local-first: file contents never sent to server
- Free & Open Source
- ~30 core linting rules across all dimensions
