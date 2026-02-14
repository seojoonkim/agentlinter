# 🔍 AgentLinter

**ESLint for AI Agents** — Score, diagnose, and auto-fix your `CLAUDE.md` and agent workspace files.

```bash
npx agentlinter
```

## What it does

AgentLinter scans your AI agent workspace (CLAUDE.md, AGENTS.md, SOUL.md, etc.) and scores it across 5 dimensions:

| Category | Weight | What it checks |
|----------|--------|----------------|
| **Structure** | 20% | File organization, heading hierarchy, section separation |
| **Clarity** | 25% | Instruction quality, vague language, actionability |
| **Completeness** | 20% | Required elements (identity, tools, boundaries, memory) |
| **Security** | 20% | Secret exposure, injection defense, permission boundaries |
| **Consistency** | 15% | Cross-file references, naming, language mixing |

## Usage

```bash
# Score current directory
npx agentlinter

# Score a specific workspace
npx agentlinter ./my-project

# Get JSON output (for CI/CD)
npx agentlinter --json

# Set CLI language (see `--help` for supported locales)
npx agentlinter --lang ko

# Chinese (Simplified / Traditional)
npx agentlinter --lang zh-Hans
npx agentlinter --lang zh-Hant

# Or via env var
AGENTLINTER_LANG=ko npx agentlinter

# Locale resolution priority
# --lang > AGENTLINTER_LANG > LANG > default locale (configured in i18n constants)

# Upload & share your score
npx agentlinter --share
```

## Example Output

```
🔍 AgentLinter v0.1.0
📁 Scanning workspace: ./my-agent

🏆 Overall Score: 87/100

  Structure      ████████░░ 80
  Clarity        █████████░ 90
  Completeness   ████████░░ 85
  Security       █████████░ 95
  Consistency    ███████░░░ 75

📋 2 warning(s), 3 info(s)

  ⚠️  WARN  CLAUDE.md:14
         Secret detected: API key pattern (sk-...)

  ⚠️  WARN  TOOLS.md missing
         Referenced in CLAUDE.md but file not found

💡 2 issue(s) have suggested fixes. Run `agentlinter fix --auto` to apply.
```

## Share Your Score

Use `--share` to upload your report and get a shareable link:

```bash
$ npx agentlinter --share

🔗 Share your score: https://agentlinter.com/r/abc123
```

## Supported Files

AgentLinter recognizes common agent workspace files:

- `CLAUDE.md` / `AGENTS.md` — Main agent instructions
- `SOUL.md` — Personality/persona
- `IDENTITY.md` — Name, origin
- `USER.md` — User context
- `TOOLS.md` — Tool documentation
- `SECURITY.md` — Security rules
- And more...

## Privacy

- **No file content is uploaded** — only scores, category breakdowns, and diagnostic messages
- File names are sent (for the "Files Scanned" section)
- A hashed machine ID is used for score history (no PII)
- Use `--no-share` (default) to keep everything local

## Links

- **Website:** [agentlinter.com](https://agentlinter.com)
- **GitHub:** [github.com/seojoonkim/agentlinter](https://github.com/seojoonkim/agentlinter)

## License

MIT
