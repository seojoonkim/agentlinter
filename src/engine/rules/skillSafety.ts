/* ─── Skill Safety Rules (10%) ─── */
/* Pre-install security checks for agent skills */

import { Rule, Diagnostic } from "../types";

/** Patterns that indicate potentially dangerous skill behavior */
const DANGEROUS_EXEC_PATTERNS = [
  { pattern: /rm\s+-rf\s+[\/~]/, name: "Recursive delete on root/home", severity: "error" as const },
  { pattern: /curl\s+.*\|\s*(?:bash|sh|zsh)/, name: "Pipe curl to shell", severity: "error" as const },
  { pattern: /eval\s*\(/, name: "Dynamic eval execution", severity: "warning" as const },
  { pattern: /wget\s+.*-O\s*-\s*\|\s*(?:bash|sh)/, name: "Pipe wget to shell", severity: "error" as const },
  { pattern: /chmod\s+777/, name: "World-writable permissions", severity: "warning" as const },
  { pattern: /sudo\s+/, name: "Sudo usage", severity: "warning" as const },
];

const SENSITIVE_PATH_PATTERNS = [
  { pattern: /~\/\.ssh/, name: "SSH keys directory" },
  { pattern: /~\/\.gnupg/, name: "GPG keys directory" },
  { pattern: /~\/\.aws\/credentials/, name: "AWS credentials" },
  { pattern: /~\/\.env/, name: "Environment file" },
  { pattern: /\/etc\/passwd/, name: "System password file" },
  { pattern: /\/etc\/shadow/, name: "System shadow file" },
  { pattern: /~\/\.clawdbot\/clawdbot\.json/, name: "Agent config with tokens" },
];

const DATA_EXFIL_PATTERNS = [
  { pattern: /curl\s+.*-d\s+.*\$/, name: "curl POST with variable data" },
  { pattern: /curl\s+.*--data.*\$/, name: "curl data with variable" },
  { pattern: /fetch\s*\(.*\+/, name: "Dynamic fetch URL construction" },
  { pattern: /webhook\.site|requestbin|pipedream/, name: "Known data collection service" },
  { pattern: /ngrok|localhost\.run|serveo/, name: "Tunnel service (potential exfil)" },
];

/** v0.9.0: Enhanced credential exfiltration patterns */
const CREDENTIAL_EXFIL_PATTERNS = [
  { pattern: /(?:send|post|upload|forward)\s+(?:to|data\s+to)\s+https?:\/\//i, name: "Credential exfil: send to external URL", severity: "critical" as const },
  { pattern: /POST\s+(?:to\s+)?https?:\/\//i, name: "Credential exfil: POST to external URL", severity: "critical" as const },
  { pattern: /webhook\s*[:=]?\s*https?:\/\//i, name: "Webhook with external URL", severity: "critical" as const },
  { pattern: /exfil/i, name: "Exfiltration keyword", severity: "critical" as const },
];

/** v0.9.0: Backdoor / override patterns */
const BACKDOOR_PATTERNS = [
  { pattern: /hidden\s+instruction/i, name: "Hidden instruction", severity: "critical" as const },
  { pattern: /ignore\s+(?:all\s+)?previous/i, name: "Ignore previous instructions", severity: "critical" as const },
  { pattern: /override\s+safety/i, name: "Override safety", severity: "critical" as const },
  { pattern: /bypass\s+(?:security|safety|guard|filter)/i, name: "Bypass security", severity: "critical" as const },
];

/** v0.9.0: Prompt injection patterns (multilingual) */
const PROMPT_INJECTION_PATTERNS = [
  { pattern: /당신은\s*사실/i, name: "Korean injection: 당신은 사실", severity: "error" as const },
  { pattern: /실제로는/i, name: "Korean injection: 실제로는", severity: "error" as const },
  { pattern: /이전\s*지시\s*무시/i, name: "Korean injection: 이전 지시 무시", severity: "critical" as const },
  { pattern: /you\s+are\s+actually/i, name: "English injection: you are actually", severity: "error" as const },
  { pattern: /in\s+reality\s+you/i, name: "English injection: in reality you", severity: "error" as const },
  { pattern: /disregard\s+(?:all\s+)?(?:previous|prior|above)/i, name: "Disregard previous", severity: "critical" as const },
];

/** Security/defense skills document attacks as examples — demote severity for these */
const SECURITY_SKILL_PATTERNS = [
  /prompt[- ]?guard/i, /security/i, /injection/i, /defense/i, /detect/i,
  /shield/i, /protect/i, /hive[- ]?fence/i, /guard/i, /firewall/i,
  /threat/i, /attack/i, /vulnerability/i, /red[- ]?team/i, /pentest/i,
];

/** Check if a file is a security-related skill (documents attack patterns for defensive purposes) */
function isSecuritySkill(file: { name: string; content: string }): boolean {
  return SECURITY_SKILL_PATTERNS.some(
    (p) => p.test(file.name) || p.test(file.content.substring(0, 500))
  );
}

/** Side-effect keywords that warrant disable-model-invocation */
const SIDEEFFECT_KEYWORDS =
  /\b(deploy|deployment|publish|release|commit|push|merge|delete|rm\s+-rf|drop\s+database|truncate)\b/i;

export const skillSafetyRules: Rule[] = [
  /* ── v0.8.2: skill-name-match-dir ── */
  {
    id: "skill-safety/skill-name-match-dir",
    category: "skillSafety",
    severity: "error",
    description: "SKILL.md name frontmatter must match parent directory name",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const skillFiles = files.filter(
        (f) => f.name.includes("skills/") && f.name.endsWith("SKILL.md")
      );

      for (const file of skillFiles) {
        if (!file.content.startsWith("---")) continue;

        const frontmatter = file.content.split("---")[1] || "";
        const nameMatch = frontmatter.match(/^name:\s*["']?([^\n"']+)["']?/m);
        if (!nameMatch) continue;

        const declaredName = nameMatch[1].trim();
        const parts = file.name.split("/");
        const skillDirIndex = parts.lastIndexOf("SKILL.md") - 1;
        if (skillDirIndex < 0) continue;
        const dirName = parts[skillDirIndex];

        if (declaredName !== dirName) {
          diagnostics.push({
            severity: "error",
            category: "skillSafety",
            rule: this.id,
            file: file.name,
            message: `Skill name "${declaredName}" does not match directory name "${dirName}". ClawdHub uses the directory name for routing.`,
            fix: `Change name to "${dirName}" in frontmatter, or rename the directory to "${declaredName}".`,
          });
        }
      }
      return diagnostics;
    },
  },

  /* ── v0.8.2: skill-description-when-to-use ── */
  {
    id: "skill-safety/skill-description-when-to-use",
    category: "skillSafety",
    severity: "warning",
    description: "SKILL.md description should explain when to use the skill",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const skillFiles = files.filter(
        (f) => f.name.includes("skills/") && f.name.endsWith("SKILL.md")
      );

      for (const file of skillFiles) {
        if (!file.content.startsWith("---")) continue;

        const frontmatter = file.content.split("---")[1] || "";
        const descMatch = frontmatter.match(/^description:\s*["']?([^\n"']+)["']?/m);
        if (!descMatch) continue;

        const description = descMatch[1].trim();

        const hasWhenToUse =
          /when\s+to\s+use/i.test(description) ||
          /use\s+when/i.test(description) ||
          /when\s+claude/i.test(description) ||
          /when\s+(?:the\s+)?(?:user|agent)/i.test(description) ||
          /for\s+(?:when|situations?\s+where)/i.test(description) ||
          /invok(?:e|ed)\s+when/i.test(description) ||
          /trigger(?:ed)?\s+when/i.test(description);

        if (!hasWhenToUse) {
          diagnostics.push({
            severity: "warning",
            category: "skillSafety",
            rule: this.id,
            file: file.name,
            message: `Skill description does not explain when to use it: "${description.substring(0, 80)}"`,
            fix: 'Add "when to use" context to description. Example: "Use when user asks for X" or "When Claude needs to Y".',
          });
        }
      }
      return diagnostics;
    },
  },

  /* ── v0.8.0: skill-description-required ── */
  {
    id: "skill-safety/skill-description-required",
    category: "skillSafety",
    severity: "warning",
    description:
      "Skills SKILL.md must have a 'description' frontmatter field — Claude uses this to decide when to invoke the skill automatically",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      const skillFiles = files.filter(
        (f) => f.name.includes("skills/") && f.name.endsWith("SKILL.md")
      );

      for (const file of skillFiles) {
        if (!file.content.startsWith("---")) {
          diagnostics.push({
            severity: "warning",
            category: "skillSafety",
            rule: this.id,
            file: file.name,
            message: "Skill missing YAML frontmatter — description is required for auto-invocation.",
            fix: "Add frontmatter with description:\n---\nname: skill-name\ndescription: \"When and what this skill does\"\n---",
          });
          continue;
        }

        const frontmatter = file.content.split("---")[1] || "";
        if (!frontmatter.includes("description")) {
          diagnostics.push({
            severity: "warning",
            category: "skillSafety",
            rule: this.id,
            file: file.name,
            message:
              "Skill missing 'description' field — Claude cannot determine when to auto-invoke this skill.",
            fix:
              "Add description to frontmatter. Be specific about when to use it:\n  description: \"Use when user asks to analyze TypeScript type errors\"",
          });
        }
      }

      return diagnostics;
    },
  },

  /* ── v0.8.0: sideeffect-skill-manual ── */
  {
    id: "skill-safety/sideeffect-skill-manual",
    category: "skillSafety",
    severity: "warning",
    description:
      "Skills with side effects (deploy, commit, publish) should have 'disable-model-invocation: true' to prevent accidental auto-execution",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      const skillFiles = files.filter(
        (f) => f.name.includes("skills/") && f.name.endsWith("SKILL.md")
      );

      for (const file of skillFiles) {
        // Check if the skill contains side-effect keywords
        const hasSideEffect = SIDEEFFECT_KEYWORDS.test(file.content);
        if (!hasSideEffect) continue;

        // Check if disable-model-invocation is set
        const hasDisableFlag =
          file.content.includes("disable-model-invocation: true") ||
          file.content.includes("disable-model-invocation:true");

        if (!hasDisableFlag) {
          // Find which side-effect keyword triggered this
          const match = file.content.match(SIDEEFFECT_KEYWORDS);
          diagnostics.push({
            severity: "warning",
            category: "skillSafety",
            rule: this.id,
            file: file.name,
            message: `Skill contains side-effect keyword '${match?.[0] ?? ""}' but lacks 'disable-model-invocation: true'. Claude may auto-execute this skill unexpectedly.`,
            fix:
              "Add to frontmatter:\n  disable-model-invocation: true\nThis ensures the skill only runs when explicitly invoked by the user.",
          });
        }
      }

      return diagnostics;
    },
  },

  /* ── v0.8.0: skill-line-limit ── */
  {
    id: "skill-safety/skill-line-limit",
    category: "skillSafety",
    severity: "warning",
    description:
      "SKILL.md files should stay under 500 lines — Claude Code official recommendation for skill file size",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      const skillFiles = files.filter(
        (f) => f.name.includes("skills/") && f.name.endsWith("SKILL.md")
      );

      for (const file of skillFiles) {
        if (file.lines.length > 500) {
          diagnostics.push({
            severity: "warning",
            category: "skillSafety",
            rule: this.id,
            file: file.name,
            message: `SKILL.md has ${file.lines.length} lines (limit: 500). Large skill files increase context window usage.`,
            fix:
              "Move detailed content into supporting files:\n" +
              "  skills/my-skill/SKILL.md  ← overview only (≤500 lines)\n" +
              "  skills/my-skill/reference.md  ← detailed reference\n" +
              "  skills/my-skill/examples.md  ← code examples",
          });
        } else if (file.lines.length > 300) {
          diagnostics.push({
            severity: "info",
            category: "skillSafety",
            rule: this.id,
            file: file.name,
            message: `SKILL.md has ${file.lines.length} lines — approaching 500-line limit. Consider splitting long sections.`,
            fix: "Consider extracting examples or detailed documentation into separate supporting files.",
          });
        }
      }

      return diagnostics;
    },
  },


  {
    id: "skill-safety/has-metadata",
    category: "skillSafety",
    severity: "warning",
    description: "Skills should have proper metadata (name, description, author)",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const skillFiles = files.filter(
        (f) => f.name.includes("skills/") && f.name.endsWith("SKILL.md")
      );

      for (const file of skillFiles) {
        const hasFrontmatter = file.content.startsWith("---");
        if (!hasFrontmatter) {
          diagnostics.push({
            severity: "info",
            category: "skillSafety",
            rule: this.id,
            file: file.name,
            message: "Skill missing YAML frontmatter (name, description, author).",
            fix: "Add frontmatter: ---\\nname: skill-name\\ndescription: ...\\nauthor: ...\\n---",
          });
          continue;
        }

        const frontmatter = file.content.split("---")[1] || "";
        if (!frontmatter.includes("author")) {
          diagnostics.push({
            severity: "info",
            category: "skillSafety",
            rule: this.id,
            file: file.name,
            message: "Skill missing author field — unattributed skills are harder to trust.",
            fix: "Add author field to frontmatter.",
          });
        }
        if (!frontmatter.includes("description")) {
          diagnostics.push({
            severity: "info",
            category: "skillSafety",
            rule: this.id,
            file: file.name,
            message: "Skill missing description — unclear what this skill does.",
            fix: "Add a description field to frontmatter.",
          });
        }
      }
      return diagnostics;
    },
  },

  {
    id: "skill-safety/dangerous-commands",
    category: "skillSafety",
    severity: "error",
    description: "Skills should not contain dangerous shell commands",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const skillFiles = files.filter((f) => f.name.includes("skills/"));

      for (const file of skillFiles) {
        let inCodeBlock = false;
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];
          if (line.trim().startsWith("```")) inCodeBlock = !inCodeBlock;

          for (const { pattern, name, severity } of DANGEROUS_EXEC_PATTERNS) {
            if (pattern.test(line)) {
              // Demote if inside code block, documentation line, or install instructions
              const isDoc = inCodeBlock
                || /^[\s]*[>$#❌✅|]/.test(line)
                || /install|prerequisite|setup|dependency/i.test(file.lines[Math.max(0, i - 3)]?.concat(file.lines[Math.max(0, i - 2)] || "", file.lines[Math.max(0, i - 1)] || "") || "");

              diagnostics.push({
                severity: isDoc ? "info" : severity,
                category: "skillSafety",
                rule: this.id,
                file: file.name,
                line: i + 1,
                message: `Dangerous command: ${name} — "${line.trim().substring(0, 60)}"`,
                fix: "Review this command carefully. Consider restricting scope or adding user confirmation.",
              });
            }
          }
        }
      }
      return diagnostics;
    },
  },

  {
    id: "skill-safety/sensitive-paths",
    category: "skillSafety",
    severity: "warning",
    description: "Skills should not access sensitive system paths",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const skillFiles = files.filter((f) => f.name.includes("skills/"));
      for (const file of skillFiles) {
        const isSecurity = isSecuritySkill(file);
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];
          for (const { pattern, name } of SENSITIVE_PATH_PATTERNS) {
            if (pattern.test(line)) {
              diagnostics.push({
                severity: isSecurity ? "info" : "warning",
                category: "skillSafety",
                rule: this.id,
                file: file.name,
                line: i + 1,
                message: `Access to sensitive path: ${name}`,
                fix: isSecurity
                  ? "This is a security skill documenting sensitive paths. Verify context."
                  : "Ensure this access is necessary and the skill has legitimate reasons for it.",
              });
            }
          }
        }
      }
      return diagnostics;
    },
  },

  {
    id: "skill-safety/data-exfiltration",
    category: "skillSafety",
    severity: "error",
    description: "Skills should not exfiltrate data to external services",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const skillFiles = files.filter((f) => f.name.includes("skills/"));

      for (const file of skillFiles) {
        const isSecurity = isSecuritySkill(file);
        let inCodeBlock = false;
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];
          if (line.trim().startsWith("```")) inCodeBlock = !inCodeBlock;
          for (const { pattern, name } of DATA_EXFIL_PATTERNS) {
            if (pattern.test(line)) {
              const isDoc = isSecurity || inCodeBlock || /^[\s]*[>❌✅|$#]/.test(line);
              diagnostics.push({
                severity: isDoc ? "info" : "error",
                category: "skillSafety",
                rule: this.id,
                file: file.name,
                line: i + 1,
                message: `Potential data exfiltration: ${name}`,
                fix: "Review this skill for data exfiltration. Ensure external calls are intentional and authorized.",
              });
            }
          }
        }
      }
      return diagnostics;
    },
  },

  {
    id: "skill-safety/excessive-permissions",
    category: "skillSafety",
    severity: "warning",
    description: "Skills requesting broad permissions should be flagged",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const skillFiles = files.filter(
        (f) => f.name.includes("skills/") && f.name.endsWith("SKILL.md")
      );

      const broadPermissionPatterns = [
        /(?:grant|give|require|need)s?\s+(?:full|unrestricted|unlimited)\s+(?:access|permission|control)/i,
        /(?:grant|give|require|need)s?\s+access\s+(?:to\s+)?(?:all|any|every)\s+(?:files?|directories|folders)/i,
        /(?:read|write|modify)\s+(?:any|all|every)\s+(?:files?|data|directories)/i,
        /disable\s+(?:security|safety|restrictions|guardrails)/i,
      ];

      for (const file of skillFiles) {
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];
          for (const pattern of broadPermissionPatterns) {
            if (pattern.test(line)) {
              diagnostics.push({
                severity: "warning",
                category: "skillSafety",
                rule: this.id,
                file: file.name,
                line: i + 1,
                message: `Broad permission request: "${line.trim().substring(0, 60)}"`,
                fix: "Skills should request minimal necessary permissions. Review scope.",
              });
            }
          }
        }
      }
      return diagnostics;
    },
  },

  {
    id: "skill-safety/injection-vectors",
    category: "skillSafety",
    severity: "error",
    description: "Skills should not contain prompt injection vectors",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const skillFiles = files.filter((f) => f.name.includes("skills/"));

      const injectionPatterns = [
        /ignore\s+(?:all\s+)?(?:previous|above|prior)\s+(?:instructions?|rules?|constraints?)/i,
        /forget\s+(?:all|everything|your)\s+(?:previous|prior|above)/i,
        /system\s*:\s*you\s+(?:are|must|should|will)/i,
        /override\s+(?:all|your|system)\s+(?:rules|instructions|constraints)/i,
      ];
      // "you are now" is only suspicious if followed by jailbreak-style role changes, not normal role descriptions
      const jailbreakRolePattern = /you\s+are\s+now\s+(?:a|an|in)\s+(?:new|different|unrestricted|evil|DAN|jailbr)/i;

      for (const file of skillFiles) {
        const isSecurity = isSecuritySkill(file);
        let inCodeBlock = false;

        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];

          // Track code blocks
          if (line.trim().startsWith("```")) inCodeBlock = !inCodeBlock;

          const allPatterns = [...injectionPatterns, jailbreakRolePattern];
          for (const pattern of allPatterns) {
            if (pattern.test(line)) {
              // Demote severity for security docs, code blocks, or example lines
              const isExample = inCodeBlock
                || /^[\s]*[❌✅⚠️|>$#]/.test(line)
                || /example|detect|pattern|test/i.test(line)
                || isSecurity;

              diagnostics.push({
                severity: isExample ? "info" : "error",
                category: "skillSafety",
                rule: this.id,
                file: file.name,
                line: i + 1,
                message: `Potential injection vector in skill: "${line.trim().substring(0, 60)}"`,
                fix: isExample
                  ? "This appears to be a security example/documentation. Verify it's not executable."
                  : "This skill may contain a prompt injection attack. Do NOT install without careful review.",
              });
            }
          }
        }
      }
      return diagnostics;
    },
  },

  /* ── v0.9.0: Enhanced security scanner ── */
  {
    id: "skill-safety/credential-exfil",
    category: "skillSafety",
    severity: "critical",
    description: "Skills should not send credentials or data to external URLs",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const skillFiles = files.filter((f) => f.name.includes("skills/"));
      for (const file of skillFiles) {
        const isSecurity = isSecuritySkill(file);
        let inCodeBlock = false;
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];
          if (line.trim().startsWith("```")) inCodeBlock = !inCodeBlock;
          for (const { pattern, name, severity } of CREDENTIAL_EXFIL_PATTERNS) {
            if (pattern.test(line)) {
              const isDoc = isSecurity || inCodeBlock || /^[\s]*[>❌✅|$#]/.test(line);
              diagnostics.push({
                severity: isDoc ? "info" : severity,
                category: "skillSafety",
                rule: this.id,
                file: file.name,
                line: i + 1,
                message: `[CRITICAL] ${name}: "${line.trim().substring(0, 60)}"`,
                fix: "This pattern strongly suggests credential theft. Do NOT install this skill.",
              });
            }
          }
        }
      }
      return diagnostics;
    },
  },

  {
    id: "skill-safety/backdoor-patterns",
    category: "skillSafety",
    severity: "critical",
    description: "Skills should not contain backdoor or override patterns",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const skillFiles = files.filter((f) => f.name.includes("skills/"));
      for (const file of skillFiles) {
        const isSecurity = isSecuritySkill(file);
        let inCodeBlock = false;
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];
          if (line.trim().startsWith("```")) inCodeBlock = !inCodeBlock;
          for (const { pattern, name, severity } of BACKDOOR_PATTERNS) {
            if (pattern.test(line)) {
              const isDoc = isSecurity || inCodeBlock || /^[\s]*[>❌✅|$#]/.test(line) || /example|detect|pattern/i.test(line);
              diagnostics.push({
                severity: isDoc ? "info" : severity,
                category: "skillSafety",
                rule: this.id,
                file: file.name,
                line: i + 1,
                message: `[HIGH] Backdoor pattern: ${name} — "${line.trim().substring(0, 60)}"`,
                fix: isDoc
                  ? "Security documentation detected. Verify this is not executable."
                  : "This skill contains a backdoor pattern. Do NOT install.",
              });
            }
          }
        }
      }
      return diagnostics;
    },
  },

  {
    id: "skill-safety/prompt-injection-multilingual",
    category: "skillSafety",
    severity: "error",
    description: "Skills should not contain multilingual prompt injection patterns",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const skillFiles = files.filter((f) => f.name.includes("skills/"));
      for (const file of skillFiles) {
        const isSecurity = isSecuritySkill(file);
        let inCodeBlock = false;
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];
          if (line.trim().startsWith("```")) inCodeBlock = !inCodeBlock;
          for (const { pattern, name, severity } of PROMPT_INJECTION_PATTERNS) {
            if (pattern.test(line)) {
              const isDoc = isSecurity || inCodeBlock || /^[\s]*[>❌✅|$#]/.test(line) || /example|detect|pattern/i.test(line);
              diagnostics.push({
                severity: isDoc ? "info" : severity,
                category: "skillSafety",
                rule: this.id,
                file: file.name,
                line: i + 1,
                message: `Prompt injection: ${name} — "${line.trim().substring(0, 60)}"`,
                fix: isDoc
                  ? "Security documentation detected. Verify context."
                  : "This skill contains a prompt injection attack. Do NOT install.",
              });
            }
          }
        }
      }
      return diagnostics;
    },
  },
];
