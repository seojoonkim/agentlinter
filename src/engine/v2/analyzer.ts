/* ─── AgentLinter v2 Browser-Compatible Analyzer ─── */

export interface V2Section {
  heading: string;
  level: number;
  startLine: number;
  endLine: number;
  content: string;
  lineCount: number;
  tokenEstimate: number;
}

export interface CognitiveLoadResult {
  score: number;
  sectionCount: number;
  avgComplexity: number;
  duplicates: { a: string; b: string; similarity: number }[];
  paretoAnalysis: { top20pctSections: string[]; top20pctTokens: number; totalTokens: number };
  positionWarnings: { section: string; issue: string }[];
}

export interface TokenHeatmapResult {
  totalTokens: number;
  gpt4ContextPct: number;
  sections: {
    heading: string;
    tokens: number;
    pct: number;
    savingsMessage: string;
    density: number;
  }[];
}

export interface ModularitySuggestion {
  shouldModularize: boolean;
  totalLines: number;
  suggestions: { section: string; suggestedFile: string; reason: string }[];
}

export interface RoleComplexityResult {
  roles: { name: string; keywords: string[]; sections: string[] }[];
  roleCount: number;
  warning: boolean;
  message: string;
}

export interface SecurityFinding {
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  pattern: string;
  line: number;
  lineContent: string;
  description: string;
}

export interface SecurityScanResult {
  findings: SecurityFinding[];
  criticalCount: number;
  warningCount: number;
  infoCount: number;
}

export interface ClarityFinding {
  line: number;
  lineContent: string;
  ambiguousTerm: string;
  suggestion: string;
}

export interface InstructionClarityResult {
  score: number;
  findings: ClarityFinding[];
  ambiguousCount: number;
}

export interface Suggestion {
  category: string;
  icon: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
}

export interface V2AnalysisResult {
  sections: V2Section[];
  cognitiveLoad: CognitiveLoadResult;
  tokenHeatmap: TokenHeatmapResult;
  modularity: ModularitySuggestion;
  roleComplexity: RoleComplexityResult;
  securityScan: SecurityScanResult;
  instructionClarity: InstructionClarityResult;
  suggestions: Suggestion[];
  overallScore: number;
}

function estimateTokens(text: string): number {
  const koreanChars = (text.match(/[\uAC00-\uD7A3]/g) || []).length;
  const otherChars = text.length - koreanChars;
  return Math.ceil(koreanChars * 0.5 + otherChars * 0.25);
}

function parseSections(content: string): V2Section[] {
  const lines = content.split('\n');
  const sections: V2Section[] = [];
  let current: Partial<V2Section> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(#{1,6})\s+(.+)/);
    if (match) {
      if (current) {
        const sectionContent = lines.slice(current.startLine!, i).join('\n');
        sections.push({
          ...current as V2Section,
          endLine: i - 1,
          content: sectionContent,
          lineCount: i - current.startLine!,
          tokenEstimate: estimateTokens(sectionContent),
        });
      }
      current = { heading: match[2].trim(), level: match[1].length, startLine: i, endLine: i, content: '', lineCount: 0, tokenEstimate: 0 };
    }
  }
  if (current) {
    const sectionContent = lines.slice(current.startLine!).join('\n');
    sections.push({
      ...current as V2Section,
      endLine: lines.length - 1,
      content: sectionContent,
      lineCount: lines.length - current.startLine!,
      tokenEstimate: estimateTokens(sectionContent),
    });
  }

  if (sections.length === 0 && content.trim().length > 0) {
    sections.push({
      heading: '(Document)',
      level: 1,
      startLine: 0,
      endLine: lines.length - 1,
      content,
      lineCount: lines.length,
      tokenEstimate: estimateTokens(content),
    });
  }

  return sections;
}

function stringSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let intersection = 0;
  wordsA.forEach(w => { if (wordsB.has(w)) intersection++; });
  return (2 * intersection) / (wordsA.size + wordsB.size);
}

function analyzeCognitiveLoad(sections: V2Section[], content: string): CognitiveLoadResult {
  const complexities = sections.map(s => {
    let complexity = 0;
    const sLines = s.content.split('\n');
    complexity += Math.min(sLines.length / 10, 5);
    complexity += (s.content.match(/```/g) || []).length * 0.5;
    complexity += (s.content.match(/[\u{1F534}\u{1F7E1}\u{1F7E2}\u26A0\uFE0F\u{1F6A8}\u274C\u2705]/gu) || []).length * 0.3;
    complexity += (s.content.match(/^\s*[-*]\s/gm) || []).length * 0.2;
    complexity += Math.max(0, s.level - 2) * 0.5;
    return Math.min(complexity, 10);
  });

  const avgComplexity = complexities.length > 0 ? complexities.reduce((a, b) => a + b, 0) / complexities.length : 0;

  const duplicates: { a: string; b: string; similarity: number }[] = [];
  for (let i = 0; i < sections.length; i++) {
    for (let j = i + 1; j < sections.length; j++) {
      const sim = stringSimilarity(sections[i].content, sections[j].content);
      if (sim > 0.5) {
        duplicates.push({ a: sections[i].heading, b: sections[j].heading, similarity: Math.round(sim * 100) });
      }
    }
  }

  const positionWarnings: { section: string; issue: string }[] = [];
  const criticalPatterns = /critical|must|required|never|always|금지|절대|반드시|\u274C|\u{1F534}|\u{1F6A8}/iu;
  const topThreshold = Math.ceil(sections.length * 0.3);
  sections.forEach((s, i) => {
    if (i >= topThreshold && criticalPatterns.test(s.content)) {
      positionWarnings.push({ section: s.heading, issue: `Critical rules buried at position #${i + 1}/${sections.length} — move to top for better adherence` });
    }
  });

  const sorted = [...sections].sort((a, b) => b.tokenEstimate - a.tokenEstimate);
  const totalTokens = sorted.reduce((a, b) => a + b.tokenEstimate, 0);
  const top20Count = Math.max(1, Math.ceil(sorted.length * 0.2));
  const top20Sections = sorted.slice(0, top20Count);
  const top20Tokens = top20Sections.reduce((a, b) => a + b.tokenEstimate, 0);

  let score = 0;
  score += Math.min(Math.max(0, sections.length - 4) * 3, 30);
  score += Math.min(avgComplexity * 8, 30);
  score += duplicates.length * 10;
  score += positionWarnings.length * 5;
  score += Math.max(0, (totalTokens - 2000) / 100);
  score = Math.min(100, Math.max(0, Math.round(score)));

  return {
    score,
    sectionCount: sections.length,
    avgComplexity: Math.round(avgComplexity * 10) / 10,
    duplicates,
    paretoAnalysis: { top20pctSections: top20Sections.map(s => s.heading), top20pctTokens: top20Tokens, totalTokens },
    positionWarnings,
  };
}

function analyzeTokenHeatmap(sections: V2Section[]): TokenHeatmapResult {
  const totalTokens = sections.reduce((a, b) => a + b.tokenEstimate, 0);
  return {
    totalTokens,
    gpt4ContextPct: Math.round((totalTokens / 128000) * 10000) / 100,
    sections: sections.map(s => ({
      heading: s.heading,
      tokens: s.tokenEstimate,
      pct: totalTokens > 0 ? Math.round((s.tokenEstimate / totalTokens) * 100) : 0,
      savingsMessage: `Remove to save ~${s.tokenEstimate} tokens`,
      density: s.lineCount > 0 ? Math.round(s.tokenEstimate / s.lineCount * 10) / 10 : 0,
    })),
  };
}

const FILE_KEYWORD_MAP: Record<string, string[]> = {
  'SECURITY.md': ['security', 'secret', 'injection', 'password', 'token', 'auth', 'permission', 'encrypt'],
  'MEMORY.md': ['memory', 'recall', 'remember', 'session', 'handoff', 'persist', 'context'],
  'TOOLS.md': ['tool', 'model', 'api', 'cli', 'command', 'mcp', 'plugin', 'integration'],
  'IDENTITY.md': ['identity', 'name', 'persona', 'character', 'avatar', 'origin'],
  'FORMATTING.md': ['format', 'style', 'output', 'template', 'markdown', 'emoji'],
  'HEARTBEAT.md': ['heartbeat', 'cron', 'schedule', 'periodic', 'timer', 'daily'],
  'WORKFLOW.md': ['workflow', 'pipeline', 'process', 'step', 'automation'],
  'RULES.md': ['rule', 'policy', 'constraint', 'limit', 'boundary', 'restrict'],
};

function analyzeModularity(sections: V2Section[], content: string): ModularitySuggestion {
  const totalLines = content.split('\n').length;
  const suggestions: { section: string; suggestedFile: string; reason: string }[] = [];

  if (totalLines > 150) {
    for (const section of sections) {
      const lowerContent = section.content.toLowerCase();
      for (const [file, keywords] of Object.entries(FILE_KEYWORD_MAP)) {
        const matchCount = keywords.filter(k => lowerContent.includes(k)).length;
        if (matchCount >= 2) {
          suggestions.push({
            section: section.heading,
            suggestedFile: file,
            reason: `${matchCount} ${file.replace('.md', '').toLowerCase()}-related keywords → @import ./${file}`,
          });
          break;
        }
      }
    }
  }

  return { shouldModularize: totalLines > 150, totalLines, suggestions };
}

const ROLE_DEFINITIONS: Record<string, string[]> = {
  'Developer': ['code', 'coding', 'codex', 'git', 'deploy', 'build', 'npm', 'vercel', 'debug', 'commit'],
  'Writer': ['write', 'writing', 'blog', 'article', 'content', 'draft', 'creative', 'story'],
  'Analyst': ['analyze', 'analysis', 'research', 'data', 'report', 'metrics', 'statistics'],
  'Security': ['security', 'audit', 'scan', 'vulnerability', 'injection', 'threat', 'defense'],
  'DevOps': ['deploy', 'infrastructure', 'server', 'docker', 'ci/cd', 'pipeline', 'monitoring', 'gateway'],
  'Assistant': ['assistant', 'help', 'support', 'respond', 'message', 'chat', 'dm', 'telegram'],
  'Organizer': ['schedule', 'calendar', 'todo', 'task', 'priority', 'deadline', 'reminder'],
};

function analyzeRoleComplexity(sections: V2Section[], content: string): RoleComplexityResult {
  const lowerContent = content.toLowerCase();
  const roles: { name: string; keywords: string[]; sections: string[] }[] = [];

  for (const [role, keywords] of Object.entries(ROLE_DEFINITIONS)) {
    const matchedKeywords = keywords.filter(k => lowerContent.includes(k));
    if (matchedKeywords.length >= 2) {
      const matchedSections = sections.filter(s => {
        const lower = s.content.toLowerCase();
        return matchedKeywords.some(k => lower.includes(k));
      }).map(s => s.heading);
      roles.push({ name: role, keywords: matchedKeywords, sections: matchedSections });
    }
  }

  const warning = roles.length >= 3;
  let message = '';
  if (roles.length === 0) message = 'No distinct roles detected.';
  else if (roles.length <= 2) message = `${roles.length} role(s) detected — manageable complexity.`;
  else message = `${roles.length} roles detected! Consider splitting into role-specific files.`;

  return { roles, roleCount: roles.length, warning, message };
}

const SECURITY_PATTERNS: { pattern: RegExp; severity: 'CRITICAL' | 'WARNING' | 'INFO'; description: string; name: string }[] = [
  { pattern: /(?:sk-|api[_-]?key|apikey)\s*[:=]\s*["']?[A-Za-z0-9_-]{20,}/i, severity: 'CRITICAL', description: 'API key or secret token exposed in plain text', name: 'plaintext-secret' },
  { pattern: /(?:password|passwd|pwd)\s*[:=]\s*["']?[^\s"']{4,}/i, severity: 'CRITICAL', description: 'Password stored in plain text', name: 'plaintext-password' },
  { pattern: /(?:ghp_|gho_|github_pat_)[A-Za-z0-9_]{30,}/i, severity: 'CRITICAL', description: 'GitHub token exposed', name: 'github-token' },
  { pattern: /xoxb-[0-9]{10,}-[A-Za-z0-9]{20,}/i, severity: 'CRITICAL', description: 'Slack token exposed', name: 'slack-token' },
  { pattern: /(?:^|\s)System:\s/m, severity: 'WARNING', description: '"System:" prefix — may indicate blind trust in system-level instructions', name: 'system-trust' },
  { pattern: /(?:read|load|import|include|source)\s+(?:WORKFLOW|AUTO|EXTERNAL|REMOTE)[_A-Z]*\.md/i, severity: 'WARNING', description: 'External file unconditional read — potential injection vector', name: 'external-file-read' },
  { pattern: /(?:full\s+access|unlimited\s+access|root\s+access|admin\s+access|sudo)/i, severity: 'WARNING', description: 'Overly broad permission grant detected', name: 'excessive-permission' },
  { pattern: /curl\s+.*\|\s*(?:bash|sh|zsh)/i, severity: 'CRITICAL', description: 'Remote code execution: curl piped to shell', name: 'remote-exec' },
  { pattern: /eval\s*\(/i, severity: 'WARNING', description: 'eval() usage — potential code injection', name: 'eval-usage' },
  { pattern: /(?:ignore|skip|bypass|disable)\s+(?:all\s+)?(?:security|safety|rules|restrictions|filters)/i, severity: 'CRITICAL', description: 'Instruction to bypass security measures', name: 'security-bypass' },
  { pattern: /(?:you\s+(?:are|must|should)\s+(?:always\s+)?(?:obey|follow|comply|execute)\s+(?:all|any|every)\s+(?:instruction|command|request))/i, severity: 'WARNING', description: 'Unconditional compliance — susceptible to injection', name: 'blind-compliance' },
  { pattern: /(?:BEARER|bearer)\s+[A-Za-z0-9._-]{20,}/i, severity: 'WARNING', description: 'Bearer token may be exposed', name: 'bearer-token' },
  { pattern: /(?:~\/\.ssh|~\/\.env|~\/\.aws|\/etc\/passwd)/i, severity: 'WARNING', description: 'Sensitive file path reference', name: 'sensitive-path' },
  { pattern: /(?:private[_\s]?key|secret[_\s]?key)\s*[:=]/i, severity: 'CRITICAL', description: 'Private/secret key assignment detected', name: 'private-key' },
  { pattern: /(?:webhook\.site|requestbin|ngrok\.io|pipedream)/i, severity: 'INFO', description: 'External webhook/tunnel service reference', name: 'external-webhook' },
  { pattern: /AKIA[A-Z0-9]{16}/, severity: 'CRITICAL', description: 'AWS Access Key ID exposed', name: 'aws-key' },
  { pattern: /"type"\s*:\s*"service_account"/, severity: 'CRITICAL', description: 'GCP service account credentials detected', name: 'gcp-service-account' },
  { pattern: /eyJ[A-Za-z0-9\-_]{20,}/, severity: 'WARNING', description: 'Hardcoded JWT token detected', name: 'jwt-hardcoded' },
  { pattern: /ignore\s+previous\s+instructions/i, severity: 'CRITICAL', description: 'Prompt injection: "ignore previous instructions"', name: 'prompt-injection-ignore' },
  { pattern: /disregard\s+above/i, severity: 'CRITICAL', description: 'Prompt injection: "disregard above"', name: 'prompt-injection-disregard' },
  { pattern: /new\s+instruction\s*:/i, severity: 'CRITICAL', description: 'Prompt injection: "new instruction:"', name: 'prompt-injection-new' },
  { pattern: /you\s+can\s+do\s+anything/i, severity: 'WARNING', description: 'Excessive permission: "you can do anything"', name: 'excessive-anything' },
  { pattern: /no\s+restrictions/i, severity: 'WARNING', description: 'Excessive permission: "no restrictions"', name: 'no-restrictions' },
  { pattern: /bypass\s+all/i, severity: 'CRITICAL', description: 'Excessive permission: "bypass all"', name: 'bypass-all' },
  { pattern: /(?:you\s+are\s+now|act\s+as\s+a|pretend\s+you\s+are)\s/i, severity: 'WARNING', description: 'System role hijacking attempt detected', name: 'role-hijack' },
];

function analyzeSecurityScan(content: string): SecurityScanResult {
  const lines = content.split('\n');
  const findings: SecurityFinding[] = [];

  lines.forEach((line, i) => {
    for (const { pattern, severity, description, name } of SECURITY_PATTERNS) {
      if (pattern.test(line)) {
        findings.push({ severity, pattern: name, line: i + 1, lineContent: line.trim().substring(0, 120), description });
      }
    }
  });

  return {
    findings,
    criticalCount: findings.filter(f => f.severity === 'CRITICAL').length,
    warningCount: findings.filter(f => f.severity === 'WARNING').length,
    infoCount: findings.filter(f => f.severity === 'INFO').length,
  };
}

const AMBIGUOUS_TERMS: { term: string | RegExp; suggestion: string }[] = [
  { term: '\uC801\uC808\uD788', suggestion: '\uAD6C\uCCB4\uC801 \uC218\uCE58\uB098 \uC870\uAC74\uC73C\uB85C \uBA85\uC2DC (\uC608: "3\uD68C \uC774\uD558", "500\uC790 \uC774\uB0B4")' },
  { term: '\uD544\uC694\uC2DC', suggestion: '\uC815\uD655\uD55C \uD2B8\uB9AC\uAC70 \uC870\uAC74 \uBA85\uC2DC (\uC608: "\uC5D0\uB7EC \uBC1C\uC0DD \uC2DC", "\uC694\uCCAD\uC774 2\uD68C \uC2E4\uD328\uD558\uBA74")' },
  { term: '\uAC00\uB2A5\uD558\uBA74', suggestion: '\uD544\uC218/\uC120\uD0DD \uC5EC\uBD80\uB97C \uBA85\uD655\uD788 (\uC608: "\uBC18\uB4DC\uC2DC" \uB610\uB294 "\uC120\uD0DD\uC0AC\uD56D:")' },
  { term: '\uACBD\uC6B0\uC5D0 \uB530\uB77C', suggestion: '\uAD6C\uCCB4\uC801 \uC870\uAC74 \uBD84\uAE30 \uBA85\uC2DC (\uC608: "\uD30C\uC77C \uD06C\uAE30\uAC00 10MB \uCD08\uACFC \uC2DC")' },
  { term: '\uC0C1\uD669\uC5D0 \uB9DE\uAC8C', suggestion: '\uAD6C\uCCB4\uC801 \uC0C1\uD669\uACFC \uB300\uC751\uC744 \uB098\uC5F4 (\uC608: "\uC5D0\uB7EC\u2192\uC7AC\uC2DC\uB3C4, \uD0C0\uC784\uC544\uC6C3\u2192\uC2A4\uD0B5")' },
  { term: '\uC801\uB2F9\uD788', suggestion: '\uC815\uB7C9\uC801 \uAE30\uC900 \uC81C\uC2DC (\uC608: "\uCD5C\uB300 5\uAC1C", "100\uC790 \uC774\uB0B4")' },
  { term: '\uC5B4\uB290 \uC815\uB3C4', suggestion: '\uC218\uCE58\uD654 (\uC608: "\uC57D 70%", "3~5\uAC1C")' },
  { term: '\uC54C\uC544\uC11C', suggestion: '\uD310\uB2E8 \uAE30\uC900\uC744 \uBA85\uC2DC (\uC608: "\uC6B0\uC120\uC21C\uC704: A > B > C")' },
  { term: '\uC6AC\uB9CC\uD558\uBA74', suggestion: '"\uBC18\uB4DC\uC2DC" \uB610\uB294 \uC608\uC678 \uC870\uAC74\uC744 \uBA85\uC2DC' },
  { term: '\uB418\uB3C4\uB85D', suggestion: '"\uBC18\uB4DC\uC2DC" \uB610\uB294 \uD5C8\uC6A9 \uBC94\uC704 \uBA85\uC2DC (\uC608: "90% \uC774\uC0C1 \uC900\uC218")' },
  { term: /as\s+needed/i, suggestion: 'Specify trigger conditions (e.g., "when error count > 3")' },
  { term: /if\s+appropriate/i, suggestion: 'Define what "appropriate" means (e.g., "if file size < 1MB")' },
  { term: /when\s+necessary/i, suggestion: 'Specify exact conditions (e.g., "when memory exceeds 80%")' },
  { term: /as\s+appropriate/i, suggestion: 'Replace with specific criteria' },
  { term: /depending\s+on/i, suggestion: 'List all cases explicitly (e.g., "if X → do A; if Y → do B")' },
  { term: /use\s+your\s+judgment/i, suggestion: 'Provide decision criteria or a rubric' },
  { term: /at\s+your\s+discretion/i, suggestion: 'Specify boundaries (e.g., "up to 3 retries, max 10s delay")' },
];

function analyzeInstructionClarity(content: string): InstructionClarityResult {
  const lines = content.split('\n');
  const findings: ClarityFinding[] = [];

  lines.forEach((line, i) => {
    for (const { term, suggestion } of AMBIGUOUS_TERMS) {
      const match = typeof term === 'string' ? line.includes(term) : term.test(line);
      if (match) {
        findings.push({
          line: i + 1,
          lineContent: line.trim().substring(0, 120),
          ambiguousTerm: typeof term === 'string' ? term : (line.match(term)?.[0] || term.source),
          suggestion,
        });
      }
    }
  });

  const score = Math.max(0, 100 - findings.length * 5);
  return { score, findings, ambiguousCount: findings.length };
}

function generateSuggestions(
  cognitiveLoad: CognitiveLoadResult,
  clarity: InstructionClarityResult,
  modularity: ModularitySuggestion,
  securityScan: SecurityScanResult,
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  if (cognitiveLoad.duplicates.length > 0) {
    const dupeNames = cognitiveLoad.duplicates.map(d => `"${d.a}"`).join(', ');
    suggestions.push({
      category: 'Cognitive Load',
      icon: '\uD83E\uDDE0',
      message: `\uC139\uC158 ${cognitiveLoad.sectionCount}\uAC1C \uC911 \uC911\uBCF5 \uB0B4\uC6A9\uC744 ${cognitiveLoad.sectionCount - cognitiveLoad.duplicates.length}\uAC1C\uB85C \uD1B5\uD569\uD558\uC138\uC694 (\uC911\uBCF5: ${dupeNames})`,
      priority: 'high',
    });
  }
  if (cognitiveLoad.positionWarnings.length > 0) {
    suggestions.push({
      category: 'Cognitive Load',
      icon: '\uD83E\uDDE0',
      message: `\uC911\uC694 \uADDC\uCE59\uC774 \uBB38\uC11C \uD558\uB2E8\uC5D0 \uBB3B\uD600\uC788\uC2B5\uB2C8\uB2E4. ${cognitiveLoad.positionWarnings.map(w => `"${w.section}"`).join(', ')}\uC744 \uBB38\uC11C \uC0C1\uB2E8\uC73C\uB85C \uC774\uB3D9\uD558\uC138\uC694`,
      priority: 'high',
    });
  }

  if (clarity.findings.length > 0) {
    const top3 = clarity.findings.slice(0, 3);
    for (const f of top3) {
      suggestions.push({
        category: 'Instruction Clarity',
        icon: '\uD83D\uDD0D',
        message: `${f.line}\uBC88\uC9F8 \uC904 '${f.ambiguousTerm}' \u2192 ${f.suggestion}`,
        priority: 'medium',
      });
    }
    if (clarity.findings.length > 3) {
      suggestions.push({
        category: 'Instruction Clarity',
        icon: '\uD83D\uDD0D',
        message: `\uC678 ${clarity.findings.length - 3}\uAC1C \uBAA8\uD638\uD55C \uD45C\uD604\uC774 \uCD94\uAC00\uB85C \uBC1C\uACAC\uB428`,
        priority: 'low',
      });
    }
  }

  if (modularity.shouldModularize) {
    suggestions.push({
      category: 'Modularity',
      icon: '\uD83D\uDCE6',
      message: `${modularity.totalLines}\uC904 \uCD08\uACFC \u2014 SECURITY.md / TOOLS.md \uB4F1\uC73C\uB85C \uBD84\uB9AC\uB97C \uAD8C\uC7A5\uD569\uB2C8\uB2E4`,
      priority: modularity.totalLines > 300 ? 'high' : 'medium',
    });
    for (const s of modularity.suggestions.slice(0, 3)) {
      suggestions.push({
        category: 'Modularity',
        icon: '\uD83D\uDCE6',
        message: `"${s.section}" \u2192 ${s.suggestedFile}\uB85C \uBD84\uB9AC (${s.reason})`,
        priority: 'low',
      });
    }
  }

  if (securityScan.criticalCount > 0) {
    const criticals = securityScan.findings.filter(f => f.severity === 'CRITICAL').slice(0, 3);
    for (const f of criticals) {
      suggestions.push({
        category: 'Security',
        icon: '\uD83D\uDEE1\uFE0F',
        message: `Line ${f.line}: ${f.pattern} \uD328\uD134 \uBC1C\uACAC \u2014 ${f.description}`,
        priority: 'high',
      });
    }
  }
  if (securityScan.warningCount > 0) {
    const warns = securityScan.findings.filter(f => f.severity === 'WARNING').slice(0, 2);
    for (const f of warns) {
      suggestions.push({
        category: 'Security',
        icon: '\uD83D\uDEE1\uFE0F',
        message: `Line ${f.line}: ${f.pattern} \u2014 ${f.description}`,
        priority: 'medium',
      });
    }
  }

  return suggestions;
}

export function analyzeV2(content: string): V2AnalysisResult {
  const sections = parseSections(content);
  const cognitiveLoad = analyzeCognitiveLoad(sections, content);
  const tokenHeatmap = analyzeTokenHeatmap(sections);
  const modularity = analyzeModularity(sections, content);
  const roleComplexity = analyzeRoleComplexity(sections, content);
  const securityScan = analyzeSecurityScan(content);
  const instructionClarity = analyzeInstructionClarity(content);
  const suggestions = generateSuggestions(cognitiveLoad, instructionClarity, modularity, securityScan);

  const cognitiveScore = 100 - cognitiveLoad.score;
  const clarityScore = instructionClarity.score;
  const securityScore = Math.max(0, 100 - securityScan.criticalCount * 25 - securityScan.warningCount * 10 - securityScan.infoCount * 2);
  const modularityScore = modularity.shouldModularize ? Math.max(20, 100 - modularity.suggestions.length * 15) : 100;
  const roleScore = roleComplexity.warning ? Math.max(30, 100 - (roleComplexity.roleCount - 2) * 20) : 100;

  const overallScore = Math.round(
    cognitiveScore * 0.4 +
    clarityScore * 0.25 +
    modularityScore * 0.15 +
    securityScore * 0.15 +
    roleScore * 0.05
  );

  return { sections, cognitiveLoad, tokenHeatmap, modularity, roleComplexity, securityScan, instructionClarity, suggestions, overallScore };
}
