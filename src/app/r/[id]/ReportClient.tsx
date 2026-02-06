"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  Github,
  AlertTriangle,
  AlertCircle,
  Info,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Shield,
  Layers,
  Eye,
  Puzzle,
  FileText,
  Lightbulb,
  ArrowRight,
  Copy,
  ExternalLink,
  Sparkles,
  Target,
  Zap,
  Scale,
} from "lucide-react";
import { useState } from "react";

/* ─── Logo ─── */
function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* DNA double helix — no background rect */}
      <path d="M10 4 C10 9, 22 11, 22 16 C22 21, 10 23, 10 28" stroke="url(#lg)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M22 4 C22 9, 10 11, 10 16 C10 21, 22 23, 22 28" stroke="#5eead4" strokeWidth="2" strokeLinecap="round" fill="none" />
      <line x1="12" y1="8" x2="20" y2="8" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <line x1="14" y1="12.5" x2="18" y2="12.5" stroke="currentColor" strokeWidth="1" opacity="0.15" />
      <line x1="14" y1="19.5" x2="18" y2="19.5" stroke="currentColor" strokeWidth="1" opacity="0.15" />
      <line x1="12" y1="24" x2="20" y2="24" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <circle cx="16" cy="10.5" r="1.5" fill="#a78bfa" />
      <circle cx="16" cy="16" r="2" fill="#5eead4" />
      <circle cx="16" cy="21.5" r="1.5" fill="#a78bfa" />
      <defs>
        <linearGradient id="lg" x1="10" y1="4" x2="22" y2="28">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Tier ─── */
function getTier(score: number) {
  if (score >= 98) return { grade: "S", color: "#c084fc", bg: "#c084fc18", label: "Exceptional", emoji: "🏆" };
  if (score >= 95) return { grade: "A+", color: "#a78bfa", bg: "#a78bfa18", label: "Outstanding", emoji: "⭐" };
  if (score >= 90) return { grade: "A", color: "#818cf8", bg: "#818cf818", label: "Excellent", emoji: "🎯" };
  if (score >= 85) return { grade: "A-", color: "#60a5fa", bg: "#60a5fa18", label: "Great", emoji: "✨" };
  if (score >= 80) return { grade: "B+", color: "#34d399", bg: "#34d39918", label: "Good", emoji: "👍" };
  if (score >= 75) return { grade: "B", color: "#4ade80", bg: "#4ade8018", label: "Decent", emoji: "👌" };
  if (score >= 68) return { grade: "B-", color: "#fbbf24", bg: "#fbbf2418", label: "Fair", emoji: "📝" };
  if (score >= 58) return { grade: "C+", color: "#fb923c", bg: "#fb923c18", label: "Needs Work", emoji: "🔧" };
  if (score >= 45) return { grade: "C", color: "#f87171", bg: "#f8717118", label: "Poor", emoji: "⚠️" };
  if (score >= 30) return { grade: "D", color: "#ef4444", bg: "#ef444418", label: "Weak", emoji: "🚨" };
  return { grade: "F", color: "#dc2626", bg: "#dc262618", label: "Critical", emoji: "💀" };
}

/* ─── Category Icon ─── */
function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const cn = className || "w-4 h-4";
  switch (name) {
    case "Structure": return <Layers className={cn} />;
    case "Clarity": return <Eye className={cn} />;
    case "Completeness": return <Puzzle className={cn} />;
    case "Security": return <Shield className={cn} />;
    case "Consistency": return <Scale className={cn} />;
    default: return <FileText className={cn} />;
  }
}

/* ─── Severity Icon ─── */
function SeverityIcon({ severity }: { severity: string }) {
  if (severity === "critical" || severity === "error") return <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[var(--red)]" />;
  if (severity === "warning") return <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[var(--amber)]" />;
  return <Info className="w-3.5 h-3.5 shrink-0 text-[var(--text-dim)]" />;
}

/* ─── Histogram ─── */
function Histogram({ userScore }: { userScore: number }) {
  const bins = [
    { range: "0–29", count: 3, min: 0, max: 29 },
    { range: "30–39", count: 5, min: 30, max: 39 },
    { range: "40–49", count: 12, min: 40, max: 49 },
    { range: "50–59", count: 22, min: 50, max: 59 },
    { range: "60–69", count: 35, min: 60, max: 69 },
    { range: "70–79", count: 28, min: 70, max: 79 },
    { range: "80–89", count: 15, min: 80, max: 89 },
    { range: "90–100", count: 6, min: 90, max: 100 },
  ];
  const max = Math.max(...bins.map((b) => b.count));
  const activeBin = bins.findIndex((b) => userScore >= b.min && userScore <= b.max);

  return (
    <div>
      <div className="flex items-end gap-1 h-[80px]">
        {bins.map((bin, i) => {
          const height = (bin.count / max) * 100;
          const isActive = i === activeBin;
          return (
            <div key={bin.range} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] mono" style={{ color: isActive ? "var(--accent)" : "var(--text-dim)" }}>
                {bin.count}
              </span>
              <div
                className="w-full rounded-sm transition-all"
                style={{
                  height: `${height}%`,
                  backgroundColor: isActive ? "var(--accent)" : "rgba(255,255,255,0.06)",
                  minHeight: "3px",
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1 mt-1.5">
        {bins.map((bin, i) => (
          <div
            key={bin.range}
            className="flex-1 text-center text-[9px] mono"
            style={{ color: i === activeBin ? "var(--accent)" : "var(--text-dim)" }}
          >
            {bin.range}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Category Metadata ─── */
const CATEGORY_META: Record<string, {
  weight: number;
  description: string;
  whyItMatters: string;
  rules: { id: string; severity: string; description: string }[];
}> = {
  Structure: {
    weight: 20,
    description: "How well your workspace files are organized — modular files, logical heading hierarchy, appropriate file sizes, and clear navigation.",
    whyItMatters: "Agents read your config files sequentially. A monolithic 500-line CLAUDE.md with no headings is like a legal document with no sections — the model will lose context, miss important instructions, and produce inconsistent behavior. Modular, well-structured files let the agent quickly find what it needs.",
    rules: [
      { id: "structure/has-main-file", severity: "critical", description: "Workspace has a CLAUDE.md or AGENTS.md entry point" },
      { id: "structure/has-sections", severity: "warning", description: "Main file has 3+ organized sections with headings" },
      { id: "structure/heading-hierarchy", severity: "info", description: "Headings follow logical hierarchy (no level skipping)" },
      { id: "structure/file-size", severity: "warning", description: "Files are not excessively long (< 500 lines for main)" },
      { id: "structure/modular-files", severity: "info", description: "Uses multiple focused files instead of one monolith" },
      { id: "structure/no-empty-sections", severity: "warning", description: "No empty sections in core files" },
      { id: "structure/has-file-map", severity: "info", description: "Directory tree or file map for navigation" },
      { id: "structure/has-version-or-update-date", severity: "info", description: "Version or update date for freshness tracking" },
    ],
  },
  Clarity: {
    weight: 25,
    description: "How clear and unambiguous your instructions are — specific language, actionable directives, no vague qualifiers, and defined terms.",
    whyItMatters: "\"Be helpful\" means nothing to an LLM. \"When the user asks a question, provide a code example first, then explain\" means everything. Vague instructions are the #1 cause of unpredictable agent behavior. Every ambiguous word is a coinflip the model makes without you. Clarity is the highest-weighted category (25%) because it has the most direct impact on behavior.",
    rules: [
      { id: "clarity/no-vague-instructions", severity: "warning", description: "No vague qualifiers (\"be nice\", \"use common sense\", \"etc.\")" },
      { id: "clarity/actionable-instructions", severity: "info", description: "Active voice over passive (\"Do X\" not \"X should be done\")" },
      { id: "clarity/has-examples", severity: "info", description: "Includes examples or code blocks for expected behavior" },
      { id: "clarity/no-contradictions", severity: "critical", description: "No \"always X\" vs \"never X\" contradictions" },
      { id: "clarity/instruction-density", severity: "info", description: "Not too many imperative rules (< 30) to avoid dilution" },
      { id: "clarity/naked-conditional", severity: "critical", description: "Conditionals use specific triggers, not \"if appropriate\"" },
      { id: "clarity/compound-instruction", severity: "warning", description: "One action per bullet point, not 3+ verbs in one line" },
      { id: "clarity/escape-hatch-missing", severity: "warning", description: "Absolute rules have exception/escalation paths" },
      { id: "clarity/ambiguous-pronoun", severity: "warning", description: "Instructions don't start with ambiguous \"it\" / \"this\"" },
      { id: "clarity/action-without-context", severity: "info", description: "Instructions specify when/why, not just what" },
      { id: "clarity/sentence-complexity", severity: "info", description: "Sentences are short and simple, not nested prose" },
      { id: "clarity/priority-signal-missing", severity: "warning", description: "Files with 10+ rules have explicit priority markers" },
      { id: "clarity/undefined-term", severity: "info", description: "Acronyms and jargon are defined on first use" },
    ],
  },
  Completeness: {
    weight: 20,
    description: "Whether your workspace covers all essential aspects — identity, tools, boundaries, memory strategy, user context, error handling, and workflows.",
    whyItMatters: "An agent without defined boundaries will make up its own. An agent without a memory strategy will forget everything between sessions. Each missing piece is a gap where the model fills in defaults — and those defaults may not match your intent. Completeness ensures your agent has the full picture.",
    rules: [
      { id: "completeness/has-identity", severity: "warning", description: "Agent has a defined persona (SOUL.md or identity section)" },
      { id: "completeness/has-tools", severity: "warning", description: "Tool documentation exists (TOOLS.md or tools section)" },
      { id: "completeness/has-boundaries", severity: "warning", description: "Constraints and off-limits behaviors are defined" },
      { id: "completeness/has-memory-strategy", severity: "info", description: "Memory or session continuity strategy exists" },
      { id: "completeness/has-user-context", severity: "info", description: "User context (name, timezone, preferences) is provided" },
      { id: "completeness/has-error-handling", severity: "info", description: "Error handling and fallback behavior is documented" },
      { id: "completeness/has-output-format", severity: "info", description: "Expected output format/style is defined" },
      { id: "completeness/has-workflow", severity: "info", description: "Multi-step workflows (deploy, review) are documented" },
      { id: "completeness/has-priorities", severity: "info", description: "Priority guidance for conflicting instructions" },
    ],
  },
  Security: {
    weight: 20,
    description: "Whether your workspace keeps secrets safe, defends against prompt injection, defines permission boundaries, and avoids PII exposure.",
    whyItMatters: "Agent workspaces often contain real API keys, tokens, and personal data. A single leaked secret in a shared CLAUDE.md can compromise your entire infrastructure. Prompt injection defense is equally critical — without it, a malicious user in a group chat can override your agent's instructions. Security isn't optional; it's existential.",
    rules: [
      { id: "security/no-secrets", severity: "critical", description: "No API keys, tokens, or passwords in agent files" },
      { id: "security/has-injection-defense", severity: "warning", description: "Prompt injection defense instructions exist" },
      { id: "security/has-permission-boundaries", severity: "warning", description: "Permission boundaries (who can authorize what)" },
      { id: "security/no-pii-exposure", severity: "warning", description: "No PII (email, phone) in shared agent files" },
      { id: "security/env-var-references", severity: "info", description: "Uses env var references instead of hardcoded values" },
    ],
  },
  Consistency: {
    weight: 8,
    description: "Whether your files agree with each other — no conflicting permissions, matching tone, consistent naming, valid cross-references, and aligned timezones.",
    whyItMatters: "When SOUL.md says \"be casual\" but SECURITY.md uses formal legal language, the agent gets confused about its voice. When one file says \"auto-send emails\" and another says \"never send without approval,\" the agent picks randomly. Consistency ensures your agent speaks with one voice and follows one set of rules.",
    rules: [
      { id: "consistency/referenced-files-exist", severity: "critical", description: "All referenced files actually exist in workspace" },
      { id: "consistency/naming-convention", severity: "info", description: "Consistent file naming (UPPERCASE.md or lowercase.md)" },
      { id: "consistency/no-duplicate-instructions", severity: "warning", description: "No duplicate instructions across files" },
      { id: "consistency/identity-alignment", severity: "warning", description: "Agent identity is consistent across files" },
      { id: "consistency/permission-conflict", severity: "critical", description: "No conflicting permissions across files" },
      { id: "consistency/tone-voice-alignment", severity: "warning", description: "Instruction tone matches persona in SOUL.md" },
      { id: "consistency/language-mixing", severity: "info", description: "No excessive language mixing within sections" },
      { id: "consistency/circular-dependency", severity: "warning", description: "No circular file references" },
      { id: "consistency/timezone-locale-drift", severity: "warning", description: "Consistent timezone references across files" },
      { id: "consistency/priority-conflict", severity: "warning", description: "Same topic doesn't have conflicting priorities" },
      { id: "consistency/outdated-cross-references", severity: "critical", description: "Section references point to existing sections" },
    ],
  },
  Memory: {
    weight: 10,
    description: "How well your agent persists knowledge across sessions — memory strategy, session handoff, file-based notes, context window awareness, and task tracking.",
    whyItMatters: "Agents without memory are goldfish — they wake up confused, repeat questions, and forget what they learned yesterday. A well-designed memory system lets your agent build knowledge over time, resume interrupted work, and maintain long-term context.",
    rules: [
      { id: "memory/has-memory-strategy", severity: "warning", description: "Memory strategy defined (file-based, database, etc.)" },
      { id: "memory/has-session-handoff", severity: "warning", description: "Session startup protocol (what to read, how to restore context)" },
      { id: "memory/has-file-based-memory", severity: "info", description: "File-based memory system (logs, notes)" },
      { id: "memory/has-context-window-awareness", severity: "info", description: "Guidance for long conversations and context overflow" },
      { id: "memory/has-task-tracking", severity: "info", description: "Task/state tracking for resuming work" },
    ],
  },
  "Runtime Config": {
    weight: 13,
    description: "Runtime configuration quality — JSON structure, environment variables, API timeouts, tool permissions, and model settings.",
    whyItMatters: "Runtime config controls how your agent actually runs — API keys, timeouts, tool permissions, model selection. A misconfigured runtime can leak secrets, hit rate limits, or grant excessive permissions.",
    rules: [
      { id: "runtime/has-config", severity: "info", description: "Runtime config file exists (clawdbot.json, openclaw.json)" },
      { id: "runtime/valid-json", severity: "critical", description: "Config is valid JSON" },
      { id: "runtime/has-env-vars", severity: "info", description: "Uses environment variables for secrets" },
      { id: "runtime/has-timeout-settings", severity: "info", description: "API timeout settings configured" },
    ],
  },
  "Skill Safety": {
    weight: 10,
    description: "Safety and quality of custom skills — documentation, environment checks, error handling, security docs, and safe defaults.",
    whyItMatters: "Custom skills extend your agent's capabilities but introduce risk. A skill without security docs is a footgun. Skills need clear documentation, environment validation, and safe defaults to prevent misuse.",
    rules: [
      { id: "skillSafety/has-skill-md", severity: "warning", description: "Skills have SKILL.md documentation" },
      { id: "skillSafety/has-frontmatter", severity: "info", description: "SKILL.md has frontmatter metadata" },
      { id: "skillSafety/has-environment-check", severity: "warning", description: "Skills validate required environment variables" },
      { id: "skillSafety/has-security-docs", severity: "warning", description: "Skills document security implications" },
      { id: "skillSafety/has-error-handling", severity: "info", description: "Skills handle errors gracefully" },
    ],
  },
};

/* ─── Educational Context per Rule ─── */
const RULE_EDUCATION: Record<string, {
  impact: string;
  example?: { bad: string; good: string };
}> = {
  "structure/heading-hierarchy": {
    impact: "Skipped heading levels (h1 → h3) break the document outline. LLMs use heading hierarchy to understand section relationships and nesting. A clean hierarchy means better context parsing.",
    example: {
      bad: "# Main Title\n### Subsection  ← skipped h2",
      good: "# Main Title\n## Section\n### Subsection  ← proper nesting",
    },
  },
  "clarity/undefined-term": {
    impact: "Undefined acronyms force the model to guess meanings. In agent config files, precision matters — \"MUST\" could be an RFC 2119 keyword or just emphasis. Define it once so the model knows exactly what you mean.",
    example: {
      bad: "⚠️ MUST reference Name, Timezone",
      good: "⚠️ **MUST** (required — agent will fail without this): reference Name, Timezone",
    },
  },
  "consistency/language-mixing": {
    impact: "Mixing languages within sections can confuse the model's language mode. While technical terms in English within Korean text is normal, heavily mixed sentences reduce instruction clarity. Each section should have a primary language.",
    example: {
      bad: "이 파일을 read해서 check하고 update해야 함",
      good: "이 파일을 읽고, 확인하고, 업데이트해야 함\n(or: Read, check, and update this file)",
    },
  },
  "clarity/no-vague-instructions": {
    impact: "Vague qualifiers like \"be helpful\" or \"use common sense\" give the model zero actionable information. Every vague word is a random choice the model makes without your input. Specific instructions produce predictable, consistent behavior.",
    example: {
      bad: "Be helpful and concise",
      good: "Answer in ≤3 sentences for simple questions. Use bullet points for complex answers. Include a code example when explaining technical concepts.",
    },
  },
  "clarity/naked-conditional": {
    impact: "\"If too long\" means 100 words to one model and 10,000 to another. Vague conditionals create inconsistent branching behavior. Replace with measurable thresholds.",
    example: {
      bad: "If the response is too long, shorten it",
      good: "If the response exceeds 500 words, summarize in ≤3 bullet points",
    },
  },
  "clarity/escape-hatch-missing": {
    impact: "Absolute rules without exceptions create deadlocks. When two \"never\" rules conflict, the agent has no way to resolve the paradox. An escape hatch (\"unless the user explicitly requests it\") gives the agent a principled way to handle edge cases.",
    example: {
      bad: "Never modify files without asking",
      good: "Never modify files without asking — unless the user just said 'fix it' or 'go ahead' in the same conversation",
    },
  },
  "security/no-secrets": {
    impact: "Secrets in config files get committed to git, shared via clipboard, and synced to cloud storage. A single leaked API key can cost thousands in unauthorized usage or compromise your entire infrastructure.",
    example: {
      bad: 'api_key: "sk-proj-abc123..."',
      good: "api_key: $OPENAI_API_KEY  # from environment",
    },
  },
  "security/has-injection-defense": {
    impact: "Without injection defense, anyone in a group chat can say \"ignore all previous instructions and...\" to hijack your agent. This is the most common attack vector for AI agents in production.",
  },
  "consistency/referenced-files-exist": {
    impact: "Referencing a file that doesn't exist (\"see BOOTSTRAP.md\") creates a broken link the agent can't follow. It may hallucinate the contents or silently skip the instruction, both leading to unpredictable behavior.",
  },
  "completeness/has-identity": {
    impact: "Without a defined identity, the agent defaults to a generic assistant persona. A consistent personality (tone, name, behavior patterns) makes the agent more predictable and the user experience more cohesive.",
  },
  "completeness/has-boundaries": {
    impact: "An agent without boundaries will attempt anything it's asked to do. Defined boundaries (\"never send emails without confirmation\") prevent catastrophic mistakes and build trust.",
  },
};

/* ─── Scoring Method ─── */
const SCORING_METHODOLOGY = {
  base: "Each category starts at 100 points.",
  deductions: [
    { severity: "Critical", points: -15, color: "var(--red)", description: "Issues that break agent behavior or expose secrets" },
    { severity: "Warning", points: -8, color: "var(--amber)", description: "Significant issues that degrade agent quality" },
    { severity: "Info", points: -3, color: "var(--text-dim)", description: "Minor suggestions for improvement" },
  ],
  bonuses: [
    { category: "Structure", description: "Modular files (3+ → +5, 5+ → +10)" },
    { category: "Clarity", description: "Has examples or code blocks (+5)" },
    { category: "Completeness", description: "Key files exist: SOUL, IDENTITY, USER, TOOLS, SECURITY (+2 each)" },
    { category: "Security", description: "Has SECURITY.md (+5), injection defense keywords (+5)" },
    { category: "Consistency", description: "Consistent UPPERCASE naming convention (+5)" },
  ],
  formula: "Total = Σ (category_score × category_weight)",
};

/* ─── Actual Lint Result ─── */
/* ─── Hardcoded data removed — data is now passed via props from server component ─── */

/* ─── Collapsible Section ─── */
function Collapsible({ title, children, defaultOpen = false, badge, icon }: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-[var(--border)] rounded-xl bg-[var(--bg-card)] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 sm:px-5 py-3 sm:py-4 hover:bg-[var(--bg-card-hover)] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {icon}
          <span className="text-[14px] font-semibold">{title}</span>
          {badge}
        </div>
        <ChevronDown
          className="w-4 h-4 text-[var(--text-dim)] transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 sm:px-5 pb-4 sm:pb-5 border-t border-[var(--border)]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Code Block ─── */
function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative rounded-lg bg-[var(--bg)] border border-[var(--border)] overflow-hidden">
      {label && (
        <div className="px-3 py-1.5 border-b border-[var(--border)] text-[10px] mono text-[var(--text-dim)] uppercase tracking-wider">
          {label}
        </div>
      )}
      <pre className="px-3 py-2.5 text-[12px] mono leading-relaxed overflow-x-auto text-[var(--text-secondary)]">
        {code}
      </pre>
      <button
        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
      >
        {copied ? <Check className="w-3 h-3 text-[var(--green)]" /> : <Copy className="w-3 h-3 text-[var(--text-dim)]" />}
      </button>
    </div>
  );
}

/* ─── Types ─── */
export interface ReportData {
  id?: string;
  workspace?: string;
  totalScore: number;
  filesScanned: number;
  timestamp: string;
  categories: { name: string; score: number }[];
  diagnostics: { severity: string; category: string; rule: string; file: string; line?: number; message: string; fix?: string }[];
  files: string[];
  history?: { id: string; score: number; created_at: string }[];
}

/* ─── Main Report Page ─── */
export default function ReportPage({ data }: { data: ReportData }) {
  const tier = getTier(data.totalScore);
  const [showAllFiles, setShowAllFiles] = useState(false);

  const percentile = data.totalScore >= 95 ? 3 : data.totalScore >= 90 ? 8 : data.totalScore >= 85 ? 12 : data.totalScore >= 75 ? 25 : 50;

  const errors = data.diagnostics.filter((d) => d.severity === "critical" || d.severity === "error");
  const warnings = data.diagnostics.filter((d) => d.severity === "warning");
  const infos = data.diagnostics.filter((d) => d.severity === "info");

  const totalRules = Object.values(CATEGORY_META).reduce((sum, c) => sum + c.rules.length, 0);
  const passedRules = totalRules - data.diagnostics.length;

  // Build category breakdown for share text
  const labels: Record<string, string> = {
    structure: "📁",
    clarity: "💡", 
    completeness: "📋",
    security: "🔒",
    consistency: "🔗",
    memory: "🧠",
    runtime: "⚙️",
    skillSafety: "🛡️",
  };
  const allCategories = [...data.categories]
    .sort((a, b) => b.score - a.score)
    .map((cat) => `${labels[cat.name] || ""}${cat.score}`)
    .join(" ");

  const reportUrl = `agentlinter.com/r/${data.id || ""}`;
  
  const shareText = `🧬 AgentLinter Score: ${data.totalScore}/100

⭐ ${tier.grade} tier · Top ${percentile}%

${allCategories}

Is YOUR AI agent sharp & secure?
Free lint in one command:

npx agentlinter

${reportUrl}

#AIAgents #Claude #Cursor #DevTools #OpenSource`;
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="min-h-screen bg-[var(--bg)] noise">
      {/* Nav */}
      <nav className="border-b border-[var(--border)] sticky top-0 bg-[var(--bg)]/80 backdrop-blur-xl z-50">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <Logo size={20} />
            <span className="font-semibold text-[14px]">AgentLinter</span>
            <span className="text-[11px] mono text-[var(--text-dim)] ml-1">Report</span>
          </a>
          <div className="flex items-center gap-3">
            <a
              href={shareUrl}
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all hover:brightness-125"
              style={{ backgroundColor: tier.bg, color: tier.color }}
            >
              <Share2 className="w-3 h-3" />
              Share
            </a>
            <a
              href="https://github.com/seojoonkim/agentlinter"
              target="_blank"
              className="text-[var(--text-dim)] hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-[720px] mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-6 sm:space-y-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* ═══════ Score Hero ═══════ */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-8 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 sm:gap-4 mb-3">
                  <span className="text-[64px] sm:text-[88px] font-bold text-white leading-none display">
                    {data.totalScore}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[24px] sm:text-[28px]">{tier.emoji}</span>
                      <div
                        className="px-3 py-1 rounded-xl text-[18px] sm:text-[20px] font-bold mono"
                        style={{ color: tier.color, backgroundColor: tier.bg }}
                      >
                        {tier.grade}
                      </div>
                    </div>
                    <span className="text-[13px] font-medium" style={{ color: tier.color }}>{tier.label}</span>
                  </div>
                </div>
                <div className="text-[13px] text-[var(--text-secondary)] space-y-1">
                  <p>
                    <span className="mono">{data.filesScanned}</span> files scanned ·{" "}
                    <span className="mono">{totalRules}</span> rules checked ·{" "}
                    <span className="mono" style={{ color: "var(--green)" }}>{passedRules}</span> passed
                  </p>
                  <p>
                    Top <span className="mono font-medium" style={{ color: tier.color }}>{percentile}%</span> of all agent workspaces
                  </p>
                </div>
              </div>

              {/* Mini summary */}
              <div className="flex flex-wrap gap-2.5">
                {errors.length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--red)]/10 text-[var(--red)] text-[12px] mono">
                    <AlertCircle className="w-3 h-3" /> {errors.length} critical{errors.length > 1 ? "s" : ""}
                  </div>
                )}
                {warnings.length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--amber)]/10 text-[var(--amber)] text-[12px] mono">
                    <AlertTriangle className="w-3 h-3" /> {warnings.length} warning{warnings.length > 1 ? "s" : ""}
                  </div>
                )}
                {infos.length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-[var(--text-secondary)] text-[12px] mono">
                    <Info className="w-3 h-3" /> {infos.length} info
                  </div>
                )}
                {data.diagnostics.length === 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--green)]/10 text-[var(--green)] text-[12px] mono">
                    <CheckCircle2 className="w-3 h-3" /> All clear
                  </div>
                )}
              </div>
            </div>

            {/* Category bars */}
            <div className="mt-8 space-y-3">
              {data.categories.map((cat) => {
                const catTier = getTier(cat.score);
                const meta = CATEGORY_META[cat.name];
                return (
                  <div key={cat.name} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 w-[120px] text-right">
                      <CategoryIcon name={cat.name} className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                      <span className="text-[13px] text-[var(--text-secondary)] flex-1 text-right">
                        {cat.name}
                      </span>
                    </div>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: catTier.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.score}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      />
                    </div>
                    <div className="flex items-center gap-2 w-[80px]">
                      <span className="text-[13px] mono font-medium" style={{ color: catTier.color }}>
                        {cat.score}
                      </span>
                      <span
                        className="text-[10px] mono px-1.5 py-0.5 rounded"
                        style={{ color: catTier.color, backgroundColor: catTier.bg }}
                      >
                        {catTier.grade}
                      </span>
                      <span className="text-[10px] mono text-[var(--text-dim)]">
                        ×{meta?.weight}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ═══════ Share on X CTA ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="rounded-xl border border-[#1d9bf0]/30 bg-gradient-to-r from-[#1d9bf0]/8 to-[#1d9bf0]/3 p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-[15px] font-semibold text-white mb-1.5 flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Share your score on X
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                Every share helps more developers discover agent linting. Better agent configs across the ecosystem means fewer hallucinations, fewer security gaps, and stronger AI workflows for everyone.
              </p>
            </div>
            <a
              href={`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white text-[14px] font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Post on X
            </a>
          </div>
        </motion.div>

        {/* ═══════ Table of Contents ═══════ */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-6">
          <h2 className="text-[15px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">In This Report</h2>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: "Category Deep-Dives", anchor: "#categories", icon: <BookOpen className="w-3 h-3" /> },
              { label: "All Diagnostics", anchor: "#diagnostics", icon: <Target className="w-3 h-3" /> },
              { label: "Score Distribution", anchor: "#distribution", icon: <Sparkles className="w-3 h-3" /> },
              { label: "Scoring Methodology", anchor: "#methodology", icon: <Zap className="w-3 h-3" /> },
              { label: "Files Scanned", anchor: "#files", icon: <FileText className="w-3 h-3" /> },
              { label: "Next Steps", anchor: "#next-steps", icon: <ArrowRight className="w-3 h-3" /> },
            ].map((item) => (
              <a
                key={item.anchor}
                href={item.anchor}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-all"
              >
                {item.icon}
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* ═══════ Category Deep-Dives ═══════ */}
        <div id="categories" className="space-y-4">
          <h2 className="text-[24px] sm:text-[28px] font-bold display flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-[var(--accent)]" />
            Category Deep-Dives
          </h2>
          <p className="text-[13px] text-[var(--text-secondary)] -mt-2 mb-2">
            Each category evaluates a different dimension of your agent workspace. Click to expand and see every rule checked, what passed, what flagged, and why each rule exists.
          </p>

          {data.categories.map((cat) => {
            const catTier = getTier(cat.score);
            const meta = CATEGORY_META[cat.name];
            const catDiagnostics = data.diagnostics.filter(
              (d) => d.category === cat.name.toLowerCase()
            );
            const flaggedRules = new Set(catDiagnostics.map((d) => d.rule));

            return (
              <Collapsible
                key={cat.name}
                title={`${cat.name} — ${cat.score}/100`}
                icon={<CategoryIcon name={cat.name} className={`w-4 h-4`} />}
                badge={
                  <span
                    className="text-[11px] mono px-2 py-0.5 rounded-md"
                    style={{ color: catTier.color, backgroundColor: catTier.bg }}
                  >
                    {catTier.grade} · {meta.weight}% weight
                  </span>
                }
                defaultOpen={cat.score < 100}
              >
                <div className="space-y-5 pt-4">
                  {/* Description */}
                  <div>
                    <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{meta.description}</p>
                  </div>

                  {/* Why It Matters */}
                  <div className="rounded-lg bg-[var(--accent-glow)] border border-[var(--accent-dim)] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span className="text-[12px] font-semibold text-[var(--accent)] uppercase tracking-wider">Why This Matters</span>
                    </div>
                    <p className="text-[13px] text-[var(--text)] leading-relaxed">{meta.whyItMatters}</p>
                  </div>

                  {/* Rules Checklist */}
                  <div>
                    <h4 className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                      Rules Checked ({meta.rules.length})
                    </h4>
                    <div className="space-y-1">
                      {meta.rules.map((rule) => {
                        const isFlagged = flaggedRules.has(rule.id);
                        const diagnostic = catDiagnostics.find((d) => d.rule === rule.id);
                        return (
                          <div
                            key={rule.id}
                            className="flex items-start gap-2.5 py-1.5 px-2 rounded-lg"
                            style={{ backgroundColor: isFlagged ? "rgba(255,255,255,0.02)" : "transparent" }}
                          >
                            {isFlagged ? (
                              <span className="mt-0.5">
                                {rule.severity === "critical" || rule.severity === "error" ? (
                                  <AlertCircle className="w-3.5 h-3.5 text-[var(--red)]" />
                                ) : rule.severity === "warning" ? (
                                  <AlertTriangle className="w-3.5 h-3.5 text-[var(--amber)]" />
                                ) : (
                                  <Info className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                                )}
                              </span>
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-[var(--green)]" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-[13px] ${isFlagged ? "text-[var(--text)]" : "text-[var(--text-secondary)]"}`}>
                                  {rule.description}
                                </span>
                              </div>
                              <span className="text-[10px] mono text-[var(--text-dim)]">{rule.id}</span>
                              {diagnostic && (
                                <p className="text-[12px] text-[var(--text-secondary)] mt-1 pl-0">
                                  → {diagnostic.message.length > 120 ? diagnostic.message.substring(0, 120) + "..." : diagnostic.message}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Flagged Issues Detail */}
                  {catDiagnostics.length > 0 && (
                    <div>
                      <h4 className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                        Flagged Issues ({catDiagnostics.length})
                      </h4>
                      <div className="space-y-4">
                        {catDiagnostics.map((d, i) => {
                          const education = RULE_EDUCATION[d.rule];
                          return (
                            <div key={i} className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
                              <div className="flex items-start gap-2.5 mb-2">
                                <SeverityIcon severity={d.severity} />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[12px] mono text-[var(--text-secondary)]">
                                      {d.file}{d.line ? `:${d.line}` : ""}
                                    </span>
                                    <span className="text-[10px] mono px-1.5 py-0.5 rounded bg-white/5 text-[var(--text-dim)]">
                                      {d.rule}
                                    </span>
                                  </div>
                                  <p className="text-[13px] text-[var(--text)] mt-1">{d.message}</p>
                                </div>
                              </div>

                              {/* Fix suggestion */}
                              {(d as any).fix && (
                                <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg bg-[var(--green)]/5 border border-[var(--green)]/10">
                                  <Zap className="w-3 h-3 mt-0.5 text-[var(--green)] shrink-0" />
                                  <span className="text-[12px] text-[var(--green)]">
                                    <strong>Fix:</strong> {(d as any).fix}
                                  </span>
                                </div>
                              )}

                              {/* Educational context */}
                              {education && (
                                <div className="mt-3 space-y-2">
                                  <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                                    {education.impact}
                                  </p>
                                  {education.example && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                      <CodeBlock code={education.example.bad} label="❌ Before" />
                                      <CodeBlock code={education.example.good} label="✅ After" />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Perfect score message */}
                  {catDiagnostics.length === 0 && (
                    <div className="flex items-center gap-3 py-3 px-4 rounded-lg bg-[var(--green)]/5 border border-[var(--green)]/10">
                      <CheckCircle2 className="w-5 h-5 text-[var(--green)]" />
                      <div>
                        <p className="text-[13px] text-[var(--green)] font-medium">Perfect score — all {meta.rules.length} rules passed</p>
                        <p className="text-[12px] text-[var(--text-secondary)]">
                          No issues found in this category. Your {cat.name.toLowerCase()} game is strong.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Collapsible>
            );
          })}
        </div>

        {/* ═══════ All Diagnostics (flat view) ═══════ */}
        <div id="diagnostics" className="space-y-4">
          <h2 className="text-[24px] sm:text-[28px] font-bold display flex items-center gap-3">
            <Target className="w-5 h-5 text-[var(--accent)]" />
            All Diagnostics
          </h2>

          {data.diagnostics.length === 0 ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-[var(--green)]" />
              <div>
                <p className="text-[14px] text-[var(--green)] font-medium">Zero issues</p>
                <p className="text-[13px] text-[var(--text-secondary)]">All {totalRules} rules passed without any flags.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] divide-y divide-[var(--border)]">
              {data.diagnostics.map((d, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                  <SeverityIcon severity={d.severity} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[12px] mono text-[var(--text-secondary)]">
                        {d.file}{d.line ? `:${d.line}` : ""}
                      </span>
                      <span className="text-[10px] mono px-1.5 py-0.5 rounded bg-white/5 text-[var(--text-dim)]">
                        {d.rule}
                      </span>
                      <span className={`text-[10px] mono px-1.5 py-0.5 rounded ${
                        d.severity === "critical" || d.severity === "error" ? "bg-[var(--red)]/10 text-[var(--red)]" :
                        d.severity === "warning" ? "bg-[var(--amber)]/10 text-[var(--amber)]" :
                        "bg-white/5 text-[var(--text-dim)]"
                      }`}>
                        {d.severity}
                      </span>
                    </div>
                    <p className="text-[13px] text-[var(--text)] mt-0.5">{d.message}</p>
                    {(d as any).fix && (
                      <p className="text-[12px] text-[var(--green)] mt-1">
                        💡 {(d as any).fix}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ═══════ Score Distribution ═══════ */}
        <div id="distribution" className="space-y-4">
          <h2 className="text-[24px] sm:text-[28px] font-bold display flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[var(--accent)]" />
            Score Distribution
          </h2>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] text-[var(--text-secondary)]">Where you stand among all scanned workspaces</span>
              <span className="text-[12px] mono" style={{ color: tier.color }}>
                Top {percentile}%
              </span>
            </div>
            <Histogram userScore={data.totalScore} />
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-white/3 p-3">
                <div className="text-[10px] mono text-[var(--text-dim)] mb-1">Median</div>
                <div className="text-[16px] font-bold mono text-[var(--text-secondary)]">64</div>
              </div>
              <div className="rounded-lg p-3" style={{ backgroundColor: tier.bg }}>
                <div className="text-[10px] mono text-[var(--text-dim)] mb-1">Your Score</div>
                <div className="text-[16px] font-bold mono" style={{ color: tier.color }}>{data.totalScore}</div>
              </div>
              <div className="rounded-lg bg-white/3 p-3">
                <div className="text-[10px] mono text-[var(--text-dim)] mb-1">Top 1%</div>
                <div className="text-[16px] font-bold mono text-[var(--text-secondary)]">98+</div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ Scoring Methodology ═══════ */}
        <div id="methodology" className="space-y-4">
          <h2 className="text-[24px] sm:text-[28px] font-bold display flex items-center gap-3">
            <Zap className="w-5 h-5 text-[var(--accent)]" />
            Scoring Methodology
          </h2>
          <p className="text-[13px] text-[var(--text-secondary)] -mt-2">
            Understanding how AgentLinter calculates your score helps you prioritize improvements.
          </p>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-6 space-y-5">
            {/* Base score */}
            <div>
              <h3 className="text-[15px] font-semibold mb-2">Base Score</h3>
              <p className="text-[13px] text-[var(--text-secondary)]">{SCORING_METHODOLOGY.base}</p>
            </div>

            {/* Deductions */}
            <div>
              <h3 className="text-[15px] font-semibold mb-3">Deductions</h3>
              <div className="space-y-2.5">
                {SCORING_METHODOLOGY.deductions.map((d) => (
                  <div key={d.severity} className="flex items-start gap-3">
                    <div
                      className="flex items-center justify-center w-[44px] h-[28px] rounded-lg mono text-[13px] font-bold shrink-0 mt-0.5"
                      style={{ color: d.color, backgroundColor: `color-mix(in srgb, ${d.color} 12%, transparent)` }}
                    >
                      {d.points}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] font-medium" style={{ color: d.color }}>{d.severity}</span>
                      <span className="text-[12px] text-[var(--text-dim)] ml-1.5 break-words">{d.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bonuses */}
            <div>
              <h3 className="text-[15px] font-semibold mb-3">Bonus Points</h3>
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-[12px]">
                {SCORING_METHODOLOGY.bonuses.map((b, i) => (
                  <div key={b.category} className="contents">
                    <span className="text-[var(--green)] mono font-medium whitespace-nowrap">{b.category}</span>
                    <span className="text-[var(--text-secondary)]">{b.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Formula */}
            <div className="rounded-lg bg-[var(--bg)] border border-[var(--border)] p-4">
              <h3 className="text-[12px] font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-2">Final Score Formula</h3>
              <code className="text-[14px] text-[var(--accent)]">
                Total = Σ (category_score × category_weight)
              </code>
              <div className="mt-3 text-[12px] mono text-[var(--text-dim)] space-y-1">
                {data.categories.map((cat) => {
                  const meta = CATEGORY_META[cat.name];
                  return (
                    <div key={cat.name} className="flex gap-2">
                      <span className="text-[var(--text-secondary)]">{cat.name}:</span>
                      <span>{cat.score} × {meta.weight / 100} = {(cat.score * meta.weight / 100).toFixed(1)}</span>
                    </div>
                  );
                })}
                <div className="border-t border-[var(--border)] pt-1 mt-1 flex gap-2 font-medium text-[var(--accent)]">
                  <span>Total:</span>
                  <span>{data.categories.reduce((s, c) => s + c.score * CATEGORY_META[c.name].weight / 100, 0).toFixed(1)} ≈ {data.totalScore}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ Files Scanned ═══════ */}
        <div id="files" className="space-y-4">
          <h2 className="text-[24px] sm:text-[28px] font-bold display flex items-center gap-3">
            <FileText className="w-5 h-5 text-[var(--accent)]" />
            Files Scanned ({data.filesScanned})
          </h2>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {data.files.map((f) => {
                const issues = data.diagnostics.filter((d) => d.file === f);
                const hasIssue = issues.length > 0;
                return (
                  <div
                    key={f}
                    className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-white/3 transition-colors"
                  >
                    {hasIssue ? (
                      <Info className="w-3 h-3 shrink-0 text-[var(--text-dim)]" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 shrink-0 text-[var(--green)]" />
                    )}
                    <span className="text-[12px] mono text-[var(--text-secondary)] truncate">{f}</span>
                    {hasIssue && (
                      <span className="text-[10px] mono text-[var(--text-dim)] ml-auto shrink-0">
                        {issues.length} issue{issues.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══════ Next Steps ═══════ */}
        <div id="next-steps" className="space-y-4">
          <h2 className="text-[24px] sm:text-[28px] font-bold display flex items-center gap-3">
            <ArrowRight className="w-5 h-5 text-[var(--accent)]" />
            Next Steps
          </h2>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-6 space-y-4">
            {data.totalScore >= 95 ? (
              <>
                <div className="flex items-start gap-3">
                  <span className="text-[20px]">🏆</span>
                  <div>
                    <p className="text-[14px] font-semibold">You&apos;re in the top tier.</p>
                    <p className="text-[13px] text-[var(--text-secondary)] mt-1">
                      Your workspace is exceptionally well-configured. The remaining info-level suggestions are minor polish — fix them if you want perfection, or ship as-is with confidence.
                    </p>
                  </div>
                </div>
                <div className="border-t border-[var(--border)] pt-4 space-y-3">
                  <p className="text-[13px] font-semibold">Optional improvements:</p>
                  {data.diagnostics.slice(0, 3).map((d, i) => (
                    <div key={i} className="flex items-start gap-2 text-[12px] text-[var(--text-secondary)]">
                      <ChevronRight className="w-3 h-3 mt-0.5 text-[var(--text-dim)] shrink-0" />
                      <span>
                        <span className="mono text-[var(--text)]">{d.file}</span> — {d.message.substring(0, 80)}
                        {(d as any).fix && <span className="text-[var(--green)]"> → {(d as any).fix.substring(0, 60)}</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : data.totalScore >= 80 ? (
              <div className="space-y-3">
                <p className="text-[14px] font-semibold">Focus on these high-impact fixes:</p>
                {data.diagnostics
                  .sort((a, b) => {
                    const order = { critical: 0, error: 0, warning: 1, info: 2 };
                    return (order[a.severity as keyof typeof order] || 2) - (order[b.severity as keyof typeof order] || 2);
                  })
                  .slice(0, 5)
                  .map((d, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <SeverityIcon severity={d.severity} />
                      <div className="text-[13px]">
                        <span className="mono text-[var(--text-secondary)]">{d.file}</span>
                        <span className="text-[var(--text)]"> — {d.message}</span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[14px] font-semibold">Start with the criticals:</p>
                <p className="text-[13px] text-[var(--text-secondary)]">
                  Fix all <span className="text-[var(--red)]">critical</span>-level issues first — these have the biggest impact on your score and agent behavior.
                  Then tackle <span className="text-[var(--amber)]">warnings</span>. Info items are polish.
                </p>
              </div>
            )}

            {/* Auto-fix hint */}
            {data.diagnostics.some((d) => (d as any).fix) && (
              <div className="mt-4 rounded-lg bg-[var(--teal-dim)] border border-[var(--teal)]/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-3.5 h-3.5 text-[var(--teal)]" />
                  <span className="text-[12px] font-semibold text-[var(--teal)] uppercase tracking-wider">Fixes Available</span>
                </div>
                <p className="text-[13px] text-[var(--text-secondary)]">
                  {data.diagnostics.filter((d) => (d as any).fix).length} issues have suggested fixes. Apply the 💡 suggestions above to improve your score.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ═══════ Share CTA ═══════ */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-8 text-center space-y-4">
          <div className="text-[28px]">{tier.emoji}</div>
          <p className="text-[18px] font-bold display">
            Score: {data.totalScore}/100 · {tier.grade} Tier
          </p>
          <p className="text-[13px] text-[var(--text-secondary)]">
            Share your score and help other developers discover AgentLinter.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={shareUrl}
              target="_blank"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-[14px] font-semibold transition-all hover:brightness-125"
              style={{ backgroundColor: tier.color, color: "black" }}
            >
              <Share2 className="w-4 h-4" />
              Share on X
            </a>
            <a
              href="https://github.com/seojoonkim/agentlinter"
              target="_blank"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-[14px] font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--border-hover)] transition-all"
            >
              <Github className="w-4 h-4" />
              Star on GitHub
            </a>
          </div>
          <div className="text-[13px] text-[var(--text-dim)] pt-2">
            Score your own agent →{" "}
            <code className="text-[var(--accent)]">npx agentlinter</code>
            <span className="mx-2">·</span>
            Free & open source
          </div>
        </div>

        {/* ═══════ Privacy Note ═══════ */}
        <div className="rounded-xl border border-[var(--teal-dim)] bg-[var(--teal-dim)] p-4 flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-[var(--teal)] mt-0.5 shrink-0" />
          <div className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
            <span className="font-medium text-[var(--teal)]">Your data stays private.</span> AgentLinter runs 100% locally on your machine. Only scores, file names, and diagnostic messages are shared in this report — your actual file contents are never uploaded.{" "}
            <a href="https://agentlinter.com/#privacy" className="text-[var(--teal)] hover:underline">Learn more →</a>
          </div>
        </div>

        {/* ═══════ Spread the Word ═══════ */}
        <div className="rounded-xl border border-[var(--border)] bg-gradient-to-br from-[var(--accent-dim)] to-[var(--teal-dim)] p-5 text-center">
          <p className="text-[14px] font-medium text-[var(--text)] mb-2">
            🙌 Help fellow agent builders
          </p>
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-4 max-w-[400px] mx-auto">
            If AgentLinter helped you improve your agent setup, share it with developers in your community. Every share helps the ecosystem.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <a
              href={`https://x.com/intent/tweet?text=${encodeURIComponent(`My agent workspace scored ${data.totalScore}/100 on AgentLinter ⚡\n\nFree & open source — score your own:\nnpx agentlinter\n\nagentlinter.com`)}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--border-hover)] transition-all"
            >
              <ExternalLink className="w-3 h-3" />
              Share on X
            </a>
            <a
              href="https://github.com/seojoonkim/agentlinter"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--border-hover)] transition-all"
            >
              ⭐ Star on GitHub
            </a>
          </div>
        </div>

        {/* ═══════ Footer ═══════ */}
        <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between text-[12px] text-[var(--text-dim)]">
          <div className="flex items-center gap-2">
            <Logo size={14} />
            <span>AgentLinter</span>
            <span className="text-[10px] mono">v0.1.0</span>
          </div>
          <span className="mono">{new Date(data.timestamp).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
        </div>
      </main>
    </div>
  );
}
