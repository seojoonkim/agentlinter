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

export const skillSafetyRules: Rule[] = [
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
];
