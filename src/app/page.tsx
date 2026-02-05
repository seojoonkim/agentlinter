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
} from "lucide-react";

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
    { text: "💡 Run `agentlinter fix` to auto-fix 4 issues", type: "success" },
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
    <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[#0a0a12]">
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
   Score Card Preview
   ──────────────────────────────────────── */
function ScoreCardPreview() {
  const cats = [
    { label: "Structure", score: 80 },
    { label: "Clarity", score: 90 },
    { label: "Completeness", score: 85 },
    { label: "Security", score: 95 },
    { label: "Consistency", score: 75 },
  ];

  return (
    <motion.div
      className="w-full max-w-[340px] mx-auto"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border border-[var(--border)]">
        <div className="flex items-center gap-2 mb-6 text-[var(--text-secondary)] text-sm">
          <Search className="w-4 h-4" />
          <span>AgentLinter Score</span>
        </div>

        <div className="text-center mb-6">
          <span className="text-6xl font-bold text-white">87</span>
          <span className="text-[var(--text-dim)] text-lg ml-1">/100</span>
        </div>

        <div className="space-y-3 mb-6">
          {cats.map((c) => (
            <div key={c.label} className="flex items-center gap-3">
              <span className="text-[12px] text-[var(--text-secondary)] w-[90px] text-right mono">
                {c.label}
              </span>
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--accent)] rounded-full"
                  style={{ width: `${c.score}%`, opacity: 0.7 + (c.score / 400) }}
                />
              </div>
              <span className="text-[12px] text-[var(--text-secondary)] w-6 mono">
                {c.score}
              </span>
            </div>
          ))}
        </div>

        <div className="text-center text-sm text-[var(--amber)]">
          <Trophy className="w-3.5 h-3.5 inline mr-1.5" />
          Top 12% of all agents
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <button className="flex items-center gap-2 px-5 py-2 rounded-full border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:text-white hover:border-[var(--border-hover)] transition-colors">
          <Share2 className="w-3.5 h-3.5" />
          Share on X
        </button>
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
          <span className="font-semibold text-[15px] tracking-tight">
            AgentLinter
          </span>
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
      <section className="pt-[200px] sm:pt-[180px] pb-20 sm:pb-28 px-7 sm:px-8">
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
              Sharpen your
              <br />
              <span className="text-[var(--accent)]">agent&apos;s edge.</span>
            </h1>

            <p className="text-[15px] sm:text-[17px] text-[var(--text-secondary)] leading-[1.7] mb-10 max-w-[480px]">
              Score, diagnose, and auto-fix your CLAUDE.md and agent workspace
              files. One command to make your AI agent dramatically better.
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
                <Star className="w-3.5 h-3.5" />
                Star on GitHub
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
              Everything your agent needs
            </h2>
            <p className="text-[var(--text-secondary)] text-[15px]">
              From basic scoring to self-evolving intelligence.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: BarChart3,
                title: "Multi-dimensional Score",
                desc: "5 categories: Structure, Clarity, Completeness, Security, Consistency.",
              },
              {
                icon: Zap,
                title: "Auto-fix",
                desc: "Run --fix to automatically apply best practices to your files.",
              },
              {
                icon: Shield,
                title: "Secret Scan",
                desc: "Detect API keys, tokens, and passwords before they leak.",
              },
              {
                icon: FileText,
                title: "Cross-file Consistency",
                desc: "Catch contradictions between SOUL.md, CLAUDE.md, TOOLS.md.",
              },
              {
                icon: Terminal,
                title: "Templates",
                desc: "Bootstrap with agentlinter init — personal, coding, team, or chatbot.",
              },
              {
                icon: Lock,
                title: "Custom Rules",
                desc: "Define team rules in .agentlinterrc. Enforce your standards.",
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

      {/* ── Share ── */}
      <section className="py-20 sm:py-28 px-7 sm:px-8 border-t border-[var(--border)]">
        <div className="max-w-[920px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <div>
              <h2 className="text-[24px] sm:text-[32px] font-bold tracking-tight mb-4">
                Score it. Share it.
              </h2>
              <p className="text-[var(--text-secondary)] text-[15px] leading-[1.7] mb-8">
                Every lint generates a shareable Score Card. One click to post
                on X. Watch your friends try to beat your score.
              </p>
              <div className="space-y-3">
                {[
                  "Auto-generated Score Card image",
                  "One-click share to X",
                  "Percentile ranking — Top 12%",
                  "Progress tracking — 72 → 89 (+17 pts)",
                  "Badges: Security Master 🛡️, Perfect Score 💯",
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

            <ScoreCardPreview />
          </div>
        </div>
      </section>

      {/* ── Self-Evolving ── */}
      <section className="py-20 sm:py-28 px-7 sm:px-8 border-t border-[var(--border)]">
        <div className="max-w-[920px] mx-auto">
          <div className="mb-14">
            <h2 className="text-[24px] sm:text-[32px] font-bold tracking-tight mb-3">
              Gets smarter with every lint
            </h2>
            <p className="text-[var(--text-secondary)] text-[15px] max-w-[520px] leading-[1.7]">
              Anonymized usage patterns feed back into the rule engine. Common
              failures become new rules. Rejected fixes get replaced.
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
            Get started in 10 seconds
          </h2>

          <div className="space-y-4">
            {[
              { step: "1", label: "Score your agent", cmd: "npx agentlinter score ." },
              { step: "2", label: "Auto-fix issues", cmd: "npx agentlinter fix --auto" },
              { step: "3", label: "Share your score", cmd: "npx agentlinter share" },
            ].map((item) => (
              <div
                key={item.step}
                className="flex items-center gap-4 p-4 sm:p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-dim)] flex items-center justify-center shrink-0">
                  <span className="text-[var(--accent)] text-[13px] font-semibold mono">
                    {item.step}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] text-[var(--text-dim)] mb-0.5">
                    {item.label}
                  </div>
                  <code className="text-[var(--accent)] text-[13px]">
                    {item.cmd}
                  </code>
                </div>
              </div>
            ))}
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
            <span className="font-semibold">AgentLinter</span>
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
