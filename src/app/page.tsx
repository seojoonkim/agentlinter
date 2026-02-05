"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Zap,
  Shield,
  Share2,
  Terminal,
  ChevronRight,
  ArrowRight,
  Check,
  X,
  AlertTriangle,
  Github,
  Twitter,
  Star,
  TrendingUp,
  BarChart3,
  Lock,
  FileText,
  Sparkles,
  Trophy,
  Users,
  RefreshCw,
} from "lucide-react";

/* ─── Score Bar Component ─── */
function ScoreBar({
  label,
  score,
  delay = 0,
}: {
  label: string;
  score: number;
  delay?: number;
}) {
  const color =
    score >= 90
      ? "bg-emerald-500"
      : score >= 70
        ? "bg-indigo-500"
        : score >= 50
          ? "bg-amber-500"
          : "bg-red-500";

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-400 w-28 text-right font-mono">
        {label}
      </span>
      <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${score}%` }}
          transition={{ duration: 1, delay, ease: "easeOut" }}
          viewport={{ once: true }}
        />
      </div>
      <span className="text-sm font-mono text-slate-300 w-8">{score}</span>
    </div>
  );
}

/* ─── Animated Terminal ─── */
function AnimatedTerminal() {
  const [lines, setLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);

  const terminalLines = [
    { text: "$ npx agentlinter score .", type: "command" },
    { text: "", type: "blank" },
    { text: "🔍 AgentLinter v1.0.0", type: "header" },
    { text: "📁 Scanning workspace: ./.claude/", type: "info" },
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
    {
      text: "  ERROR  CLAUDE.md:14 — Secret detected: API key (sk-...)",
      type: "error",
    },
    {
      text: "  ERROR  TOOLS.md missing — Referenced but not found",
      type: "error",
    },
    {
      text: "  WARN   No persona defined — Add SOUL.md",
      type: "warn",
    },
    {
      text: "  WARN   Vague instruction: \"be helpful\" → Be specific",
      type: "warn",
    },
    { text: "", type: "blank" },
    {
      text: "💡 Run `agentlinter fix --auto` to fix 4 issues",
      type: "success",
    },
  ];

  useEffect(() => {
    if (currentLine >= terminalLines.length) return;
    const timer = setTimeout(
      () => {
        setLines((prev) => [...prev, terminalLines[currentLine].text]);
        setCurrentLine((prev) => prev + 1);
      },
      currentLine === 0 ? 800 : terminalLines[currentLine].type === "blank" ? 100 : 150
    );
    return () => clearTimeout(timer);
  }, [currentLine]);

  const getLineColor = (index: number) => {
    const type = terminalLines[index]?.type;
    switch (type) {
      case "command":
        return "text-emerald-400";
      case "header":
        return "text-indigo-400 font-bold";
      case "info":
        return "text-slate-400";
      case "score":
        return "text-white font-bold";
      case "detail":
        return "text-slate-300";
      case "warning":
        return "text-amber-400";
      case "error":
        return "text-red-400";
      case "warn":
        return "text-amber-300";
      case "success":
        return "text-emerald-400";
      default:
        return "text-slate-400";
    }
  };

  return (
    <div className="bg-[#0d1117] rounded-xl border border-slate-700/50 overflow-hidden shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-3 bg-[#161b22] border-b border-slate-700/50">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-amber-500/80" />
        <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
        <span className="ml-2 text-xs text-slate-500 font-mono">
          terminal
        </span>
      </div>
      <div className="p-5 font-mono text-sm leading-6 min-h-[420px]">
        {lines.map((line, i) => (
          <div key={i} className={getLineColor(i)}>
            {line || "\u00A0"}
          </div>
        ))}
        {currentLine < terminalLines.length && (
          <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse" />
        )}
      </div>
    </div>
  );
}

/* ─── Feature Card ─── */
function FeatureCard({
  icon: Icon,
  title,
  description,
  tag,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  tag?: string;
}) {
  return (
    <motion.div
      className="relative p-6 rounded-xl bg-[var(--al-bg-card)] border border-[var(--al-border)] hover:border-indigo-500/30 transition-all duration-300 group"
      whileHover={{ y: -2 }}
    >
      {tag && (
        <span className="absolute top-4 right-4 text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          {tag}
        </span>
      )}
      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
        <Icon className="w-5 h-5 text-indigo-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}

/* ─── Score Card Preview ─── */
function ScoreCardPreview() {
  return (
    <motion.div
      className="relative max-w-sm mx-auto"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-white/80" />
          <span className="text-white/80 font-semibold text-sm">
            AgentLinter Score
          </span>
        </div>

        <div className="text-center mb-5">
          <div className="text-6xl font-extrabold text-white mb-1">87</div>
          <div className="text-white/60 text-sm">/100</div>
        </div>

        <div className="space-y-2.5 mb-5">
          {[
            { label: "Structure", score: 80 },
            { label: "Clarity", score: 90 },
            { label: "Completeness", score: 85 },
            { label: "Security", score: 95 },
            { label: "Consistency", score: 75 },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="text-xs text-white/60 w-24 text-right">
                {item.label}
              </span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/80 rounded-full"
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <span className="text-xs text-white/80 w-6 font-mono">
                {item.score}
              </span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 text-sm text-amber-300">
            <Trophy className="w-4 h-4" />
            <span>Top 12% of all agents</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 text-center">
          <span className="text-white/40 text-xs">agentlinter.com</span>
        </div>
      </div>

      {/* Share button overlay */}
      <motion.div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <button className="flex items-center gap-2 px-5 py-2.5 bg-black rounded-full border border-slate-600 text-sm font-medium hover:border-indigo-500 transition-colors">
          <Twitter className="w-4 h-4" />
          Share on X
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ─── Flywheel Diagram ─── */
function FlywheelDiagram() {
  const steps = [
    { icon: Search, label: "Lint & Score", color: "text-indigo-400" },
    { icon: Share2, label: "Share Score", color: "text-cyan-400" },
    { icon: Users, label: "More Users", color: "text-emerald-400" },
    { icon: TrendingUp, label: "Better Data", color: "text-amber-400" },
    { icon: RefreshCw, label: "Smarter Rules", color: "text-purple-400" },
  ];

  return (
    <div className="relative flex items-center justify-center gap-4 flex-wrap">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-3">
          <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            viewport={{ once: true }}
          >
            <div className="w-14 h-14 rounded-xl bg-[var(--al-bg-card)] border border-[var(--al-border)] flex items-center justify-center">
              <step.icon className={`w-6 h-6 ${step.color}`} />
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {step.label}
            </span>
          </motion.div>
          {i < steps.length - 1 && (
            <ChevronRight className="w-4 h-4 text-slate-600 mt-[-20px]" />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Main Page ─── */
export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-[var(--al-bg)]/80 border-b border-[var(--al-border)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Search className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-lg">AgentLinter</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/seojoonkim/agentlinter"
              target="_blank"
              className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <a
              href="#get-started"
              className="text-sm px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors font-medium"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              ESLint for AI Agents
            </div>
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6">
              Sharpen your
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                agent&apos;s edge.
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              Score, diagnose, and auto-fix your CLAUDE.md and agent workspace
              files. One command to make your AI agent dramatically better.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <a
                href="#get-started"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all font-semibold text-lg shadow-lg shadow-indigo-500/20"
              >
                <Terminal className="w-5 h-5" />
                npx agentlinter
              </a>
              <a
                href="https://github.com/seojoonkim/agentlinter"
                target="_blank"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 hover:border-slate-500 transition-all font-medium text-slate-300"
              >
                <Star className="w-4 h-4" />
                Star on GitHub
              </a>
            </div>
          </motion.div>

          {/* Terminal Demo */}
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <AnimatedTerminal />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6" id="features">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything your agent needs
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              From basic scoring to self-evolving intelligence — AgentLinter
              covers the full lifecycle.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={BarChart3}
              title="Multi-dimensional Score"
              description="5 categories: Structure, Clarity, Completeness, Security, Consistency. Not just a single number."
              tag="Core"
            />
            <FeatureCard
              icon={Zap}
              title="Auto-fix"
              description="Run --fix to automatically apply best practices. Accept, reject, or customize each suggestion."
              tag="Core"
            />
            <FeatureCard
              icon={Shield}
              title="Secret Scan"
              description="Detect API keys, tokens, and passwords leaked in your agent files. Before they reach production."
              tag="Security"
            />
            <FeatureCard
              icon={FileText}
              title="Cross-file Consistency"
              description="Catch contradictions between SOUL.md, CLAUDE.md, and TOOLS.md. Keep your agent coherent."
            />
            <FeatureCard
              icon={Terminal}
              title="Templates"
              description="Bootstrap with agentlinter init — choose from personal, coding, team, or chatbot templates."
            />
            <FeatureCard
              icon={Lock}
              title="Custom Rules"
              description="Define team-specific rules in .agentlinterrc. Enforce your standards across all projects."
            />
          </div>
        </div>
      </section>

      {/* Viral Loop Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Score it.
                <br />
                <span className="text-indigo-400">Share it.</span>
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Every lint result generates a shareable Score Card. One click to
                post on X. Watch your friends try to beat your score.
              </p>
              <div className="space-y-4">
                {[
                  "Auto-generated Score Card image",
                  "One-click share to X / Twitter",
                  "Percentile ranking (Top 12%)",
                  "Progress tracking (72 → 89, +17 points!)",
                  "Badges: Security Master 🛡️, Perfect Score 💯",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-indigo-400" />
                    </div>
                    <span className="text-sm text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <ScoreCardPreview />
          </div>
        </div>
      </section>

      {/* Self-Evolving Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              The platform gets{" "}
              <span className="text-emerald-400">smarter</span> with every
              lint.
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-12">
              Anonymized usage patterns feed back into the rule engine. Common
              failures become new rules. Rejected fixes get replaced. Templates
              evolve.
            </p>
          </motion.div>

          <FlywheelDiagram />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
            {[
              {
                title: "Rule Tuning",
                desc: "Weights auto-adjust based on which warnings users fix immediately",
                level: "L1 — Auto",
              },
              {
                title: "Rule Discovery",
                desc: "Patterns found in top-scoring agents become new rule candidates",
                level: "L2 — Semi-auto",
              },
              {
                title: "Fix Evolution",
                desc: "Low-acceptance fixes get A/B tested and replaced with better ones",
                level: "L3 — Auto",
              },
              {
                title: "Template Evolution",
                desc: "Templates update based on what files users consistently add",
                level: "L4 — Semi-auto",
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                className="p-5 rounded-xl bg-[var(--al-bg-card)] border border-[var(--al-border)] text-left"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {item.level}
                </span>
                <h3 className="font-semibold mt-3 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <p className="text-xs text-slate-500 mt-8">
            All data is anonymized. Opt-out anytime with{" "}
            <code className="text-slate-400">--no-telemetry</code>.
          </p>
        </div>
      </section>

      {/* Get Started */}
      <section className="py-20 px-6" id="get-started">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Get started in 10 seconds
            </h2>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                step: "1",
                title: "Score your agent",
                code: "npx agentlinter score .",
              },
              {
                step: "2",
                title: "Auto-fix issues",
                code: "npx agentlinter fix --auto",
              },
              {
                step: "3",
                title: "Share your score",
                code: "npx agentlinter share",
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                className="flex items-center gap-5 p-5 rounded-xl bg-[var(--al-bg-card)] border border-[var(--al-border)]"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-400 font-bold">{item.step}</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-slate-400 mb-1">{item.title}</div>
                  <code className="text-indigo-300 font-mono text-sm">
                    {item.code}
                  </code>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600" />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-slate-500 text-sm">
              Works with Claude Code, Clawdbot, Cursor, Windsurf, and any
              AI agent workspace.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[var(--al-border)]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold">AgentLinter</span>
            <span className="text-slate-500 text-sm">
              by{" "}
              <a
                href="https://twitter.com/simonkim_nft"
                target="_blank"
                className="text-slate-400 hover:text-white transition-colors"
              >
                @simonkim_nft
              </a>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a
              href="https://github.com/seojoonkim/agentlinter"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Docs
            </a>
            <a href="#" className="hover:text-white transition-colors">
              ClawdHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
