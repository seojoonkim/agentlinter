"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Terminal,
  ArrowRight,
  Github,
  Star,
  BarChart3,
  Zap,
  Shield,
  FileText,
  Lock,
  Share2,
  Trophy,
  RefreshCw,
  ChevronRight,
  Users,
  TrendingUp,
  Check,
  Sparkles,
  Braces,
  ExternalLink,
  Minus,
  CircleCheck,
  CircleMinus,
} from "lucide-react";

/* ────────────────────────────────────────
   Logo
   ──────────────────────────────────────── */
function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
      <path
        d="M9 10.5L16 7L23 10.5V17L16 25L9 17V10.5Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M12 13L16 11L20 13V17L16 21L12 17V13Z"
        fill="rgba(255,255,255,0.15)"
        stroke="white"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="15.5" r="1.5" fill="white" />
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ────────────────────────────────────────
   Animated Terminal
   ──────────────────────────────────────── */
function AnimatedTerminal() {
  const [lines, setLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);

  const terminalLines = [
    { text: "$ npx agentlinter score .", type: "command" },
    { text: "", type: "blank" },
    { text: "🔍 AgentLinter v1.0.0", type: "header" },
    { text: "📁 Scanning: ./.claude/", type: "info" },
    { text: "", type: "blank" },
    { text: "  CLAUDE.md ........... 72/100", type: "score" },
    { text: "  ├─ Structure     ████████░░ 80", type: "detail" },
    { text: "  ├─ Clarity       ███████░░░ 70", type: "detail" },
    { text: "  ├─ Completeness  ██████░░░░ 60", type: "detail" },
    { text: "  ├─ Security      █████████░ 90", type: "detail" },
    { text: "  └─ Consistency   ██████░░░░ 60", type: "detail" },
    { text: "", type: "blank" },
    { text: "⚠️  5 warnings, 2 errors", type: "warning" },
    { text: "", type: "blank" },
    { text: "  ERROR  Secret detected: API key (sk-...)", type: "error" },
    { text: "  ERROR  TOOLS.md missing", type: "error" },
    { text: "  WARN   No persona — Add SOUL.md", type: "warn" },
    { text: "", type: "blank" },
    { text: "📊 Report → agentlinter.com/r/a3f8k2", type: "success" },
  ];

  useEffect(() => {
    if (currentLine >= terminalLines.length) return;
    const timer = setTimeout(
      () => {
        setLines((prev) => [...prev, terminalLines[currentLine].text]);
        setCurrentLine((prev) => prev + 1);
      },
      currentLine === 0 ? 600 : terminalLines[currentLine].type === "blank" ? 80 : 120
    );
    return () => clearTimeout(timer);
  }, [currentLine]);

  const getColor = (i: number) => {
    const t = terminalLines[i]?.type;
    return t === "command"
      ? "text-[var(--accent)]"
      : t === "header"
        ? "text-white font-medium"
        : t === "score"
          ? "text-white font-medium"
          : t === "error"
            ? "text-[var(--red)]"
            : t === "warn"
              ? "text-[var(--amber)]"
              : t === "warning"
                ? "text-[var(--amber)]"
                : t === "success"
                  ? "text-[var(--accent)]"
                  : "text-[var(--text-secondary)]";
  };

  return (
    <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[#0a0a10]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-[11px] text-[var(--text-dim)] mono">
          terminal
        </span>
      </div>
      <div className="p-5 sm:p-6 mono text-[12px] sm:text-[13px] leading-[1.8] min-h-[340px] sm:min-h-[380px] overflow-x-auto">
        {lines.map((line, i) => (
          <div key={i} className={getColor(i)}>
            {line || "\u00A0"}
          </div>
        ))}
        {currentLine < terminalLines.length && (
          <span className="inline-block w-1.5 h-3.5 bg-[var(--accent)] animate-pulse" />
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────
   Tier System
   ──────────────────────────────────────── */
function getTier(score: number) {
  if (score >= 95) return { grade: "S", color: "#c084fc", bg: "#c084fc20" };
  if (score >= 90) return { grade: "A+", color: "#a78bfa", bg: "#a78bfa20" };
  if (score >= 85) return { grade: "A", color: "#818cf8", bg: "#818cf820" };
  if (score >= 80) return { grade: "A-", color: "#60a5fa", bg: "#60a5fa20" };
  if (score >= 75) return { grade: "B+", color: "#34d399", bg: "#34d39920" };
  if (score >= 70) return { grade: "B", color: "#4ade80", bg: "#4ade8020" };
  if (score >= 65) return { grade: "B-", color: "#fbbf24", bg: "#fbbf2420" };
  if (score >= 60) return { grade: "C+", color: "#fb923c", bg: "#fb923c20" };
  if (score >= 55) return { grade: "C", color: "#f87171", bg: "#f8717120" };
  return { grade: "D", color: "#ef4444", bg: "#ef444420" };
}

/* ────────────────────────────────────────
   Score Histogram
   ──────────────────────────────────────── */
function ScoreHistogram({ userScore }: { userScore: number }) {
  // Simulated distribution (bell curve skewed left)
  const bins = [
    { range: "0-29", count: 3 },
    { range: "30-39", count: 5 },
    { range: "40-49", count: 12 },
    { range: "50-59", count: 22 },
    { range: "60-69", count: 35 },
    { range: "70-79", count: 28 },
    { range: "80-89", count: 15 },
    { range: "90-100", count: 6 },
  ];
  const maxCount = Math.max(...bins.map((b) => b.count));
  const userBinIdx = Math.min(Math.floor((userScore - (userScore < 30 ? 0 : 30)) / 10) + (userScore < 30 ? 0 : 1), bins.length - 1);
  // More precise: find the bin
  const getUserBin = () => {
    if (userScore < 30) return 0;
    if (userScore < 40) return 1;
    if (userScore < 50) return 2;
    if (userScore < 60) return 3;
    if (userScore < 70) return 4;
    if (userScore < 80) return 5;
    if (userScore < 90) return 6;
    return 7;
  };
  const activeBin = getUserBin();

  return (
    <div>
      <div className="flex items-end gap-[3px] h-[48px]">
        {bins.map((bin, i) => {
          const height = (bin.count / maxCount) * 100;
          const isActive = i === activeBin;
          return (
            <div key={bin.range} className="flex-1 flex flex-col items-center">
              <div
                className="w-full rounded-sm transition-all"
                style={{
                  height: `${height}%`,
                  backgroundColor: isActive ? "var(--accent)" : "rgba(255,255,255,0.08)",
                  minHeight: "2px",
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-[3px] mt-1">
        {bins.map((bin, i) => (
          <div
            key={bin.range}
            className="flex-1 text-center text-[8px] mono"
            style={{ color: i === activeBin ? "var(--accent)" : "var(--text-dim)" }}
          >
            {i === 0 ? "0" : i === bins.length - 1 ? "100" : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────
   Web Report Preview
   ──────────────────────────────────────── */
function ReportPreview() {
  const score = 87;
  const tier = getTier(score);
  const percentile = 12;

  const cats = [
    { label: "Structure", score: 80 },
    { label: "Clarity", score: 90 },
    { label: "Completeness", score: 85 },
    { label: "Security", score: 95 },
    { label: "Consistency", score: 75 },
  ];

  const prescriptions = [
    { type: "error", text: "Rotate exposed API key in TOOLS.md", fix: true },
    { type: "error", text: "Create TOOLS.md with model config", fix: true },
    { type: "warn", text: "Add SOUL.md for agent persona", fix: true },
    { type: "warn", text: "Add error recovery workflow", fix: false },
    { type: "info", text: "Consider adding SECURITY.md", fix: false },
  ];

  return (
    <motion.div
      className="w-full max-w-[380px] mx-auto"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {/* Browser chrome */}
      <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[#0a0a10]">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] bg-[var(--bg-card)]">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
            <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
            <div className="w-2 h-2 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 mx-2">
            <div className="bg-white/5 rounded-md px-3 py-1 text-[10px] text-[var(--text-dim)] mono text-center">
              agentlinter.com/r/a3f8k2
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Header + Grade */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo size={14} />
              <span className="text-[12px] text-[var(--text-secondary)]">Report</span>
            </div>
            <div
              className="px-2 py-0.5 rounded-md text-[12px] font-bold mono"
              style={{ color: tier.color, backgroundColor: tier.bg }}
            >
              {tier.grade}
            </div>
          </div>

          {/* Score + Percentile */}
          <div className="flex items-end gap-4">
            <div>
              <span className="text-[42px] font-bold text-white leading-none">{score}</span>
              <span className="text-[var(--text-dim)] text-sm ml-1">/100</span>
            </div>
            <div className="pb-1.5">
              <div className="text-[11px] mono" style={{ color: tier.color }}>
                Top {percentile}%
              </div>
              <div className="text-[10px] text-[var(--text-dim)]">of all agents</div>
            </div>
          </div>

          {/* Category bars */}
          <div className="space-y-2">
            {cats.map((c) => {
              const catTier = getTier(c.score);
              return (
                <div key={c.label} className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--text-secondary)] w-[72px] text-right mono">
                    {c.label}
                  </span>
                  <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${c.score}%`,
                        backgroundColor: catTier.color,
                        opacity: 0.8,
                      }}
                    />
                  </div>
                  <span className="text-[10px] w-5 mono" style={{ color: catTier.color }}>
                    {c.score}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Histogram */}
          <div className="pt-3 border-t border-[var(--border)]">
            <div className="text-[9px] text-[var(--text-dim)] mono mb-1.5">Distribution</div>
            <ScoreHistogram userScore={score} />
          </div>

          {/* Prescriptions */}
          <div className="pt-3 border-t border-[var(--border)]">
            <div className="text-[10px] text-[var(--text-dim)] mono mb-2">Prescriptions</div>
            <div className="space-y-1.5">
              {prescriptions.map((p, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span
                    className="text-[9px] mono mt-0.5 px-1 rounded shrink-0"
                    style={{
                      color: p.type === "error" ? "var(--red)" : p.type === "warn" ? "var(--amber)" : "var(--text-dim)",
                      backgroundColor: p.type === "error" ? "rgba(248,113,113,0.1)" : p.type === "warn" ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.05)",
                    }}
                  >
                    {p.type === "error" ? "ERR" : p.type === "warn" ? "WARN" : "INFO"}
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)] flex-1">{p.text}</span>
                  {p.fix && (
                    <span className="text-[9px] mono px-1.5 py-0.5 rounded-full shrink-0" style={{ color: "var(--accent)", backgroundColor: "var(--accent-dim)" }}>
                      auto-fix
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Share CTA */}
          <button
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-medium transition-all"
            style={{ backgroundColor: tier.bg, color: tier.color }}
          >
            <Share2 className="w-3.5 h-3.5" />
            Share Report on X
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────
   Main Page
   ──────────────────────────────────────── */
export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ── Nav ── */}
      <nav
        className="fixed top-0 w-full z-50 backdrop-blur-xl bg-[var(--bg)]/70 border-b border-[var(--border)]"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-[920px] mx-auto px-7 sm:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={22} />
            <span className="font-semibold text-[15px] tracking-tight">
              AgentLinter
            </span>
          </div>
          <div className="flex items-center gap-5">
            <a
              href="https://github.com/seojoonkim/agentlinter"
              target="_blank"
              className="text-[13px] text-[var(--text-secondary)] hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Github className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a
              href="#get-started"
              className="text-[13px] px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-[100px] sm:pt-[120px] pb-14 sm:pb-20 px-7 sm:px-8">
        <div className="max-w-[920px] mx-auto">
          <motion.div
            className="max-w-[600px]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] text-[var(--accent)] text-[12px] mono mb-8">
              <Sparkles className="w-3 h-3" />
              ESLint for AI Agents
            </div>

            <h1 className="text-[32px] sm:text-[44px] lg:text-[56px] font-bold leading-[1.1] tracking-tight mb-6">
              How sharp is
              <br />
              <span className="text-[var(--accent)]">your agent?</span>
            </h1>

            <p className="text-[15px] sm:text-[17px] text-[var(--text-secondary)] leading-[1.7] mb-10 max-w-[480px]">
              Your agent is only as good as its config. One command scans your
              entire workspace — every file, every rule — and tells you exactly what to fix.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#get-started"
                className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-[var(--accent)] text-black font-semibold text-[14px] hover:brightness-110 transition-all"
              >
                <Terminal className="w-4 h-4" />
                npx agentlinter
              </a>
              <a
                href="https://github.com/seojoonkim/agentlinter"
                target="_blank"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] text-[14px] hover:text-white hover:border-[var(--border-hover)] transition-all"
              >
                <Github className="w-3.5 h-3.5" />
                GitHub
              </a>
            </div>
          </motion.div>

          {/* Terminal */}
          <motion.div
            className="mt-16 sm:mt-20"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AnimatedTerminal />
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 sm:py-28 px-7 sm:px-8">
        <div className="max-w-[920px] mx-auto">
          <div className="mb-14 sm:mb-16">
            <h2 className="text-[24px] sm:text-[32px] font-bold tracking-tight mb-3">
              What it checks
            </h2>
            <p className="text-[var(--text-secondary)] text-[15px]">
              Five dimensions. Every file. Zero guesswork.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: BarChart3,
                title: "Score 0–100",
                desc: "Structure, clarity, completeness, security, consistency — each scored individually.",
              },
              {
                icon: Zap,
                title: "Auto-fix",
                desc: "Most issues come with a one-command fix. Accept or skip.",
              },
              {
                icon: Shield,
                title: "Secret Scan",
                desc: "API keys in your config files? Caught before they hit GitHub.",
              },
              {
                icon: FileText,
                title: "Cross-file Check",
                desc: "SOUL.md says one thing, CLAUDE.md says another? You'll know.",
              },
              {
                icon: Terminal,
                title: "Starter Templates",
                desc: "No config yet? Pick a template — personal, coding, team, or chatbot.",
              },
              {
                icon: Lock,
                title: "Team Rules",
                desc: "Enforce your own standards with .agentlinterrc. Your rules, your scores.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="p-5 sm:p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors"
              >
                <f.icon className="w-5 h-5 text-[var(--text-dim)] mb-4" />
                <h3 className="font-semibold text-[15px] mb-2">{f.title}</h3>
                <p className="text-[13px] text-[var(--text-secondary)] leading-[1.6]">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison: vs Anthropic's Official Tool ── */}
      <section className="py-20 sm:py-28 px-7 sm:px-8 border-t border-[var(--border)]">
        <div className="max-w-[920px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-14 sm:mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] text-[var(--text-secondary)] text-[12px] mono mb-6">
                Built on top of the official foundation
              </div>
              <h2 className="text-[24px] sm:text-[32px] font-bold tracking-tight mb-4">
                Anthropic built the foundation.
                <br />
                <span className="text-[var(--accent)]">We built the linter.</span>
              </h2>
              <p className="text-[var(--text-secondary)] text-[15px] leading-[1.7] max-w-[600px]">
                Anthropic&apos;s Claude Code provides{" "}
                <a
                  href="https://code.claude.com/docs/en/memory"
                  target="_blank"
                  className="text-[var(--accent)] hover:underline inline-flex items-center gap-1"
                >
                  CLAUDE.md memory
                  <ExternalLink className="w-3 h-3" />
                </a>{" "}
                and{" "}
                <a
                  href="https://code.claude.com/docs/en/skills"
                  target="_blank"
                  className="text-[var(--accent)] hover:underline inline-flex items-center gap-1"
                >
                  skills
                  <ExternalLink className="w-3 h-3" />
                </a>{" "}
                — the building blocks for agent configuration. AgentLinter takes these
                building blocks and tells you if you&apos;re using them well.
              </p>
            </div>

            {/* Comparison Table */}
            <div className="rounded-xl border border-[var(--border)] overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-3 bg-[var(--bg-card)]">
                <div className="p-4 sm:p-5 border-r border-[var(--border)]">
                  <span className="text-[12px] text-[var(--text-dim)] mono">Feature</span>
                </div>
                <div className="p-4 sm:p-5 border-r border-[var(--border)] text-center">
                  <div className="text-[13px] text-[var(--text-secondary)]">Claude Code</div>
                  <div className="text-[10px] text-[var(--text-dim)] mono mt-0.5">Anthropic Official</div>
                </div>
                <div className="p-4 sm:p-5 text-center">
                  <div className="text-[13px] font-semibold text-[var(--accent)]">AgentLinter</div>
                  <div className="text-[10px] text-[var(--text-dim)] mono mt-0.5">This project</div>
                </div>
              </div>

              {/* Table Rows */}
              {[
                {
                  feature: "Scoring",
                  official: "Single score via /init",
                  ours: "5-category breakdown (0-100)",
                  officialStatus: "partial",
                  oursStatus: "full",
                },
                {
                  feature: "Scope",
                  official: "Single CLAUDE.md file",
                  ours: "Entire workspace (all .md files)",
                  officialStatus: "partial",
                  oursStatus: "full",
                },
                {
                  feature: "Cross-file consistency",
                  official: "—",
                  ours: "Detects contradictions across files",
                  officialStatus: "none",
                  oursStatus: "full",
                },
                {
                  feature: "Secret scanning",
                  official: "—",
                  ours: "API keys, tokens, passwords",
                  officialStatus: "none",
                  oursStatus: "full",
                },
                {
                  feature: "Auto-fix",
                  official: "Suggestions via prompting",
                  ours: "One-command --fix",
                  officialStatus: "partial",
                  oursStatus: "full",
                },
                {
                  feature: "Custom rules",
                  official: "—",
                  ours: ".agentlinterrc per team",
                  officialStatus: "none",
                  oursStatus: "full",
                },
                {
                  feature: "CI/CD integration",
                  official: "—",
                  ours: "GitHub Action on every PR",
                  officialStatus: "none",
                  oursStatus: "full",
                },
                {
                  feature: "Templates",
                  official: "/init bootstrap",
                  ours: "4 templates (personal, coding, team, chatbot)",
                  officialStatus: "partial",
                  oursStatus: "full",
                },
                {
                  feature: "Shareable reports",
                  official: "—",
                  ours: "Web reports + Score Cards for X",
                  officialStatus: "none",
                  oursStatus: "full",
                },
                {
                  feature: "Multi-framework",
                  official: "Claude Code only",
                  ours: "Claude Code, Clawdbot, Cursor, Windsurf",
                  officialStatus: "partial",
                  oursStatus: "full",
                },
              ].map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-3 ${i % 2 === 0 ? "bg-[#0a0a10]" : "bg-[var(--bg-card)]/50"}`}
                >
                  <div className="p-4 sm:p-5 border-r border-t border-[var(--border)]">
                    <span className="text-[13px] text-white font-medium">{row.feature}</span>
                  </div>
                  <div className="p-4 sm:p-5 border-r border-t border-[var(--border)] flex items-start gap-2">
                    {row.officialStatus === "full" ? (
                      <CircleCheck className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    ) : row.officialStatus === "partial" ? (
                      <CircleMinus className="w-3.5 h-3.5 text-[var(--amber)] mt-0.5 shrink-0" />
                    ) : (
                      <Minus className="w-3.5 h-3.5 text-[var(--text-dim)] mt-0.5 shrink-0" />
                    )}
                    <span className="text-[12px] text-[var(--text-secondary)]">{row.official}</span>
                  </div>
                  <div className="p-4 sm:p-5 border-t border-[var(--border)] flex items-start gap-2">
                    {row.oursStatus === "full" ? (
                      <CircleCheck className="w-3.5 h-3.5 text-[var(--accent)] mt-0.5 shrink-0" />
                    ) : row.oursStatus === "partial" ? (
                      <CircleMinus className="w-3.5 h-3.5 text-[var(--amber)] mt-0.5 shrink-0" />
                    ) : (
                      <Minus className="w-3.5 h-3.5 text-[var(--text-dim)] mt-0.5 shrink-0" />
                    )}
                    <span className="text-[12px] text-[var(--text-secondary)]">{row.ours}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom note */}
            <div className="mt-8 p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
              <p className="text-[13px] text-[var(--text-secondary)] leading-[1.7]">
                <span className="text-white font-medium">Not a replacement — an extension.</span>{" "}
                AgentLinter builds on Anthropic&apos;s CLAUDE.md standard and{" "}
                <a
                  href="https://agentskills.io"
                  target="_blank"
                  className="text-[var(--accent)] hover:underline"
                >
                  Agent Skills
                </a>{" "}
                open standard. Think of it as ESLint for your JavaScript — the language
                gives you the syntax, the linter tells you if your code is good.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Share ── */}
      <section className="py-20 sm:py-28 px-7 sm:px-8 border-t border-[var(--border)]">
        <div className="max-w-[920px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <div>
              <h2 className="text-[24px] sm:text-[32px] font-bold tracking-tight mb-4">
                Your report card.
              </h2>
              <p className="text-[var(--text-secondary)] text-[15px] leading-[1.7] mb-8">
                Every run generates a web report — tier grade, category breakdown,
                what to fix, and where you rank. Then share it.
              </p>
              <div className="space-y-3">
                {[
                  "Tier grades: S, A+, A, A-, B+, B …",
                  "Exact prescriptions with auto-fix options",
                  "See where you rank on the histogram",
                  "Track progress over time — 72 → 89",
                  "Share your report on X",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full bg-[var(--accent-dim)] flex items-center justify-center mt-0.5 shrink-0">
                      <Check className="w-2.5 h-2.5 text-[var(--accent)]" />
                    </div>
                    <span className="text-[14px] text-[var(--text-secondary)]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <ReportPreview />
          </div>
        </div>
      </section>

      {/* ── Self-Evolving ── */}
      <section className="py-20 sm:py-28 px-7 sm:px-8 border-t border-[var(--border)]">
        <div className="max-w-[920px] mx-auto">
          <div className="mb-14">
            <h2 className="text-[24px] sm:text-[32px] font-bold tracking-tight mb-3">
              Rules that learn
            </h2>
            <p className="text-[var(--text-secondary)] text-[15px] max-w-[520px] leading-[1.7]">
              Every lint teaches us something. Common failures become new rules.
              Bad fixes get replaced. The engine improves whether you do or not.
            </p>
          </div>

          {/* Flywheel */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-12 sm:mb-14">
            {[
              { icon: Search, label: "Lint" },
              { icon: Share2, label: "Share" },
              { icon: Users, label: "Users" },
              { icon: TrendingUp, label: "Data" },
              { icon: RefreshCw, label: "Rules" },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-2 sm:gap-3">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center">
                    <s.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--text-dim)]" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-[var(--text-dim)]">
                    {s.label}
                  </span>
                </div>
                {i < 4 && (
                  <ChevronRight className="w-3 h-3 text-[var(--text-dim)] mt-[-16px]" />
                )}
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                level: "L1 · Auto",
                title: "Rule Tuning",
                desc: "Weights adjust based on which warnings users fix immediately.",
              },
              {
                level: "L2 · Semi",
                title: "Rule Discovery",
                desc: "Patterns in top agents become new rule candidates.",
              },
              {
                level: "L3 · Auto",
                title: "Fix Evolution",
                desc: "Low-acceptance fixes get A/B tested and replaced.",
              },
              {
                level: "L4 · Semi",
                title: "Template Evolution",
                desc: "Templates update based on what files users add.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]"
              >
                <span className="text-[10px] mono text-[var(--accent)] bg-[var(--accent-dim)] px-2 py-0.5 rounded-full">
                  {item.level}
                </span>
                <h3 className="font-semibold text-[14px] mt-3 mb-1.5">
                  {item.title}
                </h3>
                <p className="text-[12px] text-[var(--text-secondary)] leading-[1.6]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <p className="text-[12px] text-[var(--text-dim)] mt-6">
            All data anonymized. Opt-out:{" "}
            <code className="text-[var(--text-secondary)]">--no-telemetry</code>
          </p>
        </div>
      </section>

      {/* ── Get Started ── */}
      <section
        className="py-20 sm:py-28 px-7 sm:px-8 border-t border-[var(--border)]"
        id="get-started"
      >
        <div className="max-w-[560px] mx-auto">
          <h2 className="text-[24px] sm:text-[32px] font-bold tracking-tight mb-10 sm:mb-12">
            Get started
          </h2>

          <div className="space-y-4">
            <div className="p-5 sm:p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
              <div className="text-[12px] text-[var(--text-dim)] mb-3">
                One command. Full report.
              </div>
              <code className="text-[var(--accent)] text-[15px] sm:text-[17px] mono">
                npx agentlinter
              </code>
              <div className="text-[13px] text-[var(--text-secondary)] mt-4 leading-[1.7]">
                Scans your workspace → scores every file → opens your report with tier, prescriptions, and a share button.
              </div>
            </div>
          </div>

          <p className="text-[var(--text-dim)] text-[13px] mt-8 text-center">
            Works with Claude Code, Clawdbot, Cursor, Windsurf, and any AI
            agent workspace.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-7 sm:px-8 border-t border-[var(--border)]">
        <div className="max-w-[920px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-[13px]">
            <div className="flex items-center gap-2">
              <Logo size={16} />
              <span className="font-semibold">AgentLinter</span>
            </div>
            <span className="text-[var(--text-dim)]">
              by{" "}
              <a
                href="https://twitter.com/simonkim_nft"
                target="_blank"
                className="text-[var(--text-secondary)] hover:text-white transition-colors"
              >
                @simonkim_nft
              </a>
            </span>
          </div>
          <div className="flex items-center gap-6 text-[13px] text-[var(--text-dim)]">
            <a
              href="https://github.com/seojoonkim/agentlinter"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
