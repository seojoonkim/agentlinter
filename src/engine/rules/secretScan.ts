/* ─── Secret Scan / Security Check (v1.1.0) ─── */
// Dedicated lightweight scanner for the most common secret patterns and
// prompt-injection vulnerability indicators. Complements the full
// security.ts rule set with focused, fast checks.

import { Rule, Diagnostic } from "../types";

const SECRET_PATTERNS = [
  { name: "OpenAI key (sk-)", pattern: /\bsk-[a-zA-Z0-9]{20,}\b/ },
  { name: "Bearer token", pattern: /Bearer\s+[a-zA-Z0-9._\-]{20,}/ },
  { name: "GitHub PAT (ghp_)", pattern: /\bghp_[a-zA-Z0-9]{36}\b/ },
  { name: "GitHub PAT (ghs_)", pattern: /\bghs_[a-zA-Z0-9]{36}\b/ },
  { name: "AWS Access Key", pattern: /\bAKIA[A-Z0-9]{16}\b/ },
  { name: "Slack token", pattern: /\bxox[bpas]-[a-zA-Z0-9\-]{10,}\b/ },
  { name: "Stripe key", pattern: /\bsk_(?:test|live)_[a-zA-Z0-9]{24,}\b/ },
  { name: "Anthropic key", pattern: /\bsk-ant-[a-zA-Z0-9\-]{20,}\b/ },
];

const INJECTION_RISK_PATTERNS = [
  { name: "ignore-previous instruction", pattern: /ignore (previous|all|above|prior) instructions?/i },
  { name: "jailbreak phrase", pattern: /jailbreak|DAN mode|pretend you have no restrictions/i },
  { name: "role-override phrase", pattern: /you are now|your new role is|act as if you have no/i },
];

export const secretScanRules: Rule[] = [
  {
    id: "security/secret-scan",
    category: "security",
    severity: "critical",
    description:
      "Scans for exposed API keys/tokens (sk-, Bearer, ghp_, etc.) that should never appear in agent config files.",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      for (const file of files) {
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];
          // Skip comment lines
          if (line.trim().startsWith("//") || line.trim().startsWith("#")) continue;
          for (const { name, pattern } of SECRET_PATTERNS) {
            if (pattern.test(line)) {
              const masked = line.replace(pattern, "[REDACTED]");
              diagnostics.push({
                severity: "critical",
                category: "security",
                rule: this.id,
                file: file.name,
                line: i + 1,
                message: `Exposed secret: ${name} detected — ${masked.trim().substring(0, 100)}`,
                fix: "Remove the secret immediately. Store it in an environment variable (e.g. $OPENAI_API_KEY) and reference it by name. Rotate the leaked credential.",
              });
            }
          }
        }
      }
      return diagnostics;
    },
  },

  {
    id: "security/injection-vulnerability",
    category: "security",
    severity: "warning",
    description:
      "Detects prompt injection vulnerability phrases that attackers might plant in external content your agent reads.",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      for (const file of files) {
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];
          for (const { name, pattern } of INJECTION_RISK_PATTERNS) {
            if (pattern.test(line)) {
              diagnostics.push({
                severity: "warning",
                category: "security",
                rule: this.id,
                file: file.name,
                line: i + 1,
                message: `Potential injection risk: "${name}" phrase found. If this comes from external input, the agent may be hijacked.`,
                fix: "Add explicit injection defense in SECURITY.md or AGENTS.md: instruct the agent to ignore instruction-override commands from external content. Consider using prompt-guard skill.",
              });
            }
          }
        }
      }
      return diagnostics;
    },
  },
];
