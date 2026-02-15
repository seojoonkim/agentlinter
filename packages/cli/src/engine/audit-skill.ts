/* ─── Skill Audit Engine ─── */
/* Deep security audit for external skill files (MoltX-style attacks) */
import { DEFAULT_LOCALE, Locale, getAuditVerdictText, getSeverityLabel, t } from "../i18n";

export type AuditSeverity = "CRITICAL" | "WARNING" | "INFO";

type AuditI18nMeta = {
  sourceKey: string;
  title: string;
  titleKey: string;
  count?: number;
};

export interface AuditFinding {
  severity: AuditSeverity;
  category: string;
  line?: number;
  match: string;
  message: string;
  recommendation: string;
  _i18n?: AuditI18nMeta;
}

export interface AuditResult {
  file: string;
  findings: AuditFinding[];
  riskScore: number; // 0-100 (higher = more dangerous)
  verdict: "SAFE" | "SUSPICIOUS" | "DANGEROUS" | "MALICIOUS";
}

const AUDIT_SOURCE_KEY_BY_CATEGORY = {
  "Remote Fetch": "remote_fetch",
  "Predictable Key Storage": "predictable_key_storage",
  "Mandatory Wallet Linking": "mandatory_wallet_linking",
  "Suspicious Rate Limits": "suspicious_rate_limits",
  "Auto-Update Instructions": "auto_update_instructions",
  "In-Band Injection Fields": "in_band_injection_fields",
  "Additional: social-engineering": "additional_social_engineering",
  "Additional: supply-chain": "additional_supply_chain",
  "Additional: exfiltration": "additional_exfiltration",
  "Additional: spam": "additional_spam",
} as const;

const AUDIT_RECOMMENDATION_BY_SOURCE: Record<string, string> = {
  remote_fetch:
    "Skills should not auto-update from external URLs. This enables supply chain attacks.",
  predictable_key_storage:
    "Storing keys at known paths enables mass exfiltration. Use randomized or user-controlled paths.",
  mandatory_wallet_linking:
    "Wallet linking should always be optional. Mandatory linking is a red flag for credential harvesting.",
  suspicious_rate_limits:
    "High rate limits may indicate the skill is designed to weaponize agents for spam/engagement farming.",
  auto_update_instructions:
    "Auto-updating skills can be weaponized at any time. Instructions can change without notice.",
  in_band_injection_fields:
    "Hidden fields in API responses can inject instructions. Agent cannot distinguish data from commands.",
  additional_social_engineering:
    "Monetary incentives can pressure users into unsafe actions.",
  additional_supply_chain:
    "Third-party package execution introduces additional attack vectors.",
  additional_exfiltration:
    "This pattern could exfiltrate sensitive data. Do NOT proceed.",
  additional_spam:
    "Aggressive engagement patterns weaponize your agent as a spam bot.",
};

function normalizeAuditToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getAuditSourceKey(category: string): string {
  return (
    AUDIT_SOURCE_KEY_BY_CATEGORY[category as keyof typeof AUDIT_SOURCE_KEY_BY_CATEGORY] ??
    normalizeAuditToken(category.replace(/^Additional:\s*/i, "additional "))
  );
}

function buildAuditMessage(sourceKey: string, title: string, count?: number): string {
  if (sourceKey === "remote_fetch") {
    return `Remote skill fetch detected: ${title}`;
  }
  if (sourceKey === "predictable_key_storage") {
    return `Predictable key storage path: ${title}`;
  }
  if (sourceKey === "mandatory_wallet_linking") {
    return `Coerced wallet linking: ${title}`;
  }
  if (sourceKey === "suspicious_rate_limits") {
    return `Unusually high rate limit (${count ?? 0}): ${title}`;
  }
  if (sourceKey === "auto_update_instructions") {
    return `Auto-update mechanism: ${title}`;
  }
  if (sourceKey === "in_band_injection_fields") {
    return `In-band injection vector: ${title}`;
  }
  return `Red flag: ${title}`;
}

function createAuditFinding(params: {
  severity: AuditSeverity;
  category: string;
  line: number;
  match: string;
  sourceKey: string;
  title: string;
  count?: number;
}): AuditFinding {
  const recommendation =
    AUDIT_RECOMMENDATION_BY_SOURCE[params.sourceKey] ??
    "Review this pattern carefully before installing.";

  return {
    severity: params.severity,
    category: params.category,
    line: params.line,
    match: params.match,
    message: buildAuditMessage(params.sourceKey, params.title, params.count),
    recommendation,
    _i18n: {
      sourceKey: params.sourceKey,
      title: params.title,
      titleKey: normalizeAuditToken(params.title),
      count: params.count,
    },
  };
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
        findings.push(createAuditFinding({
          severity: inCodeBlock ? "WARNING" : "CRITICAL",
          category: "Remote Fetch",
          line: lineNum,
          match: line.trim().substring(0, 80),
          sourceKey: getAuditSourceKey("Remote Fetch"),
          title: name,
        }));
      }
    }
    
    // Predictable Key Storage
    for (const { pattern, name } of PREDICTABLE_KEY_STORAGE_PATTERNS) {
      if (pattern.test(line)) {
        findings.push(createAuditFinding({
          severity: "CRITICAL",
          category: "Predictable Key Storage",
          line: lineNum,
          match: line.trim().substring(0, 80),
          sourceKey: getAuditSourceKey("Predictable Key Storage"),
          title: name,
        }));
      }
    }
    
    // Mandatory Wallet
    for (const { pattern, name } of MANDATORY_WALLET_PATTERNS) {
      if (pattern.test(line)) {
        findings.push(createAuditFinding({
          severity: "WARNING",
          category: "Mandatory Wallet Linking",
          line: lineNum,
          match: line.trim().substring(0, 80),
          sourceKey: getAuditSourceKey("Mandatory Wallet Linking"),
          title: name,
        }));
      }
    }
    
    // Suspicious Rate Limits
    for (const { pattern, name } of SUSPICIOUS_RATE_LIMIT_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        const num = parseInt(match[1] || '0', 10);
        if (num >= 100) {
          findings.push(createAuditFinding({
            severity: num >= 1000 ? "WARNING" : "INFO",
            category: "Suspicious Rate Limits",
            line: lineNum,
            match: line.trim().substring(0, 80),
            sourceKey: getAuditSourceKey("Suspicious Rate Limits"),
            title: name,
            count: num,
          }));
        }
      }
    }
    
    // Auto-Update
    for (const { pattern, name } of AUTO_UPDATE_PATTERNS) {
      if (pattern.test(line)) {
        findings.push(createAuditFinding({
          severity: "CRITICAL",
          category: "Auto-Update Instructions",
          line: lineNum,
          match: line.trim().substring(0, 80),
          sourceKey: getAuditSourceKey("Auto-Update Instructions"),
          title: name,
        }));
      }
    }
    
    // In-Band Injection
    for (const { pattern, name } of IN_BAND_INJECTION_PATTERNS) {
      if (pattern.test(line)) {
        findings.push(createAuditFinding({
          severity: "WARNING",
          category: "In-Band Injection Fields",
          line: lineNum,
          match: line.trim().substring(0, 80),
          sourceKey: getAuditSourceKey("In-Band Injection Fields"),
          title: name,
        }));
      }
    }
    
    // Additional Red Flags
    for (const { pattern, name, category } of ADDITIONAL_RED_FLAGS) {
      if (pattern.test(line)) {
        const normalizedCategory = `Additional: ${category}`;
        findings.push(createAuditFinding({
          severity: category === "exfiltration" ? "CRITICAL" : "WARNING",
          category: normalizedCategory,
          line: lineNum,
          match: line.trim().substring(0, 80),
          sourceKey: getAuditSourceKey(normalizedCategory),
          title: name,
        }));
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

function extractAuditCountFromMessage(message: string): number | undefined {
  const match = message.match(/^Unusually high rate limit \((\d+)\):/);
  if (!match) return undefined;

  const count = Number.parseInt(match[1], 10);
  return Number.isNaN(count) ? undefined : count;
}

function extractAuditTitleFromMessage(message: string): string | undefined {
  const match = message.match(/:\s*(.+)$/);
  return match?.[1];
}

function localizeAuditFinding(finding: AuditFinding, locale: Locale): AuditFinding {
  const sourceKey = finding._i18n?.sourceKey ?? getAuditSourceKey(finding.category);
  const title = finding._i18n?.title ?? extractAuditTitleFromMessage(finding.message) ?? "";
  const titleKey = finding._i18n?.titleKey ?? normalizeAuditToken(title);
  const count = finding._i18n?.count ?? extractAuditCountFromMessage(finding.message);

  const localizedTitle = t(
    locale,
    `diagnostics:auditTitleBySource.${sourceKey}.${titleKey}`,
    undefined,
    title,
  );

  return {
    ...finding,
    category: t(
      locale,
      `diagnostics:auditCategoryBySource.${finding.category}`,
      undefined,
      finding.category,
    ),
    message: t(
      locale,
      `diagnostics:auditMessageBySource.${sourceKey}`,
      { title: localizedTitle, count: count ?? "" },
      finding.message,
    ),
    recommendation: t(
      locale,
      `diagnostics:auditRecommendations.${sourceKey}`,
      undefined,
      finding.recommendation,
    ),
  };
}

function localizeAuditFindings(findings: AuditFinding[], locale: Locale): AuditFinding[] {
  return findings.map((finding) => localizeAuditFinding(finding, locale));
}

export function formatAuditResult(result: AuditResult, locale: Locale = DEFAULT_LOCALE): string {
  const lines: string[] = [];
  const findings = localizeAuditFindings(result.findings, locale);
  
  lines.push("");
  lines.push(`${c.magenta}${c.bold}${t(locale, "auditTitle")}${c.reset}`);
  lines.push(`${c.dim}${t(locale, "file")}: ${result.file}${c.reset}`);
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
  
  const verdictText = getAuditVerdictText(locale, result.verdict);

  lines.push(`  ${verdictColors[result.verdict]}${c.bold} ${verdictEmojis[result.verdict]} ${t(locale, "verdict")}: ${verdictText} ${c.reset}`);
  lines.push(`  ${c.dim}${t(locale, "riskScore")}: ${result.riskScore}/100${c.reset}`);
  lines.push("");
  
  if (findings.length === 0) {
    lines.push(`  ${c.green}${t(locale, "noDangerousPatterns")}${c.reset}`);
    lines.push("");
    return lines.join("\n");
  }
  
  // Group by category
  const byCategory = new Map<string, AuditFinding[]>();
  for (const f of findings) {
    const cat = f.category;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(f);
  }
  
  // Summary
  const criticals = findings.filter(f => f.severity === "CRITICAL").length;
  const warnings = findings.filter(f => f.severity === "WARNING").length;
  const infos = findings.filter(f => f.severity === "INFO").length;
  
  const parts: string[] = [];
  if (criticals) parts.push(`${c.red}${criticals} ${getSeverityLabel(locale, "CRITICAL")}${c.reset}`);
  if (warnings) parts.push(`${c.yellow}${warnings} ${getSeverityLabel(locale, "WARNING")}${c.reset}`);
  if (infos) parts.push(`${c.blue}${infos} ${getSeverityLabel(locale, "INFO")}${c.reset}`);
  
  lines.push(`  📋 ${t(locale, "findings")}: ${parts.join(", ")}`);
  lines.push("");
  
  // Detailed findings
  for (const [category, findings] of byCategory) {
    lines.push(`  ${c.bold}▸ ${category}${c.reset}`);
    
    for (const f of findings) {
      const sevColor = f.severity === "CRITICAL" ? c.red : f.severity === "WARNING" ? c.yellow : c.blue;
      const sevIcon = f.severity === "CRITICAL" ? "🔴" : f.severity === "WARNING" ? "🟡" : "🔵";
      
      lines.push(`    ${sevIcon} ${sevColor}${getSeverityLabel(locale, f.severity)}${c.reset} ${c.dim}(${t(locale, "line")} ${f.line || "?"})${c.reset}`);
      lines.push(`       ${f.message}`);
      lines.push(`       ${c.dim}${t(locale, "match")}: "${f.match}"${c.reset}`);
      lines.push(`       ${c.cyan}→ ${f.recommendation}${c.reset}`);
      lines.push("");
    }
  }
  
  // Final recommendation
  if (result.verdict === "MALICIOUS" || result.verdict === "DANGEROUS") {
    lines.push(`  ${c.red}${c.bold}${t(locale, "doNotInstall")}${c.reset}`);
    lines.push(`  ${c.red}${t(locale, "knownTrojan")}${c.reset}`);
    lines.push(`  ${c.dim}${t(locale, "referenceLabel")}: https://dev.to/sebayaki/i-audited-moltxs-skill-file-its-an-ai-agent-trojan-horse-539k${c.reset}`);
  } else if (result.verdict === "SUSPICIOUS") {
    lines.push(`  ${c.yellow}${t(locale, "proceedWithCaution")}${c.reset}`);
    lines.push(`  ${c.yellow}${t(locale, "reviewFindings")}${c.reset}`);
  }
  
  lines.push("");
  return lines.join("\n");
}

export function formatAuditJSON(result: AuditResult, locale: Locale = DEFAULT_LOCALE): string {
  const localizedFindings = localizeAuditFindings(result.findings, locale).map((finding) => {
    const { _i18n, ...publicFinding } = finding;
    return publicFinding;
  });

  const localized = {
    ...result,
    findings: localizedFindings,
  };
  return JSON.stringify(localized, null, 2);
}
