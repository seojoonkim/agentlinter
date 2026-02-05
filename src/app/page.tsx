"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Search,
  Terminal,
  ArrowRight,
  Github,
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
  ExternalLink,
  Minus,
  CircleCheck,
  CircleMinus,
  Quote,
  Copy,
  CheckCheck,
  ArrowUpRight,
  AlertTriangle,
  Eye,
  Layers,
  GitBranch,
} from "lucide-react";

/* ════════════════════════════════════════
   Logo
   ════════════════════════════════════════ */
function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
      <path d="M9 10.5L16 7L23 10.5V17L16 25L9 17V10.5Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <path d="M12 13L16 11L20 13V17L16 21L12 17V13Z" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="1" strokeLinejoin="round" />
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

/* ════════════════════════════════════════
   Animated Counter
   ════════════════════════════════════════ */
function Counter({ target, suffix = "", duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ════════════════════════════════════════
   Copy Command Button
   ════════════════════════════════════════ */
function CopyCommand({ command, className = "" }: { command: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(command); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className={`group relative inline-flex items-center gap-3 ${className}`}
    >
      <span className="mono text-[var(--accent-bright)]">{command}</span>
      {copied ? (
        <CheckCheck className="w-4 h-4 text-[var(--green)]" />
      ) : (
        <Copy className="w-4 h-4 text-[var(--text-dim)] group-hover:text-[var(--text-secondary)] transition-colors" />
      )}
    </button>
  );
}

/* ════════════════════════════════════════
   Animated Terminal (improved)
   ════════════════════════════════════════ */
function AnimatedTerminal() {
  const [lines, setLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const terminalLines = [
    { text: "$ npx agentlinter", type: "command" },
    { text: "", type: "blank" },
    { text: "🔍 AgentLinter v1.0.0", type: "header" },
    { text: "📁 Scanning workspace: .claude/ + root", type: "info" },
    { text: "   Found 5 files: CLAUDE.md, SOUL.md, USER.md, TOOLS.md, SECURITY.md", type: "info" },
    { text: "", type: "blank" },
    { text: "  Workspace Score ........ 72/100  (B)", type: "score" },
    { text: "  ├─ Structure     ████████░░  80", type: "detail" },
    { text: "  ├─ Clarity       ███████░░░  70", type: "detail" },
    { text: "  ├─ Completeness  ██████░░░░  60", type: "detail" },
    { text: "  ├─ Security      █████████░  90", type: "detail" },
    { text: "  └─ Consistency   ██████░░░░  60", type: "detail" },
    { text: "", type: "blank" },
    { text: "  2 errors · 3 warnings", type: "warning" },
    { text: "", type: "blank" },
    { text: '  ERR  TOOLS.md:14 — Secret: API key pattern "sk-proj-..."', type: "error" },
    { text: "  ERR  SOUL.md ↔ CLAUDE.md — Conflicting persona definition", type: "error" },
    { text: '  WARN CLAUDE.md:28 — Vague: "be helpful" → be specific', type: "warn" },
    { text: "  WARN No error recovery strategy defined", type: "warn" },
    { text: "  WARN 2 cross-file references broken", type: "warn" },
    { text: "", type: "blank" },
    { text: "  💡 3 auto-fixable. Run: npx agentlinter --fix", type: "success" },
    { text: "  📊 Report → agentlinter.com/r/a3f8k2", type: "success" },
  ];

  useEffect(() => {
    if (!inView || currentLine >= terminalLines.length) return;
    const timer = setTimeout(() => {
      setLines((prev) => [...prev, terminalLines[currentLine].text]);
      setCurrentLine((prev) => prev + 1);
    }, currentLine === 0 ? 500 : terminalLines[currentLine].type === "blank" ? 60 : 90);
    return () => clearTimeout(timer);
  }, [inView, currentLine]);

  const getColor = (i: number) => {
    const t = terminalLines[i]?.type;
    if (t === "command") return "text-[var(--accent-bright)]";
    if (t === "header") return "text-white font-medium";
    if (t === "score") return "text-white font-medium";
    if (t === "error") return "text-[var(--red)]";
    if (t === "warn") return "text-[var(--amber)]";
    if (t === "warning") return "text-[var(--amber)]";
    if (t === "success") return "text-[var(--teal)]";
    return "text-[var(--text-dim)]";
  };

  return (
    <div ref={ref} className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[#08080e] glow-accent">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[var(--border)] bg-white/[0.02]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-[11px] text-[var(--text-dim)] mono">~/my-agent</span>
      </div>
      <div className="p-6 sm:p-8 mono text-[11.5px] sm:text-[12.5px] leading-[1.9] min-h-[380px] sm:min-h-[420px] overflow-x-auto">
        {lines.map((line, i) => (
          <div key={i} className={getColor(i)}>{line || "\u00A0"}</div>
        ))}
        {currentLine < terminalLines.length && (
          <span className="inline-block w-1.5 h-3.5 bg-[var(--accent)] animate-pulse" />
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   Score Card Preview (improved)
   ════════════════════════════════════════ */
function ScoreCardPreview() {
  const cats = [
    { label: "Structure", score: 80, color: "#60a5fa" },
    { label: "Clarity", score: 90, color: "#a78bfa" },
    { label: "Completeness", score: 85, color: "#818cf8" },
    { label: "Security", score: 95, color: "#34d399" },
    { label: "Consistency", score: 75, color: "#fbbf24" },
  ];

  return (
    <motion.div
      className="w-full max-w-[400px]"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[#08080e] glow-accent">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--border)] bg-white/[0.02]">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
            <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
            <div className="w-2 h-2 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 mx-2">
            <div className="bg-white/[0.04] rounded-md px-3 py-1 text-[10px] text-[var(--text-dim)] mono text-center">
              agentlinter.com/r/a3f8k2
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-7 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo size={16} />
              <span className="text-[12px] text-[var(--text-dim)]">Score Report</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg text-[13px] font-bold mono text-[var(--accent)] bg-[var(--accent-dim)]">
              A
            </div>
          </div>

          <div className="flex items-end gap-4">
            <span className="text-[48px] font-bold text-white leading-none glow-text">87</span>
            <div className="pb-2">
              <div className="text-[11px] mono text-[var(--accent)]">Top 12%</div>
              <div className="text-[10px] text-[var(--text-dim)]">of all agents</div>
            </div>
          </div>

          <div className="space-y-2.5">
            {cats.map((c) => (
              <div key={c.label} className="flex items-center gap-3">
                <span className="text-[10px] text-[var(--text-secondary)] w-[76px] text-right mono">{c.label}</span>
                <div className="flex-1 h-[3px] bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${c.score}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                    style={{ backgroundColor: c.color, opacity: 0.8 }}
                  />
                </div>
                <span className="text-[10px] w-5 mono" style={{ color: c.color }}>{c.score}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[var(--border)]">
            <div className="text-[10px] text-[var(--text-dim)] mono mb-2">Top issues</div>
            <div className="space-y-1.5">
              {[
                { type: "ERR", text: "Rotate exposed API key", color: "var(--red)" },
                { type: "WARN", text: "Add error recovery strategy", color: "var(--amber)" },
                { type: "FIX", text: "3 issues auto-fixable", color: "var(--green)" },
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[9px] mono px-1 rounded" style={{ color: p.color, backgroundColor: `${p.color}15` }}>{p.type}</span>
                  <span className="text-[11px] text-[var(--text-secondary)]">{p.text}</span>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium bg-[var(--accent-dim)] text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-all">
            <Share2 className="w-3.5 h-3.5" />
            Share on X
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════
   Section Fade-in
   ════════════════════════════════════════ */
function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <div className="min-h-screen noise">
      {/* ── Nav ── */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-2xl bg-[var(--bg)]/80 border-b border-[var(--border)] px-6 sm:px-8" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="max-w-[1000px] mx-auto h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={22} />
            <span className="font-semibold text-[15px] tracking-tight">AgentLinter</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#why" className="text-[13px] text-[var(--text-dim)] hover:text-[var(--text-secondary)] transition-colors hidden sm:inline">Why</a>
            <a href="#how" className="text-[13px] text-[var(--text-dim)] hover:text-[var(--text-secondary)] transition-colors hidden sm:inline">How</a>
            <a href="#compare" className="text-[13px] text-[var(--text-dim)] hover:text-[var(--text-secondary)] transition-colors hidden sm:inline">Compare</a>
            <a href="https://github.com/seojoonkim/agentlinter" target="_blank" className="text-[13px] text-[var(--text-secondary)] hover:text-white transition-colors flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a href="#start" className="text-[13px] px-4 py-1.5 rounded-lg bg-[var(--accent)] text-black font-semibold hover:brightness-110 transition-all">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════
         HERO
         ══════════════════════════════════════ */}
      <section className="pt-[120px] sm:pt-[140px] pb-8 sm:pb-12 px-6 sm:px-8">
        <div className="max-w-[1000px] mx-auto">
          <motion.div className="max-w-[700px]" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--teal-dim)] text-[var(--teal)] text-[12px] mono mb-7">
              <Sparkles className="w-3 h-3" />
              Free &amp; Open Source
            </div>

            <h1 className="display text-[40px] sm:text-[56px] lg:text-[72px] leading-[1.05] tracking-tight mb-7">
              How sharp is
              <br />
              <span className="text-[var(--accent)] glow-text">your agent?</span>
            </h1>

            <p className="text-[16px] sm:text-[18px] text-[var(--text-secondary)] leading-[1.7] mb-10 max-w-[520px]">
              One command scans your entire agent workspace — every config file,
              every rule, every cross-reference — and tells you exactly what to fix.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="inline-flex items-center gap-3 px-5 py-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all">
                <Terminal className="w-4 h-4 text-[var(--text-dim)]" />
                <CopyCommand command="npx agentlinter" className="text-[15px]" />
              </div>
              <a href="https://github.com/seojoonkim/agentlinter" target="_blank"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] text-[14px] hover:text-white hover:border-[var(--border-hover)] transition-all">
                <Github className="w-4 h-4" />
                View Source
              </a>
            </div>

            <p className="text-[12px] text-[var(--text-dim)] mono">
              Free &amp; open source · No config needed · Runs in seconds
            </p>
          </motion.div>

          {/* Terminal */}
          <motion.div className="mt-14 sm:mt-20" initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
            <AnimatedTerminal />
          </motion.div>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <section className="py-10 sm:py-14 px-6 sm:px-8 border-t border-[var(--border)]">
        <div className="max-w-[1000px] mx-auto">
          <p className="text-center text-[11px] sm:text-[12px] text-[var(--text-dim)] mono mb-6 tracking-wider uppercase">
            Built on open standards
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {[
              { label: "Anthropic CLAUDE.md", href: "https://code.claude.com/docs/en/memory" },
              { label: "Agent Skills Standard", href: "https://agentskills.io" },
              { label: "Claude Code", href: "https://github.com/anthropics/claude-code" },
              { label: "Clawdbot", href: "https://docs.clawd.bot" },
              { label: "Cursor", href: "https://cursor.sh" },
              { label: "Windsurf", href: "https://codeium.com/windsurf" },
            ].map((item) => (
              <a key={item.label} href={item.href} target="_blank"
                className="text-[12px] sm:text-[13px] text-[var(--text-dim)] hover:text-[var(--text-secondary)] transition-colors flex items-center gap-1">
                {item.label}
                <ArrowUpRight className="w-3 h-3 opacity-40" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
         WHY IT MATTERS
         ══════════════════════════════════════ */}
      <section id="why" className="py-24 sm:py-32 px-6 sm:px-8 border-t border-[var(--border)]">
        <div className="max-w-[1000px] mx-auto">
          <FadeIn>
            <p className="text-[12px] mono text-[var(--accent)] mb-4 tracking-wider uppercase">Why this matters</p>
            <h2 className="display text-[28px] sm:text-[40px] lg:text-[48px] leading-[1.1] tracking-tight mb-6 max-w-[700px]">
              Your agent config is code.
              <br />
              <span className="text-[var(--text-secondary)]">Treat it like code.</span>
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="text-[15px] sm:text-[16px] text-[var(--text-secondary)] leading-[1.8] mb-16 max-w-[580px]">
              A single CLAUDE.md file can dramatically change how your agent performs.
              Vague instructions produce vague results. Leaked secrets become vulnerabilities.
              Contradictions across files cause unpredictable behavior.
            </p>
          </FadeIn>

          {/* Anthropic quote */}
          <FadeIn delay={0.15}>
            <div className="mb-16 p-6 sm:p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] max-w-[640px]">
              <Quote className="w-5 h-5 text-[var(--accent)] mb-4 opacity-50" />
              <p className="text-[15px] sm:text-[16px] text-[var(--text)] leading-[1.8] mb-4 italic">
                &ldquo;Be specific: &lsquo;Use 2-space indentation&rsquo; is better than &lsquo;Format code properly.&rsquo;&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--accent-dim)] flex items-center justify-center text-[11px] font-bold text-[var(--accent)]">A</div>
                <div>
                  <div className="text-[13px] text-[var(--text)]">Anthropic</div>
                  <a href="https://code.claude.com/docs/en/memory" target="_blank" className="text-[11px] text-[var(--accent)] hover:underline flex items-center gap-1">
                    CLAUDE.md Best Practices <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* The three problems */}
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: AlertTriangle,
                title: "Vague instructions fail silently",
                desc: "\"Be helpful\" gives your agent nothing to work with. Ambiguous pronouns, missing priorities, and naked conditionals degrade output quality without any error message.",
                stat: "40%",
                statLabel: "of agent configs score below 60 on Clarity",
              },
              {
                icon: Shield,
                title: "Secrets hide in plain text",
                desc: "API keys, tokens, and passwords end up in CLAUDE.md files that get committed to repos. Standard .gitignore doesn't catch secrets embedded in markdown.",
                stat: "1 in 5",
                statLabel: "workspaces have exposed credentials",
              },
              {
                icon: GitBranch,
                title: "Multi-file configs drift",
                desc: "SOUL.md defines one persona, CLAUDE.md another. TOOLS.md references files that don't exist. As your workspace grows, contradictions multiply.",
                stat: "3.2×",
                statLabel: "more contradictions in 5+ file workspaces",
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={0.1 * i}>
                <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all h-full">
                  <item.icon className="w-5 h-5 text-[var(--text-dim)] mb-5" />
                  <h3 className="font-semibold text-[15px] mb-3 leading-tight">{item.title}</h3>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-[1.7] mb-5">{item.desc}</p>
                  <div className="pt-4 border-t border-[var(--border)]">
                    <span className="text-[22px] font-bold text-[var(--teal)]">{item.stat}</span>
                    <p className="text-[11px] text-[var(--text-dim)] mt-1">{item.statLabel}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
         HOW IT WORKS
         ══════════════════════════════════════ */}
      <section id="how" className="py-24 sm:py-32 px-6 sm:px-8 border-t border-[var(--border)]">
        <div className="max-w-[1000px] mx-auto">
          <FadeIn>
            <p className="text-[12px] mono text-[var(--teal)] mb-4 tracking-wider uppercase">How it works</p>
            <h2 className="display text-[28px] sm:text-[40px] lg:text-[48px] leading-[1.1] tracking-tight mb-6">
              One command. Full diagnosis.
            </h2>
            <p className="text-[15px] text-[var(--text-secondary)] leading-[1.7] mb-16 max-w-[520px]">
              No setup. No config files. Point it at your workspace and get an instant, actionable report.
            </p>
          </FadeIn>

          {/* 3-step flow */}
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: Search,
                title: "Scan",
                desc: "Discovers every .md file in your workspace — CLAUDE.md, SOUL.md, USER.md, TOOLS.md, rules/, skills/. Parses structure, references, and content.",
                detail: "Supports Claude Code, Clawdbot, Cursor, Windsurf, and any Agent Skills–compatible workspace.",
              },
              {
                step: "02",
                icon: BarChart3,
                title: "Score",
                desc: "Evaluates across five dimensions: structure, clarity, completeness, security, and cross-file consistency. Each scored 0–100.",
                detail: "Rules based on Anthropic's official best practices plus community-contributed patterns from real agent workspaces.",
              },
              {
                step: "03",
                icon: Zap,
                title: "Fix",
                desc: "Every issue comes with a prescription. Most are auto-fixable with --fix. Secrets get flagged for rotation. Contradictions get resolved.",
                detail: "Run npx agentlinter --fix to apply all safe fixes in one pass. Review and approve each change.",
              },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={0.1 * i}>
                <div className="p-6 sm:p-7 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all h-full group">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[11px] mono text-[var(--teal)] bg-[var(--teal-dim)] px-2.5 py-1 rounded-lg">{item.step}</span>
                    <item.icon className="w-5 h-5 text-[var(--text-dim)] group-hover:text-[var(--teal)] transition-colors" />
                  </div>
                  <h3 className="text-[18px] font-semibold mb-3">{item.title}</h3>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-[1.7] mb-4">{item.desc}</p>
                  <p className="text-[12px] text-[var(--text-dim)] leading-[1.6]">{item.detail}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
         FIVE DIMENSIONS (technical depth)
         ══════════════════════════════════════ */}
      <section className="py-24 sm:py-32 px-6 sm:px-8 border-t border-[var(--border)]">
        <div className="max-w-[1000px] mx-auto">
          <FadeIn>
            <p className="text-[12px] mono text-[var(--accent)] mb-4 tracking-wider uppercase">Scoring Engine</p>
            <h2 className="display text-[28px] sm:text-[40px] lg:text-[48px] leading-[1.1] tracking-tight mb-6">
              Five dimensions. Real rules.
            </h2>
            <p className="text-[15px] text-[var(--text-secondary)] leading-[1.7] mb-16 max-w-[560px]">
              Not a vibe check. Every score is backed by specific, documented rules
              derived from Anthropic&apos;s guidelines, security best practices, and
              patterns from high-performing agent workspaces.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Structure",
                weight: "20%",
                icon: Layers,
                rules: ["File organization & naming conventions", "Section separation & hierarchy", "Required files present (CLAUDE.md, etc.)", "Consistent frontmatter format"],
                example: 'ERR  Missing TOOLS.md — referenced in CLAUDE.md:12',
              },
              {
                title: "Clarity",
                weight: "25%",
                icon: Eye,
                rules: ["Naked conditionals without criteria", "Compound instructions (too many per line)", "Ambiguous pronouns & vague language", "Missing priority signals (P0/P1/P2)"],
                example: 'WARN "be helpful" → specify: response length, tone, format',
              },
              {
                title: "Completeness",
                weight: "20%",
                icon: FileText,
                rules: ["Identity / persona defined", "Tool documentation present", "Boundaries & constraints set", "Memory & handoff strategy"],
                example: 'WARN No error recovery workflow — add escalation path',
              },
              {
                title: "Security",
                weight: "20%",
                icon: Shield,
                rules: ["API key / token / password detection", "Injection defense instructions", "Permission boundaries defined", "Sensitive data handling rules"],
                example: 'ERR  Secret: API key pattern "sk-proj-..." in TOOLS.md:14',
              },
              {
                title: "Consistency",
                weight: "15%",
                icon: GitBranch,
                rules: ["Cross-file reference integrity", "Persona alignment (SOUL ↔ CLAUDE)", "Permission conflict detection", "Language mixing patterns (ko/en)"],
                example: 'ERR  SOUL.md persona ≠ CLAUDE.md persona — reconcile',
              },
              {
                title: "Custom Rules",
                weight: "∞",
                icon: Lock,
                rules: ["Team conventions via .agentlinterrc", "Enforce naming, structure, tone", "CI/CD integration ready", "Shared across your organization"],
                example: '.agentlinterrc: { "require": ["SECURITY.md"] }',
              },
            ].map((dim, i) => (
              <FadeIn key={dim.title} delay={0.05 * i}>
                <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <dim.icon className="w-4 h-4 text-[var(--text-dim)]" />
                      <h3 className="font-semibold text-[15px]">{dim.title}</h3>
                    </div>
                    <span className="text-[11px] mono text-[var(--text-dim)] bg-white/[0.03] px-2 py-0.5 rounded-md">{dim.weight}</span>
                  </div>
                  <ul className="space-y-1.5 mb-4 flex-1">
                    {dim.rules.map((rule) => (
                      <li key={rule} className="flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-[var(--text-dim)] mt-2 shrink-0" />
                        <span className="text-[12px] text-[var(--text-secondary)] leading-[1.5]">{rule}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-3 border-t border-[var(--border)]">
                    <code className="text-[10.5px] text-[var(--text-dim)] mono leading-[1.6] break-all">{dim.example}</code>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
         VS ANTHROPIC OFFICIAL
         ══════════════════════════════════════ */}
      <section id="compare" className="py-24 sm:py-32 px-6 sm:px-8 border-t border-[var(--border)]">
        <div className="max-w-[1000px] mx-auto">
          <FadeIn>
            <p className="text-[12px] mono text-[var(--teal)] mb-4 tracking-wider uppercase">How we&apos;re different</p>
            <h2 className="display text-[28px] sm:text-[40px] lg:text-[48px] leading-[1.1] tracking-tight mb-4 max-w-[700px]">
              Anthropic built the foundation.
              <br />
              <span className="text-[var(--accent)]">We built the linter.</span>
            </h2>
            <p className="text-[15px] text-[var(--text-secondary)] leading-[1.7] mb-14 max-w-[600px]">
              Anthropic&apos;s Claude Code provides{" "}
              <a href="https://code.claude.com/docs/en/memory" target="_blank" className="text-[var(--accent)] hover:underline">CLAUDE.md memory</a>
              {" "}and{" "}
              <a href="https://code.claude.com/docs/en/skills" target="_blank" className="text-[var(--accent)] hover:underline">skills</a>
              {" "}— the building blocks. AgentLinter analyzes whether you&apos;re using them effectively.
            </p>
          </FadeIn>

          {/* Comparison table */}
          <FadeIn delay={0.1}>
            <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
              <div className="grid grid-cols-3 bg-white/[0.02]">
                <div className="p-4 sm:p-5 border-r border-[var(--border)]">
                  <span className="text-[12px] text-[var(--text-dim)] mono">Feature</span>
                </div>
                <div className="p-4 sm:p-5 border-r border-[var(--border)] text-center">
                  <div className="text-[13px] text-[var(--text-secondary)]">Claude Code</div>
                  <div className="text-[10px] text-[var(--text-dim)] mono mt-0.5">Anthropic Official</div>
                </div>
                <div className="p-4 sm:p-5 text-center">
                  <div className="text-[13px] font-semibold text-[var(--accent)]">AgentLinter</div>
                </div>
              </div>

              {[
                { feature: "Scoring", official: "Basic via /init", ours: "5-category (0-100) per file", os: "partial", us: "full" },
                { feature: "Scope", official: "Single CLAUDE.md", ours: "Full workspace (all files)", os: "partial", us: "full" },
                { feature: "Cross-file checks", official: "—", ours: "Contradiction detection", os: "none", us: "full" },
                { feature: "Secret scanning", official: "—", ours: "Keys, tokens, passwords", os: "none", us: "full" },
                { feature: "Auto-fix", official: "Prompting suggestions", ours: "One-command --fix", os: "partial", us: "full" },
                { feature: "Custom rules", official: "—", ours: ".agentlinterrc per team", os: "none", us: "full" },
                { feature: "CI/CD", official: "—", ours: "GitHub Action per PR", os: "none", us: "full" },
                { feature: "Templates", official: "/init bootstrap", ours: "4 starter templates", os: "partial", us: "full" },
                { feature: "Reports", official: "—", ours: "Web report + Share on X", os: "none", us: "full" },
                { feature: "Frameworks", official: "Claude Code only", ours: "CC, Clawdbot, Cursor, Windsurf", os: "partial", us: "full" },
              ].map((row, i) => (
                <div key={row.feature} className={`grid grid-cols-3 ${i % 2 === 0 ? "bg-[var(--bg)]" : "bg-white/[0.01]"}`}>
                  <div className="p-4 sm:p-5 border-r border-t border-[var(--border)]">
                    <span className="text-[13px] font-medium">{row.feature}</span>
                  </div>
                  <div className="p-4 sm:p-5 border-r border-t border-[var(--border)] flex items-start gap-2">
                    {row.os === "full" ? <CircleCheck className="w-3.5 h-3.5 text-[var(--green)] mt-0.5 shrink-0" /> :
                     row.os === "partial" ? <CircleMinus className="w-3.5 h-3.5 text-[var(--amber)] mt-0.5 shrink-0" /> :
                     <Minus className="w-3.5 h-3.5 text-[var(--text-dim)] mt-0.5 shrink-0" />}
                    <span className="text-[12px] text-[var(--text-secondary)]">{row.official}</span>
                  </div>
                  <div className="p-4 sm:p-5 border-t border-[var(--border)] flex items-start gap-2">
                    <CircleCheck className="w-3.5 h-3.5 text-[var(--accent)] mt-0.5 shrink-0" />
                    <span className="text-[12px] text-[var(--text-secondary)]">{row.ours}</span>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="mt-8 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-dim)] flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-[14px] text-[var(--text)] font-medium mb-1">Not a replacement — an extension.</p>
                <p className="text-[13px] text-[var(--text-secondary)] leading-[1.7]">
                  AgentLinter builds on Anthropic&apos;s{" "}
                  <a href="https://code.claude.com/docs/en/memory" target="_blank" className="text-[var(--accent)] hover:underline">CLAUDE.md standard</a>
                  {" "}and the{" "}
                  <a href="https://agentskills.io" target="_blank" className="text-[var(--accent)] hover:underline">Agent Skills open standard</a>.
                  Think of it as ESLint for JavaScript — the language gives you the syntax, the linter tells you if your code is good.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════
         REPORT + SHARE
         ══════════════════════════════════════ */}
      <section className="py-24 sm:py-32 px-6 sm:px-8 border-t border-[var(--border)]">
        <div className="max-w-[1000px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <FadeIn>
              <div>
                <p className="text-[12px] mono text-[var(--accent)] mb-4 tracking-wider uppercase">Reports</p>
                <h2 className="display text-[28px] sm:text-[40px] leading-[1.1] tracking-tight mb-5">
                  Your score card.
                  <br />
                  <span className="text-[var(--text-secondary)]">Share it.</span>
                </h2>
                <p className="text-[15px] text-[var(--text-secondary)] leading-[1.7] mb-8">
                  Every run generates a web report with tier grade, category breakdown,
                  prescriptions, and percentile ranking. Track progress over time.
                </p>
                <div className="space-y-3.5">
                  {[
                    "Tier grades: S → A+ → A → B+ → B → C",
                    "Exact prescriptions with auto-fix markers",
                    "Percentile ranking against all agents",
                    "Progress tracking: watch 72 become 89",
                    "One-click share on X with Score Card image",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full bg-[var(--accent-dim)] flex items-center justify-center mt-0.5 shrink-0">
                        <Check className="w-2.5 h-2.5 text-[var(--accent)]" />
                      </div>
                      <span className="text-[13px] text-[var(--text-secondary)] leading-[1.5]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="flex justify-center">
                <ScoreCardPreview />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
         SELF-EVOLVING
         ══════════════════════════════════════ */}
      <section className="py-24 sm:py-32 px-6 sm:px-8 border-t border-[var(--border)]">
        <div className="max-w-[1000px] mx-auto">
          <FadeIn>
            <p className="text-[12px] mono text-[var(--teal)] mb-4 tracking-wider uppercase">Intelligence</p>
            <h2 className="display text-[28px] sm:text-[40px] leading-[1.1] tracking-tight mb-5">
              Rules that learn.
            </h2>
            <p className="text-[15px] text-[var(--text-secondary)] leading-[1.7] mb-16 max-w-[540px]">
              Every lint teaches us something. Common failures become new rules.
              Bad fixes get replaced. The engine improves with every run.
            </p>
          </FadeIn>

          {/* Flywheel */}
          <FadeIn delay={0.1}>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-14 justify-center sm:justify-start">
              {[
                { icon: Search, label: "Lint" },
                { icon: Share2, label: "Share" },
                { icon: Users, label: "Users" },
                { icon: TrendingUp, label: "Data" },
                { icon: RefreshCw, label: "Rules ↻" },
              ].map((s, i) => (
                <div key={s.label} className="flex items-center gap-2 sm:gap-3">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center">
                      <s.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--text-dim)]" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-[var(--text-dim)] mono">{s.label}</span>
                  </div>
                  {i < 4 && <ChevronRight className="w-3 h-3 text-[var(--text-dim)] mt-[-16px]" />}
                </div>
              ))}
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { level: "L1 · Auto", title: "Weight Tuning", desc: "Scores shift based on which warnings users fix immediately vs ignore." },
              { level: "L2 · Semi", title: "Rule Discovery", desc: "Patterns found in top-scoring agents become new rule candidates." },
              { level: "L3 · Auto", title: "Fix Evolution", desc: "Low-acceptance fixes get replaced through A/B testing." },
              { level: "L4 · Semi", title: "Template Updates", desc: "Starter templates evolve based on what files users add." },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={0.05 * i}>
                <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]">
                  <span className="text-[10px] mono text-[var(--accent)] bg-[var(--accent-dim)] px-2 py-0.5 rounded-lg">{item.level}</span>
                  <h3 className="font-semibold text-[14px] mt-3 mb-2">{item.title}</h3>
                  <p className="text-[12px] text-[var(--text-secondary)] leading-[1.6]">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <p className="text-[11px] text-[var(--text-dim)] mt-6 mono">All data anonymized · opt-out: --no-telemetry</p>
        </div>
      </section>

      {/* ══════════════════════════════════════
         GET STARTED (bold CTA)
         ══════════════════════════════════════ */}
      <section id="start" className="py-28 sm:py-36 px-6 sm:px-8 border-t border-[var(--border)] relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[400px] rounded-full bg-[var(--accent)] opacity-[0.03] blur-[120px]" />
        </div>

        <div className="max-w-[640px] mx-auto text-center relative z-10">
          <FadeIn>
            <h2 className="display text-[32px] sm:text-[48px] lg:text-[56px] leading-[1.1] tracking-tight mb-6">
              One command.
              <br />
              <span className="text-[var(--accent)] glow-text">Try it now.</span>
            </h2>
            <p className="text-[15px] text-[var(--text-secondary)] leading-[1.7] mb-10 max-w-[440px] mx-auto">
              Run it in your agent workspace. Get your score in seconds.
              No signup. No API key. No config.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] glow-accent mb-6">
              <Terminal className="w-5 h-5 text-[var(--text-dim)]" />
              <CopyCommand command="npx agentlinter" className="text-[17px] sm:text-[19px]" />
            </div>

            <p className="text-[12px] text-[var(--text-dim)] mono mb-12">
              100% free &amp; open source · Click to copy · Node.js 18+
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="https://github.com/seojoonkim/agentlinter" target="_blank"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] text-[14px] hover:text-white hover:border-[var(--border-hover)] transition-all">
                <Github className="w-4 h-4" />
                Star on GitHub
              </a>
              <a href="https://github.com/seojoonkim/agentlinter#readme" target="_blank"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] text-[14px] hover:text-white hover:border-[var(--border-hover)] transition-all">
                <FileText className="w-4 h-4" />
                Read the Docs
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 px-6 sm:px-8 border-t border-[var(--border)]">
        <div className="max-w-[1000px] mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-[13px]">
              <div className="flex items-center gap-2">
                <Logo size={16} />
                <span className="font-semibold">AgentLinter</span>
              </div>
              <span className="text-[var(--text-dim)]">·</span>
              <span className="text-[var(--text-dim)]">Free &amp; Open Source ESLint for AI Agents</span>
            </div>
            <div className="flex items-center gap-6 text-[13px] text-[var(--text-dim)]">
              <a href="https://github.com/seojoonkim/agentlinter" className="hover:text-[var(--text-secondary)] transition-colors flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5" /> GitHub
              </a>
              <a href="https://twitter.com/simonkim_nft" target="_blank" className="hover:text-[var(--text-secondary)] transition-colors">
                @simonkim_nft
              </a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
            <p className="text-[11px] text-[var(--text-dim)] leading-[1.8]">
              Built on{" "}
              <a href="https://code.claude.com/docs/en/memory" target="_blank" className="hover:text-[var(--text-secondary)] transition-colors">Anthropic&apos;s CLAUDE.md standard</a>
              {" "}·{" "}
              <a href="https://agentskills.io" target="_blank" className="hover:text-[var(--text-secondary)] transition-colors">Agent Skills open standard</a>
              {" "}·{" "}
              <a href="https://code.claude.com/docs/en/skills" target="_blank" className="hover:text-[var(--text-secondary)] transition-colors">Claude Code Skills</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
