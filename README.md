<p align="center">
  <img src="https://img.shields.io/badge/AgentLinter-v2.1.0-7c3aed?style=for-the-badge&logoColor=white" alt="AgentLinter" />
</p>

<h1 align="center">🧬 AgentLinter</h1>

<p align="center">
  <strong>ESLint for AI Agents</strong> — Score, diagnose, and auto-fix your entire agent workspace.
  <br />
  <em>Free & open source. Always will be.</em>
</p>

<p align="center">
  <a href="https://agentlinter.com">Website</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#eight-scoring-dimensions">Scoring</a> ·
  <a href="#vs-anthropics-official-tools">Comparison</a> ·
  <a href="#how-it-works">How it Works</a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/seojoonkim/agentlinter?style=flat-square&color=f59e0b" alt="GitHub Stars" />
  <img src="https://img.shields.io/badge/node-18%2B-brightgreen?style=flat-square" alt="Node 18+" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/frameworks-Claude_Code_%7C_OpenClaw_%7C_Moltbot_%7C_Cursor_%7C_Windsurf_%7C_Copilot-purple?style=flat-square" alt="Frameworks" />
</p>

---

## Why AgentLinter?

Your AI agent is only as good as its config files. A vague `CLAUDE.md` produces vague results. A leaked API key becomes a vulnerability. Contradictions across files cause unpredictable behavior.

> *"Be specific: 'Use 2-space indentation' is better than 'Format code properly.'"*
> — [Anthropic, CLAUDE.md Best Practices](https://code.claude.com/docs/en/memory)

**AgentLinter treats your agent config as code** — scanning, scoring, and fixing it with the same rigor you'd apply to source code.

### The problems it solves

| Problem | Impact | AgentLinter |
|---------|--------|-------------|
| 🔇 **Vague instructions fail silently** | "Be helpful" gives zero guidance | Detects ambiguity, suggests specifics |
| 🔑 **Secrets in plain text** | API keys committed to repos | Scans for 20+ secret patterns |
| 🔀 **Multi-file drift** | SOUL.md contradicts CLAUDE.md | Cross-file consistency checks |
| 📉 **No quality baseline** | Can't measure improvement | 0–100 score across 8 dimensions |
| 🏗️ **Missing essentials** | No error recovery, no boundaries | Completeness checklist with auto-fix |
| ⚙️ **Insecure runtime config** | Gateway exposed to network | Runtime config security checks |
| 🛠️ **Dangerous skills** | `curl | bash` in skill files | Skill safety scanning |
| 🌐 **Non-English config files** | 2.5x token waste, interpretation errors | Detects non-English content, suggests translation |

---

## Quick Start

```bash
npx agentlinter
```

That's it. **Free, open source, forever.** No config. No API key. No signup. No paywall. Runs in seconds.

```
🔍 AgentLinter v0.2.0
📁 Scanning workspace: .claude/ + root
   Found 5 files: CLAUDE.md, SOUL.md, USER.md, TOOLS.md, SECURITY.md

  Workspace Score ........ 76/100  (B+)
  ├─ Structure     ████████░░  80
  ├─ Clarity       ███████░░░  70
  ├─ Completeness  ██████░░░░  60
  ├─ Security      █████████░  90
  ├─ Consistency   ██████░░░░  60
  ├─ Memory        ████████░░  80
  ├─ Runtime Cfg   █████████░  88
  └─ Skill Safety  █████████░  92

  2 critical(s) · 3 warning(s)

  🔴 CRITICAL  TOOLS.md:14 — Secret: API key pattern "sk-proj-..."
  🔴 CRITICAL  SOUL.md ↔ CLAUDE.md — Conflicting persona definition
  ⚠️  WARN  CLAUDE.md:28 — Vague: "be helpful" → be specific
  ⚠️  WARN  No error recovery strategy defined
  ⚠️  WARN  2 cross-file references broken

  💡 3 issues with suggested fixes. See report for details.
  📊 Report → agentlinter.com/r/a3f8k2
```

### Commands

```bash
# Score your workspace
npx agentlinter

# Auto-fix safe issues
npx agentlinter --fix

# Bootstrap a new workspace from template
npx agentlinter init --template coding

# Share your score
npx agentlinter share
```

---


---

## 🆕 What's New in v2.1.0

**30 rules** (13 new) with freshness detection, import validation, multi-framework support, and research-backed linting.

### 📊 Token Bloat Score Enhanced (+3 rules)
- **`clarity/duplicate-content`** — 3-gram Jaccard similarity detects duplicate sections (>= 60%)
- **`clarity/obvious-statements`** — Flags "be accurate", "follow instructions" etc. that waste tokens
- **`clarity/token-budget-range`** — Token-estimated grading (Korean-corrected): A<=2K, B<=5K, C<=10K, D>10K

### 🕐 Freshness / Staleness Detector (+3 rules, NEW)
- **`consistency/stale-file-reference`** — Validates file paths referenced in markdown
- **`consistency/stale-date`** — 90d+ warning, 180d+ error for outdated dates
- **`consistency/stale-package-reference`** — Cross-checks packages against package.json

### 📎 Import Validator (+2 rules, NEW)
- **`structure/dead-import`** — Validates @file.md references exist
- **`structure/circular-import`** — DFS cycle detection in import graph

### 🔀 Multi-Framework Support (+4 rules, NEW)
- **Cursor** (.cursorrules): `cursor/rules-format`, `cursor/no-conflicting-claude`
- **GitHub Copilot** (.github/copilot-instructions.md): `copilot/instructions-format`, `copilot/no-conflicting-claude`

### ✍️ Descriptive Ratio (+1 rule)
- **`claude-code/descriptive-ratio`** — Warns when >60% of content is descriptive instead of imperative

### 📚 Research-backed
- Rules grounded in prompt engineering best practices
- Reference: Gloaguen et al. (2026) — "A Taxonomy of Agent Instruction Failures"

---

## What's in v2.0.0

Major upgrade with v2 analysis engine, advanced scoring, and new APIs.

### 🧠 v2 Analyzers (5 new analysis modules)

| Analyzer | Description |
|----------|-------------|
| **Cognitive Load** | Measures instruction density and mental overhead |
| **Token Heatmap** | Visualizes token distribution across file sections |
| **Modularity** | Evaluates separation of concerns and file organization |
| **Role Complexity** | Detects over-complex role/persona definitions |
| **Security Scan** | Deep security analysis with 25 patterns (up from 15) |

### 🎯 Clarity Score

Detects **17 ambiguous patterns** in both Korean and English:
- Vague conditionals, naked pronouns, undefined references
- Weighted scoring with actionable rewrite suggestions
- Korean token correction for accurate estimation

### 💡 Actionable Suggestions

Every issue now comes with a **priority level**:
- **HIGH** — Fix immediately, directly impacts agent behavior
- **MED** — Should fix, improves reliability
- **LOW** — Nice to have, minor improvement

### 🏷️ Badge API

Embed your AgentLinter score in your README:

```markdown
![AgentLinter Score](https://agentlinter.com/api/badge?score=87)
```

Endpoint: `/api/badge?score=N` — returns an SVG badge.

### 🔐 Security Patterns (25)

Expanded from 15 to **25 patterns** including:
- AWS credential patterns, JWT tokens
- Injection vectors, role-hijacking attempts
- Enhanced API key detection (OpenAI, Anthropic, Google, GitHub, Vercel, Railway)

### 🌏 Korean Token Correction

Accurate token estimation for Korean agent files — fixes over-counting that caused inflated scores.

### 📦 Token Budget Estimator + .claudeignore

- **Token Budget Estimator** — calculates token usage per file with budget gauge
- **.claudeignore Rules** — define files to exclude from context window
- **Token Map UI** — visual breakdown of token allocation

---

## Previous: v1.1.0

### ⚠️ Position Risk Warning

Rules buried in the middle of long files are often **ignored by LLMs** — studies show attention degrades significantly for content not near the beginning or end of context.

AgentLinter detects rules placed in dangerous middle positions and warns you:

```
⚠️  WARN  CLAUDE.md:145 — Position Risk: Critical rule in middle position
         (lines 100-180 of 300). LLMs may not attend to this.
         → Move to top section or add a "## 🚨 CRITICAL RULES" header.
```

### 📊 Token Efficiency Score

Grades each agent file by line count: A (≤150), B (≤300), C (≤500), D (>500).

### 🔒 Enhanced Security Check

Prompt Injection Vulnerability Detection + Enhanced API Key Exposure scanning.

## Automatic Mode Detection

AgentLinter automatically detects whether you're running in **Project Mode** (Claude Code) or **Agent Mode** (OpenClaw/Moltbot/Clawdbot) and adjusts recommendations accordingly.

| Mode | Detected When | Rules Applied |
|------|--------------|---------------|
| **Project Mode** | Only `CLAUDE.md` present | Project-scoped rules (no memory/user context requirements) |
| **Agent Mode** | `AGENTS.md`, `openclaw.json`, `moltbot.json`, or `clawdbot.json` present | Full rules (memory strategy, user context, handoff protocol) |

This means:
- **Claude Code projects** won't get recommendations for `USER.md`, memory strategies, or session handoff — those are OpenClaw patterns
- **OpenClaw agents** get the full rule set for persistent, multi-session agents

No configuration needed — it just works.

---

## How it Works

### 1. 🔍 Scan

Discovers every `.md` file in your agent workspace — `CLAUDE.md`, `SOUL.md`, `USER.md`, `TOOLS.md`, `SECURITY.md`, `.claude/rules/`, skill files, and more.

Supports **Claude Code**, **OpenClaw**, **Moltbot**, **Cursor**, **Windsurf**, and any workspace following the [Agent Skills](https://agentskills.io) open standard.

### 2. 📊 Score

Evaluates across **eight dimensions**, each scored 0–100. Every rule is documented and derived from Anthropic's official best practices plus patterns from high-performing agent workspaces.

### 3. ⚡ Fix

Every issue comes with a prescription. Most are auto-fixable with `--fix`:
- Secrets get flagged for immediate rotation
- Vague instructions get specific rewrites
- Missing sections get scaffolded
- Cross-file contradictions get highlighted with resolution suggestions

---

## Eight Scoring Dimensions

Each dimension checks specific, documented rules:

### Structure — 12%

> File organization, naming conventions, section hierarchy.

| Rule | Severity | Example |
|------|----------|---------|
| Required files present | Critical | `Missing TOOLS.md — referenced in CLAUDE.md:12` |
| Section separation | Warning | `CLAUDE.md has 200+ lines with no headers` |
| Naming conventions | Info | `Use CLAUDE.md, not claude.md` |
| Frontmatter format | Info | `SKILL.md missing description field` |

### Clarity — 20%

> Instruction quality — can an AI agent unambiguously follow these?

| Rule | Severity | Example |
|------|----------|---------|
| Naked conditionals | Critical | `"If appropriate" — what's the criteria?` |
| Compound instructions | Warning | `Line has 4 instructions — split them` |
| Ambiguous pronouns | Warning | `"Update it" — update what?` |
| Missing priorities | Warning | `No P0/P1/P2 signals — which tasks first?` |
| Vague language | Warning | `"be helpful" → specify: response length, tone, format` |

### Completeness — 12%

> Does the workspace cover all essential aspects?

| Rule | Severity | Example |
|------|----------|---------|
| Identity/persona defined | Warning | `No SOUL.md or persona section found` |
| Tool documentation | Warning | `6 tools referenced but undocumented` |
| Boundaries & constraints | Warning | `No safety boundaries defined` |
| Error recovery strategy | Warning | `No escalation or fallback path` |

### Security — 15%

> Protecting your agent and your data.

| Rule | Severity | Example |
|------|----------|---------|
| Secret detection | Critical | `API key pattern "sk-proj-..." in TOOLS.md:14` |
| Token patterns | Critical | `GitHub token "ghp_..." exposed` |
| Injection defense | Warning | `No prompt injection defense instructions` |
| Permission boundaries | Warning | `No external action restrictions` |

### Consistency — 8%

> Cross-file coherence across the entire workspace.

| Rule | Severity | Example |
|------|----------|---------|
| Persona alignment | Critical | `SOUL.md persona ≠ CLAUDE.md persona` |
| Permission conflicts | Critical | `CLAUDE.md allows X, SECURITY.md forbids X` |
| Broken references | Warning | `CLAUDE.md:12 references TOOLS.md — file not found` |
| Language mixing | Info | `Mixed ko/en in same section` |

### Memory — 10%

> Session handoff and knowledge persistence.

| Rule | Severity | Example |
|------|----------|---------|
| Session handoff protocol | Warning | `No handoff protocol — agent loses context between sessions` |
| File-based persistence | Warning | `No daily notes or progress files` |
| Task state tracking | Info | `Consider adding progress.md` |
| Learning loop | Info | `No knowledge distillation strategy` |

### Runtime Config — 13%

> OpenClaw/Gateway configuration security.

| Rule | Severity | Example |
|------|----------|---------|
| Gateway bind | Critical | `Gateway bind "0.0.0.0" — exposes agent to network` |
| Auth mode enabled | Critical | `No auth configured — agent exposed` |
| Token strength | Warning | `Token < 32 chars — use stronger token` |
| DM/group policy | Warning | `No DM policy — consider restricting` |
| Plaintext secrets | Critical | `API key in config file` |

### Skill Safety — 10%

> Dangerous patterns in skill files.

| Rule | Severity | Example |
|------|----------|---------|
| Dangerous shell commands | Critical | `Skill contains: rm -rf /` |
| Curl pipe bash | Critical | `Skill contains: curl ... \| bash` |
| Sensitive path access | Warning | `Skill accesses ~/.ssh` |
| Data exfiltration | Warning | `Skill sends data to external URL` |
| Prompt injection vectors | Warning | `Skill vulnerable to injection` |

---

## Starter Templates

Bootstrap a new workspace with best practices built in:

```bash
npx agentlinter init --template <type>
```

| Template | Files Created | Best For |
|----------|--------------|----------|
| `personal` | CLAUDE.md, SOUL.md, USER.md | Personal AI assistant |
| `coding` | CLAUDE.md, TOOLS.md, SECURITY.md | Coding agents (Claude Code, Cursor) |
| `team` | CLAUDE.md, TOOLS.md, SECURITY.md, .agentlinterrc | Team agent workspace |
| `chatbot` | CLAUDE.md, SOUL.md, SECURITY.md | Customer-facing chatbots |

---

## Custom Rules

Enforce your team's standards with `.agentlinterrc`:

```json
{
  "extends": "agentlinter:recommended",
  "rules": {
    "require-files": ["CLAUDE.md", "SECURITY.md"],
    "max-file-length": 300,
    "require-section": ["## Boundaries", "## Tools"],
    "no-vague-language": "error",
    "require-injection-defense": "error"
  },
  "ignore": ["drafts/"]
}
```

---

## Score Reports & Sharing

Every run generates a **web report** with:

- **Tier grade**: S → A+ → A → B+ → B → C
- **Category breakdown**: Visual bars for each dimension
- **Prescriptions**: Exact issues with auto-fix markers
- **Percentile ranking**: Where you stand among all agents
- **Progress tracking**: Watch your score improve over time

### Share on X

```
My AI agent scored 87/100 on @AgentLinter 🔍

Structure: 80 | Clarity: 90 | Security: 95

How sharp is YOUR agent?
→ agentlinter.com
```

---

## VS Anthropic's Official Tools

Anthropic provides [CLAUDE.md memory](https://code.claude.com/docs/en/memory) and [skills](https://code.claude.com/docs/en/skills) — the building blocks for agent configuration. **AgentLinter tells you if you're using them well.**

| Feature | Claude Code (Anthropic) | AgentLinter |
|---------|:-----------------------:|:-----------:|
| **Scoring** | Basic via `/init` | ✅ 8-category (0-100) |
| **Scope** | Single CLAUDE.md | ✅ Full workspace |
| **Cross-file checks** | — | ✅ Contradiction detection |
| **Secret scanning** | — | ✅ 25 patterns |
| **Runtime config audit** | — | ✅ Gateway/auth checks |
| **Skill safety scan** | — | ✅ Dangerous pattern detection |
| **Auto-fix** | Prompting suggestions | ✅ One-command `--fix` |
| **Custom rules** | — | ✅ `.agentlinterrc` |
| **CI/CD** | — | ✅ GitHub Action |
| **Templates** | `/init` | ✅ 4 starter templates |
| **Reports** | — | ✅ Web + Share on X |
| **Frameworks** | Claude Code only | ✅ CC, OpenClaw, Moltbot, Cursor, Windsurf |

> **Not a replacement — an extension.** AgentLinter builds on Anthropic's CLAUDE.md standard and the [Agent Skills](https://agentskills.io) open standard. Think of it as ESLint for JavaScript — the language gives you the syntax, the linter tells you if your code is good.

---

## Self-Evolving Rules

AgentLinter gets smarter with every run:

```
Lint → Share → More Users → More Data → Better Rules → ↻
```

| Level | Type | How it works |
|-------|------|-------------|
| **L1** | Auto | Rule weights adjust based on which warnings users fix immediately |
| **L2** | Semi | Patterns in top-scoring agents become new rule candidates |
| **L3** | Auto | Low-acceptance fixes get A/B tested and replaced |
| **L4** | Semi | Starter templates evolve based on what files users add |

All data anonymized. Opt-out: `--no-telemetry`

---

## CI/CD Integration

### GitHub Action

```yaml
# .github/workflows/agentlinter.yml
name: AgentLinter
on: [pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npx agentlinter
      - run: npx agentlinter --format github
```

Score changes are posted as PR comments automatically.

---

## Supported Frameworks

| Framework | Config Files | Status |
|-----------|-------------|--------|
| **Claude Code** | `CLAUDE.md`, `.claude/rules/`, `.claude/skills/` | ✅ Full support |
| **OpenClaw** | `AGENTS.md`, `SOUL.md`, `USER.md`, `TOOLS.md`, `openclaw.json` | ✅ Full support |
| **Moltbot** | `AGENTS.md`, `SOUL.md`, `moltbot.json` | ✅ Full support |
| **Clawdbot** | `AGENTS.md`, `SOUL.md`, `USER.md`, `TOOLS.md`, `clawdbot.json` | ✅ Full support |
| **Cursor** | `.cursorrules`, `.cursor/rules/` | ✅ Full support |
| **GitHub Copilot** | `.github/copilot-instructions.md` | ✅ Full support |
| **Windsurf** | `.windsurfrules`, `.windsurf/rules/` | ✅ Full support |
| **Any Agent Skills** | `SKILL.md` with frontmatter | ✅ Full support |

---

## Privacy

**Local-first by design.** All scanning and scoring runs 100% on your machine. Your file contents never leave.

### What stays local (always)
- ✅ Your actual file contents (CLAUDE.md, SOUL.md, etc.)
- ✅ System prompts and personal context
- ✅ Security rules and sensitive instructions

### What's shared (only when report link is generated)
- 📊 Scores and grades
- 📄 File names (not contents)
- 💬 Diagnostic messages (e.g., "Line 28: vague instruction")

### Options
- Use `--local` flag to skip sharing entirely — zero network calls
- Secrets are auto-masked in reports (API keys show as `[REDACTED]`)
- No telemetry by default

---

## Roadmap

- [x] Core scoring engine (8 dimensions)
- [x] Auto-fix with `--fix`
- [x] Secret scanning (25 patterns)
- [x] Cross-file consistency checks
- [x] Web reports with sharing
- [x] Runtime config audit
- [x] Skill safety scanning
- [ ] GitHub Action marketplace release
- [ ] VS Code extension (real-time linting)
- [ ] Team dashboard
- [x] Badge API (`/api/badge?score=N`)
- [x] v2 Analyzers (Cognitive Load, Token Heatmap, Modularity, Role Complexity, Security Scan)
- [x] Token Budget Estimator + .claudeignore
- [x] Freshness/Staleness Detector + Import Validator
- [x] Multi-framework support (Cursor, Copilot)
- [ ] Leaderboard

---

## Contributing

We welcome contributions! Areas where help is needed:

- **New rules** — See `src/engine/rules/` for the pattern
- **Framework support** — Add parsers for new agent frameworks
- **Templates** — Create starter templates for new use cases
- **Docs** — Improve documentation and examples

```bash
git clone https://github.com/seojoonkim/agentlinter
cd agentlinter
npm install
npm run dev
```

---

## License

MIT

---

## 📋 Version History

| Version | Date | Highlights |
|---------|------|-----------|
| **v2.1.0** | 2026-03-05 | 13 new rules (freshness, import validator, multi-framework, token bloat), research-backed linting, 30 total rules |
| **v2.0.0** | 2026-03-04 | v2 Deep Analysis Engine (Cognitive Load, Token Heatmap, Modularity, Role Complexity, Security Scan), Token Map UI, Budget Gauge |
| **v1.2.0** | 2026-03-03 | Token Budget Estimator, .claudeignore Rules, Korean agent file scoring |
| **v1.1.0** | 2026-03-01 | Position Risk Warning, Token Efficiency Score, Enhanced Security (prompt injection + API key) |
| **v1.0.0** | 2026-02-25 | 6 Claude Code rules, Context Window Budget Estimator, Full .claude/ recursive scanning |
| **v0.9.0** | 2026-02 | Token Budget Checker, Instruction Scope, Hooks Advisor, Contradiction detection |
| **v0.8.0** | 2026-02 | 7 new rules: prompt injection, MCP validator, skills linter, hooks checker, Claude Code Feb 2026 |
| **v0.7.0** | 2026-02-14 | 25+ new rules, instruction counter, context bloat, auto-fix suggestions, MCP/skills/hooks |
| **v0.6.0** | 2026-02-11 | english-config-files rule, CLI share by default, all 8 scoring dimensions |
| **v0.5.0** | 2026-02-10 | Skill Safety 8th dimension, trojan detection, dangerous pattern scanner |
| **v0.1.0** | 2026-02-05 | Initial release: 8 scoring dimensions, ~30 rules, web interface, npx CLI |

> Full changelog: [CHANGELOG.md](./CHANGELOG.md)

---

<p align="center">
  <a href="https://github.com/seojoonkim/agentlinter">⭐ Star on GitHub</a> ·
  <a href="https://twitter.com/simonkim_nft">@simonkim_nft</a>
  <br /><br />
  Built on <a href="https://code.claude.com/docs/en/memory">Anthropic's CLAUDE.md standard</a> · <a href="https://agentskills.io">Agent Skills open standard</a>
</p>
