# 🔍 AgentLinter

**ESLint for AI Agents** — Score, diagnose, and auto-fix your CLAUDE.md and agent workspace files.

> _Sharpen your agent's edge._

## Quick Start

```bash
# Score your agent workspace
npx agentlinter score .

# Auto-fix issues
npx agentlinter fix --auto

# Share your score
npx agentlinter share
```

## What it checks

| Category | Weight | What's checked |
|----------|--------|----------------|
| Structure | 20% | File structure, section separation, naming conventions |
| Clarity | 25% | Instruction clarity, vague expression detection, actionability |
| Completeness | 20% | Required elements (identity, tools, boundaries, memory) |
| Security | 20% | Secret exposure, injection defense, permission boundaries |
| Consistency | 15% | Cross-file reference integrity, contradictions |

## Features

- 📊 **Multi-dimensional scoring** — 5 categories, not just a single number
- ⚡ **Auto-fix** — Apply best practices with `--fix`
- 🛡️ **Secret scan** — Detect leaked API keys and tokens
- 📁 **Cross-file consistency** — Catch contradictions across workspace files
- 🎯 **Templates** — Bootstrap with `agentlinter init`
- 🔧 **Custom rules** — Define team rules in `.agentlinterrc`
- 📤 **Score sharing** — Share your Score Card on X
- 🧠 **Self-evolving** — The platform gets smarter with every lint

## AgentLinter vs Anthropic's Official Tools

Anthropic provides [CLAUDE.md memory](https://code.claude.com/docs/en/memory) and [skills](https://code.claude.com/docs/en/skills) — the building blocks for agent configuration. AgentLinter tells you if you're using them well.

| Feature | Claude Code (Anthropic) | AgentLinter |
|---------|------------------------|-------------|
| **Scoring** | Single score via `/init` | 5-category breakdown (0–100) |
| **Scope** | Single CLAUDE.md file | Entire workspace (all .md files) |
| **Cross-file consistency** | — | Detects contradictions across files |
| **Secret scanning** | — | API keys, tokens, passwords |
| **Auto-fix** | Suggestions via prompting | One-command `--fix` |
| **Custom rules** | — | `.agentlinterrc` per team |
| **CI/CD integration** | — | GitHub Action on every PR |
| **Templates** | `/init` bootstrap | 4 templates (personal, coding, team, chatbot) |
| **Shareable reports** | — | Web reports + Score Cards for X |
| **Multi-framework** | Claude Code only | Claude Code, Clawdbot, Cursor, Windsurf |

> **Not a replacement — an extension.** AgentLinter builds on Anthropic's CLAUDE.md standard and the [Agent Skills](https://agentskills.io) open standard. Think of it as ESLint for your JavaScript — the language gives you the syntax, the linter tells you if your code is good.

## Supports

- Claude Code
- Clawdbot
- Cursor
- Windsurf
- Any AI agent workspace

## License

MIT

---

Built by [@simonkim_nft](https://twitter.com/simonkim_nft)
