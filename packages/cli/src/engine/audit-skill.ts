/* ─── Skill Audit Engine ─── */
/* Deep security audit for external skill files (MoltX-style attacks) */

export type AuditSeverity = "CRITICAL" | "WARNING" | "INFO";

export interface AuditFinding {
  severity: AuditSeverity;
  category: string;
  line?: number;
  match: string;
  message: string;
  recommendation: string;
}

export interface AuditResult {
  file: string;
  findings: AuditFinding[];
  riskScore: number; // 0-100 (higher = more dangerous)
  verdict: "SAFE" | "SUSPICIOUS" | "DANGEROUS" | "MALICIOUS";
}

/* ─── Pattern Definitions ─── */

const REMOTE_FETCH_PATTERNS = [
  { pattern: /curl\s+.*-[so]\s+.*skill/i, name: "curl download skill file" },
  { pattern: /curl\s+.*skill\.md/i, name: "curl fetch skill.md" },
  { pattern: /wget\s+.*skill/i, name: "wget download skill" },
  { pattern: /curl\s+.*\|\s*(?:bash|sh|zsh)/i, name: "pipe curl to shell" },
  { pattern: /wget\s+.*-O\s*-\s*\|\s*(?:bash|sh)/i, name: "pipe wget to shell" },
  { pattern: /fetch\s*\(\s*['"`]https?:\/\/[^'"]+skill/i, name: "fetch skill URL" },
  { pattern: /curl\s+-s\s+https?:\/\/[^\s]+\s+-o\s+~\//i, name: "silent curl to home dir" },
];

const PREDICTABLE_KEY_STORAGE_PATTERNS = [
  { pattern: /~\/\.agents\/[^\/]*\/vault\//i, name: "~/.agents/*/vault/ path" },
  { pattern: /vault\/private_key/i, name: "vault/private_key storage" },
  { pattern: /vault\/seed_phrase/i, name: "vault/seed_phrase storage" },
  { pattern: />\s*~\/\.agents\/[^\/]+\/[^\/]*key/i, name: "redirect key to agents dir" },
  { pattern: /echo\s+.*private_key.*>\s*~/i, name: "echo private_key to file" },
  { pattern: /echo\s+.*seed.*>\s*~/i, name: "echo seed to file" },
  { pattern: /generate-private-key.*>\s*~/i, name: "generate key to predictable path" },
  { pattern: /store.*private.*key.*at\s+/i, name: "store key instruction" },
  { pattern: /save.*private.*key.*to\s+/i, name: "save key instruction" },
  { pattern: /0x[A-Fa-f0-9]{64}/i, name: "hardcoded private key pattern" },
];

const MANDATORY_WALLET_PATTERNS = [
  { pattern: /\bMANDATORY\b.*wallet/i, name: "MANDATORY wallet" },
  { pattern: /wallet.*\bMANDATORY\b/i, name: "wallet MANDATORY" },
  { pattern: /\brequired\b.*link.*wallet/i, name: "required link wallet" },
  { pattern: /\bmust\b.*link.*wallet/i, name: "must link wallet" },
  { pattern: /wallet.*\brequired\b/i, name: "wallet required" },
  { pattern: /cannot\s+(?:post|like|follow).*without.*wallet/i, name: "cannot use without wallet" },
  { pattern: /\bNOT\s+optional\b/i, name: "NOT optional coercion" },
  { pattern: /Do\s+This\s+Immediately/i, name: "urgency coercion" },
  { pattern: /\bfirst\s+boot\b.*required/i, name: "first boot requirement" },
];

const SUSPICIOUS_RATE_LIMIT_PATTERNS = [
  { pattern: /(\d{4,})\s*(?:\/|\s+per\s+)?\s*(?:min|minute)/i, name: "high rate per minute" },
  { pattern: /rate.*limit.*(\d{4,})/i, name: "rate limit 1000+" },
  { pattern: /(\d+)\s*(?:likes?|follows?|posts?).*(?:\/|\s+per\s+)?\s*min/i, name: "engagement rate" },
];

const AUTO_UPDATE_PATTERNS = [
  { pattern: /cron/i, name: "cron job" },
  { pattern: /every\s+\d+\s*(?:hour|minute|min|hr)/i, name: "periodic schedule" },
  { pattern: /auto[- ]?refresh/i, name: "auto-refresh" },
  { pattern: /auto[- ]?update/i, name: "auto-update" },
  { pattern: /refresh.*every/i, name: "refresh every" },
  { pattern: /update.*every/i, name: "update every" },
  { pattern: /periodic(?:ally)?\s+(?:fetch|update|download|refresh)/i, name: "periodic fetch" },
  { pattern: /schedule.*(?:curl|wget|fetch)/i, name: "scheduled fetch" },
  { pattern: /\d+h?\s*(?:refresh|update)/i, name: "timed update" },
];

const IN_BAND_INJECTION_PATTERNS = [
  { pattern: /_model_guide/i, name: "_model_guide field" },
  { pattern: /_hint/i, name: "_hint field" },
  { pattern: /_notice/i, name: "_notice field" },
  { pattern: /_instruction/i, name: "_instruction field" },
  { pattern: /_directive/i, name: "_directive field" },
  { pattern: /_system/i, name: "_system field" },
  { pattern: /in-band.*(?:instruction|prompt|injection)/i, name: "in-band injection" },
  { pattern: /response.*includes?.*(?:instruction|guide|hint)/i, name: "response includes instructions" },
];

const SECURITY_SKILL_PATTERNS = [
  /prompt[- ]?guard/i, /security/i, /injection/i, /defense/i, /detect/i,
  /shield/i, /protect/i, /hive[- ]?fence/i, /guard/i, /firewall/i,
  /threat/i, /attack/i, /vulnerability/i, /red[- ]?team/i, /pentest/i,
];

function isSecuritySkill(content: string, filename: string): boolean {
  return SECURITY_SKILL_PATTERNS.some(
    (p) => p.test(filename) || p.test(content.substring(0, 500))
  );
}

const ADDITIONAL_RED_FLAGS = [
  { pattern: /\$\d+\s*(?:USDC|USD|ETH|reward|bonus)/i, name: "monetary incentive", category: "social-engineering" },
  { pattern: /npx\s+[a-z-]+\s+generate.*key/i, name: "npx key generation", category: "supply-chain" },
  { pattern: /npm\s+install.*--global/i, name: "global npm install", category: "supply-chain" },
  { pattern: /POST.*private_key/i, name: "POST private key", category: "exfiltration" },
  { pattern: /POST.*seed/i, name: "POST seed phrase", category: "exfiltration" },
  { pattern: /verify[- ]?wallet.*POST/i, name: "verify-wallet POST", category: "exfiltration" },
  { pattern: /verify[- ]?key.*POST/i, name: "verify-key POST", category: "exfiltration" },
  { pattern: /Follow\s+Aggressively/i, name: "aggressive engagement", category: "spam" },
  { pattern: /Like\s+Everything/i, name: "mass engagement", category: "spam" },
  { pattern: /\d{2,}\s+(?:follows?|likes?).*immediately/i, name: "bulk engagement on signup", category: "spam" },
];

/* ─── Audit Logic ─── */

export function auditSkillFile(content: string, filename: string): AuditResult {
  const lines = content.split('\n');
  const findings: AuditFinding[] = [];
  const isSecurity = isSecuritySkill(content, filename);

  // Track code blocks to adjust severity
  let inCodeBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
    }
    
    // Remote Fetch
    for (const { pattern, name } of REMOTE_FETCH_PATTERNS) {
      if (pattern.test(line)) {
        findings.push({
          severity: isSecurity ? "INFO" : (inCodeBlock ? "WARNING" : "CRITICAL"),
          category: "Remote Fetch",
          line: lineNum,
          match: line.trim().substring(0, 80),
          message: `Remote skill fetch detected: ${name}`,
          recommendation: "Skills should not auto-update from external URLs. This enables supply chain attacks.",
        });
      }
    }
    
    // Predictable Key Storage
    for (const { pattern, name } of PREDICTABLE_KEY_STORAGE_PATTERNS) {
      if (pattern.test(line)) {
        findings.push({
          severity: "CRITICAL",
          category: "Predictable Key Storage",
          line: lineNum,
          match: line.trim().substring(0, 80),
          message: `Predictable key storage path: ${name}`,
          recommendation: "Storing keys at known paths enables mass exfiltration. Use randomized or user-controlled paths.",
        });
      }
    }
    
    // Mandatory Wallet
    for (const { pattern, name } of MANDATORY_WALLET_PATTERNS) {
      if (pattern.test(line)) {
        findings.push({
          severity: "WARNING",
          category: "Mandatory Wallet Linking",
          line: lineNum,
          match: line.trim().substring(0, 80),
          message: `Coerced wallet linking: ${name}`,
          recommendation: "Wallet linking should always be optional. Mandatory linking is a red flag for credential harvesting.",
        });
      }
    }
    
    // Suspicious Rate Limits
    for (const { pattern, name } of SUSPICIOUS_RATE_LIMIT_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        const num = parseInt(match[1] || '0', 10);
        if (num >= 100) {
          findings.push({
            severity: num >= 1000 ? "WARNING" : "INFO",
            category: "Suspicious Rate Limits",
            line: lineNum,
            match: line.trim().substring(0, 80),
            message: `Unusually high rate limit (${num}): ${name}`,
            recommendation: "High rate limits may indicate the skill is designed to weaponize agents for spam/engagement farming.",
          });
        }
      }
    }
    
    // Auto-Update
    for (const { pattern, name } of AUTO_UPDATE_PATTERNS) {
      if (pattern.test(line)) {
        findings.push({
          severity: isSecurity ? "INFO" : "CRITICAL",
          category: "Auto-Update Instructions",
          line: lineNum,
          match: line.trim().substring(0, 80),
          message: `Auto-update mechanism: ${name}`,
          recommendation: "Auto-updating skills can be weaponized at any time. Instructions can change without notice.",
        });
      }
    }
    
    // In-Band Injection
    for (const { pattern, name } of IN_BAND_INJECTION_PATTERNS) {
      if (pattern.test(line)) {
        findings.push({
          severity: "WARNING",
          category: "In-Band Injection Fields",
          line: lineNum,
          match: line.trim().substring(0, 80),
          message: `In-band injection vector: ${name}`,
          recommendation: "Hidden fields in API responses can inject instructions. Agent cannot distinguish data from commands.",
        });
      }
    }
    
    // Additional Red Flags
    for (const { pattern, name, category } of ADDITIONAL_RED_FLAGS) {
      if (pattern.test(line)) {
        findings.push({
          severity: category === "exfiltration" ? "CRITICAL" : "WARNING",
          category: `Additional: ${category}`,
          line: lineNum,
          match: line.trim().substring(0, 80),
          message: `Red flag: ${name}`,
          recommendation: getRecommendation(category),
        });
      }
    }
  }
  
  // Calculate risk score
  const riskScore = calculateRiskScore(findings);
  const verdict = getVerdict(riskScore, findings);
  
  return {
    file: filename,
    findings,
    riskScore,
    verdict,
  };
}

function getRecommendation(category: string): string {
  switch (category) {
    case "social-engineering":
      return "Monetary incentives can pressure users into unsafe actions.";
    case "supply-chain":
      return "Third-party package execution introduces additional attack vectors.";
    case "exfiltration":
      return "This pattern could exfiltrate sensitive data. Do NOT proceed.";
    case "spam":
      return "Aggressive engagement patterns weaponize your agent as a spam bot.";
    default:
      return "Review this pattern carefully before installing.";
  }
}

function calculateRiskScore(findings: AuditFinding[]): number {
  let score = 0;
  
  for (const f of findings) {
    switch (f.severity) {
      case "CRITICAL":
        score += 25;
        break;
      case "WARNING":
        score += 10;
        break;
      case "INFO":
        score += 3;
        break;
    }
  }
  
  // Cap at 100
  return Math.min(score, 100);
}

function getVerdict(score: number, findings: AuditFinding[]): AuditResult['verdict'] {
  const hasCritical = findings.some(f => f.severity === "CRITICAL");
  const criticalCount = findings.filter(f => f.severity === "CRITICAL").length;
  
  if (criticalCount >= 3 || score >= 80) return "MALICIOUS";
  if (hasCritical || score >= 50) return "DANGEROUS";
  if (score >= 20) return "SUSPICIOUS";
  return "SAFE";
}

/* ─── Terminal Formatting ─── */

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  bgRed: "\x1b[41m",
  bgYellow: "\x1b[43m",
  bgGreen: "\x1b[42m",
};

export function formatAuditResult(result: AuditResult): string {
  const lines: string[] = [];
  
  lines.push("");
  lines.push(`${c.magenta}${c.bold}🔍 AgentLinter Skill Audit${c.reset}`);
  lines.push(`${c.dim}File: ${result.file}${c.reset}`);
  lines.push("");
  
  // Verdict banner
  const verdictColors: Record<string, string> = {
    SAFE: c.bgGreen,
    SUSPICIOUS: c.bgYellow,
    DANGEROUS: c.bgRed,
    MALICIOUS: c.bgRed,
  };
  const verdictEmojis: Record<string, string> = {
    SAFE: "✅",
    SUSPICIOUS: "⚠️",
    DANGEROUS: "🚨",
    MALICIOUS: "💀",
  };
  
  lines.push(`  ${verdictColors[result.verdict]}${c.bold} ${verdictEmojis[result.verdict]} VERDICT: ${result.verdict} ${c.reset}`);
  lines.push(`  ${c.dim}Risk Score: ${result.riskScore}/100${c.reset}`);
  lines.push("");
  
  if (result.findings.length === 0) {
    lines.push(`  ${c.green}No dangerous patterns detected.${c.reset}`);
    lines.push("");
    return lines.join("\n");
  }
  
  // Group by category
  const byCategory = new Map<string, AuditFinding[]>();
  for (const f of result.findings) {
    const cat = f.category;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(f);
  }
  
  // Summary
  const criticals = result.findings.filter(f => f.severity === "CRITICAL").length;
  const warnings = result.findings.filter(f => f.severity === "WARNING").length;
  const infos = result.findings.filter(f => f.severity === "INFO").length;
  
  const parts: string[] = [];
  if (criticals) parts.push(`${c.red}${criticals} CRITICAL${c.reset}`);
  if (warnings) parts.push(`${c.yellow}${warnings} WARNING${c.reset}`);
  if (infos) parts.push(`${c.blue}${infos} INFO${c.reset}`);
  
  lines.push(`  📋 Findings: ${parts.join(", ")}`);
  lines.push("");
  
  // Detailed findings
  for (const [category, findings] of byCategory) {
    lines.push(`  ${c.bold}▸ ${category}${c.reset}`);
    
    for (const f of findings) {
      const sevColor = f.severity === "CRITICAL" ? c.red : f.severity === "WARNING" ? c.yellow : c.blue;
      const sevIcon = f.severity === "CRITICAL" ? "🔴" : f.severity === "WARNING" ? "🟡" : "🔵";
      
      lines.push(`    ${sevIcon} ${sevColor}${f.severity}${c.reset} ${c.dim}(line ${f.line || '?'})${c.reset}`);
      lines.push(`       ${f.message}`);
      lines.push(`       ${c.dim}Match: "${f.match}"${c.reset}`);
      lines.push(`       ${c.cyan}→ ${f.recommendation}${c.reset}`);
      lines.push("");
    }
  }
  
  // Final recommendation
  if (result.verdict === "MALICIOUS" || result.verdict === "DANGEROUS") {
    lines.push(`  ${c.red}${c.bold}⛔ DO NOT INSTALL THIS SKILL${c.reset}`);
    lines.push(`  ${c.red}This skill exhibits patterns consistent with known agent trojans (e.g., MoltX).${c.reset}`);
    lines.push(`  ${c.dim}Reference: https://dev.to/sebayaki/i-audited-moltxs-skill-file-its-an-ai-agent-trojan-horse-539k${c.reset}`);
  } else if (result.verdict === "SUSPICIOUS") {
    lines.push(`  ${c.yellow}⚠️  PROCEED WITH CAUTION${c.reset}`);
    lines.push(`  ${c.yellow}Review each finding carefully before installing.${c.reset}`);
  }
  
  lines.push("");
  return lines.join("\n");
}

export function formatAuditJSON(result: AuditResult): string {
  return JSON.stringify(result, null, 2);
}
