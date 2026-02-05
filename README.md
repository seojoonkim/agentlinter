<p align="center">
  <img src="https://img.shields.io/badge/AgentLinter-v1.0.0-7c3aed?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjN2MzYWVkIi8+PHBhdGggZD0iTTkgMTAuNUwxNiA3TDIzIDEwLjVWMTdMMTYgMjVMOSAxN1YxMC41WiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGZpbGw9Im5vbmUiLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjE1LjUiIHI9IjEuNSIgZmlsbD0id2hpdGUiLz48L3N2Zz4=&logoColor=white" alt="AgentLinter" />
</p>

<h1 align="center">🔍 AgentLinter</h1>

<p align="center">
  <strong>Free & open source ESLint for AI Agents</strong> — Score, diagnose, and auto-fix your entire agent workspace.
  <br />
  <em>100% free. Always will be.</em>
</p>

<p align="center">
  <a href="https://agentlinter.vercel.app">Website</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#five-scoring-dimensions">Scoring</a> ·
  <a href="#vs-anthropics-official-tools">Comparison</a> ·
  <a href="#how-it-works">How it Works</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-18%2B-brightgreen?style=flat-square" alt="Node 18+" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/frameworks-Claude_Code_%7C_Clawdbot_%7C_Cursor_%7C_Windsurf-purple?style=flat-square" alt="Frameworks" />
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
| 📉 **No quality baseline** | Can't measure improvement | 0–100 score across 5 dimensions |
| 🏗️ **Missing essentials** | No error recovery, no boundaries | Completeness checklist with auto-fix |

---

## Quick Start

```bash
npx agentlinter
```

That's it. **Free, open source, forever.** No config. No API key. No signup. No paywall. Runs in seconds.

```
🔍 AgentLinter v1.0.0
📁 Scanning workspace: .claude/ + root
   Found 5 files: CLAUDE.md, SOUL.md, USER.md, TOOLS.md, SECURITY.md

  Workspace Score ........ 72/100  (B)
  ├─ Structure     ████████░░  80
  ├─ Clarity       ███████░░░  70
  ├─ Completeness  ██████░░░░  60
  ├─ Security      █████████░  90
  └─ Consistency   ██████░░░░  60

  2 errors · 3 warnings

  ERR  TOOLS.md:14 — Secret: API key pattern "sk-proj-..."
  ERR  SOUL.md ↔ CLAUDE.md — Conflicting persona definition
  WARN CLAUDE.md:28 — Vague: "be helpful" → be specific
  WARN No error recovery strategy defined
  WARN 2 cross-file references broken

  💡 3 auto-fixable. Run: npx agentlinter --fix
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

## How it Works

### 1. 🔍 Scan

Discovers every `.md` file in your agent workspace — `CLAUDE.md`, `SOUL.md`, `USER.md`, `TOOLS.md`, `SECURITY.md`, `.claude/rules/`, skill files, and more.

Supports **Claude Code**, **Clawdbot**, **Cursor**, **Windsurf**, and any workspace following the [Agent Skills](https://agentskills.io) open standard.

### 2. 📊 Score

Evaluates across **five dimensions**, each scored 0–100. Every rule is documented and derived from Anthropic's official best practices plus patterns from high-performing agent workspaces.

### 3. ⚡ Fix

Every issue comes with a prescription. Most are auto-fixable with `--fix`:
- Secrets get flagged for immediate rotation
- Vague instructions get specific rewrites
- Missing sections get scaffolded
- Cross-file contradictions get highlighted with resolution suggestions

---

## Five Scoring Dimensions

Each dimension checks specific, documented rules:

### Structure — 20%

> File organization, naming conventions, section hierarchy.

| Rule | Severity | Example |
|------|----------|---------|
| Required files present | Error | `Missing TOOLS.md — referenced in CLAUDE.md:12` |
| Section separation | Warning | `CLAUDE.md has 200+ lines with no headers` |
| Naming conventions | Info | `Use CLAUDE.md, not claude.md` |
| Frontmatter format | Info | `SKILL.md missing description field` |

### Clarity — 25%

> Instruction quality — can an AI agent unambiguously follow these?

| Rule | Severity | Example |
|------|----------|---------|
| Naked conditionals | Error | `"If appropriate" — what's the criteria?` |
| Compound instructions | Warning | `Line has 4 instructions — split them` |
| Ambiguous pronouns | Warning | `"Update it" — update what?` |
| Missing priorities | Warning | `No P0/P1/P2 signals — which tasks first?` |
| Vague language | Warning | `"be helpful" → specify: response length, tone, format` |
| Escape hatch missing | Info | `Absolute rule with no exception path` |

### Completeness — 20%

> Does the workspace cover all essential aspects?

| Rule | Severity | Example |
|------|----------|---------|
| Identity/persona defined | Warning | `No SOUL.md or persona section found` |
| Tool documentation | Warning | `6 tools referenced but undocumented` |
| Boundaries & constraints | Warning | `No safety boundaries defined` |
| Error recovery strategy | Warning | `No escalation or fallback path` |
| Memory/handoff strategy | Info | `No session continuity plan` |

### Security — 20%

> Protecting your agent and your data.

| Rule | Severity | Example |
|------|----------|---------|
| Secret detection | Error | `API key pattern "sk-proj-..." in TOOLS.md:14` |
| Token patterns | Error | `GitHub token "ghp_..." exposed` |
| Injection defense | Warning | `No prompt injection defense instructions` |
| Permission boundaries | Warning | `No external action restrictions` |
| Sensitive data rules | Info | `Consider adding data handling policy` |

### Consistency — 15%

> Cross-file coherence across the entire workspace.

| Rule | Severity | Example |
|------|----------|---------|
| Persona alignment | Error | `SOUL.md persona ≠ CLAUDE.md persona` |
| Permission conflicts | Error | `CLAUDE.md allows X, SECURITY.md forbids X` |
| Broken references | Warning | `CLAUDE.md:12 references TOOLS.md — file not found` |
| Language mixing | Info | `Mixed ko/en in same section` |
| Tone alignment | Info | `Formal in CLAUDE.md, casual in SOUL.md` |

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

- **Tier grade**: S → A+ → A → A- → B+ → B → C → D
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
| **Scoring** | Basic via `/init` | ✅ 5-category (0-100) |
| **Scope** | Single CLAUDE.md | ✅ Full workspace |
| **Cross-file checks** | — | ✅ Contradiction detection |
| **Secret scanning** | — | ✅ 20+ patterns |
| **Auto-fix** | Prompting suggestions | ✅ One-command `--fix` |
| **Custom rules** | — | ✅ `.agentlinterrc` |
| **CI/CD** | — | ✅ GitHub Action |
| **Templates** | `/init` | ✅ 4 starter templates |
| **Reports** | — | ✅ Web + Share on X |
| **Frameworks** | Claude Code only | ✅ CC, Clawdbot, Cursor, Windsurf |

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
| **Clawdbot** | `AGENTS.md`, `SOUL.md`, `USER.md`, `TOOLS.md` | ✅ Full support |
| **Cursor** | `.cursorrules`, `.cursor/rules/` | ✅ Full support |
| **Windsurf** | `.windsurfrules`, `.windsurf/rules/` | ✅ Full support |
| **Any Agent Skills** | `SKILL.md` with frontmatter | ✅ Full support |

---

## Roadmap

- [x] Core scoring engine (5 dimensions)
- [x] Auto-fix with `--fix`
- [x] Secret scanning (20+ patterns)
- [x] Cross-file consistency checks
- [x] Web reports with sharing
- [ ] GitHub Action marketplace release
- [ ] VS Code extension (real-time linting)
- [ ] Team dashboard
- [ ] Leaderboard & badges
- [ ] `agentlinter init` interactive wizard

---

## Contributing

We welcome contributions! Areas where help is needed:

- **New rules** — See `src/engine/rules/` for the pattern
- **Framework support** — Add parsers for new agent frameworks
- **Templates** — Create starter templates for new use cases
- **Docs** — Improve documentation and examples

---

## License

MIT

---

<p align="center">
  Built by <a href="https://twitter.com/simonkim_nft">@simonkim_nft</a>
  <br />
  Built on <a href="https://code.claude.com/docs/en/memory">Anthropic's CLAUDE.md standard</a> · <a href="https://agentskills.io">Agent Skills open standard</a>
</p>
