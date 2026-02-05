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
