"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
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
  Star,
} from "lucide-react";

/* ════════════════════════════════════════
   GitHub Stars Hook
   ════════════════════════════════════════ */
function useGitHubStars(repo: string) {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch(`https://api.github.com/repos/${repo}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.stargazers_count !== undefined) {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {});
  }, [repo]);

  return stars;
}

/* ════════════════════════════════════════
   GitHub Stars Badge
   ════════════════════════════════════════ */
function GitHubStarsBadge({ stars, className = "" }: { stars: number | null; className?: string }) {
  if (stars === null) return null;
  
  const formatted = stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : stars.toString();
  
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[var(--amber)]/10 text-[var(--amber)] text-[11px] mono ${className}`}>
      <Star className="w-3 h-3 fill-current" />
      {formatted}
    </span>
  );
}

/* ════════════════════════════════════════
   Logo
   ════════════════════════════════════════ */
function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* DNA double helix — no background rect */}
      {/* Left strand (S-curve) */}
      <path d="M10 4 C10 9, 22 11, 22 16 C22 21, 10 23, 10 28" stroke="url(#strand-left)" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Right strand (mirrored S-curve) */}
      <path d="M22 4 C22 9, 10 11, 10 16 C10 21, 22 23, 22 28" stroke="#5eead4" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Horizontal rungs connecting strands */}
      <line x1="12" y1="8" x2="20" y2="8" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <line x1="14" y1="12.5" x2="18" y2="12.5" stroke="currentColor" strokeWidth="1" opacity="0.15" />
      <line x1="14" y1="19.5" x2="18" y2="19.5" stroke="currentColor" strokeWidth="1" opacity="0.15" />
      <line x1="12" y1="24" x2="20" y2="24" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      {/* Nodes at intersections */}
      <circle cx="16" cy="10.5" r="1.5" fill="#a78bfa" />
      <circle cx="16" cy="16" r="2" fill="#5eead4" />
      <circle cx="16" cy="21.5" r="1.5" fill="#a78bfa" />
      <defs>
        <linearGradient id="strand-left" x1="10" y1="4" x2="22" y2="28">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ════════════════════════════════════════
   Rotating Agent Name
   ════════════════════════════════════════ */
const AGENT_NAMES = ["agent", "Claude Code", "Cursor", "Clawdbot", "Windsurf", "Moltbot"];

function RotatingAgentName() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % AGENT_NAMES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="relative inline-block align-bottom">
      {/* Invisible sizer — always reserves width of the widest name */}
      <span className="invisible whitespace-nowrap" aria-hidden="true">Claude Code</span>
      {/* Animated name — smooth entrance with spring-like easing */}
      <AnimatePresence mode="wait">
        <motion.span
          key={AGENT_NAMES[index]}
          className="absolute left-0 bottom-0 whitespace-nowrap bg-gradient-to-r from-[var(--text)] to-[var(--text-secondary)] bg-clip-text"
          initial={{ opacity: 0, y: 24, filter: "blur(8px)", scale: 0.95 }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
          exit={{ opacity: 0, y: -20, filter: "blur(6px)", scale: 1.02 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
            opacity: { duration: 0.4 },
          }}
        >
          {AGENT_NAMES[index]}
        </motion.span>
      </AnimatePresence>
    </span>
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
    { text: "  Workspace Score ........ 76/100  (B+)", type: "score" },
    { text: "  ├─ Structure     ████████░░  80", type: "detail" },
    { text: "  ├─ Clarity       ███████░░░  70", type: "detail" },
    { text: "  ├─ Completeness  ██████░░░░  60", type: "detail" },
    { text: "  ├─ Security      █████████░  90", type: "detail" },
    { text: "  ├─ Consistency   ██████░░░░  60", type: "detail" },
    { text: "  ├─ Memory        ████████░░  80", type: "detail" },
    { text: "  ├─ Runtime Cfg   █████████░  88", type: "detail" },
    { text: "  └─ Skill Safety  █████████░  92", type: "detail" },
    { text: "", type: "blank" },
    { text: "  2 critical(s) · 3 warning(s)", type: "warning" },
    { text: "", type: "blank" },
    { text: '  🔴 CRITICAL  TOOLS.md:14 — Secret: API key pattern "sk-proj-..."', type: "error" },
    { text: "  🔴 CRITICAL  SOUL.md ↔ CLAUDE.md — Conflicting persona definition", type: "error" },
    { text: '  ⚠️  WARN  CLAUDE.md:28 — Vague: "be helpful" → be specific', type: "warn" },
    { text: "  ⚠️  WARN  No error recovery strategy defined", type: "warn" },
    { text: "  ⚠️  WARN  2 cross-file references broken", type: "warn" },
    { text: "", type: "blank" },
    { text: "  💡 3 issues with suggested fixes. See report for details.", type: "success" },
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
      <div className="p-6 sm:p-8 mono text-[12px] sm:text-[13px] leading-[1.9] min-h-[380px] sm:min-h-[420px] overflow-x-auto">
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
    { label: "Memory", score: 88, color: "#f472b6" },
    { label: "Runtime Cfg", score: 92, color: "#38bdf8" },
    { label: "Skill Safety", score: 98, color: "#4ade80" },
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
            <div className="bg-white/[0.04] rounded-md px-3 py-1 text-[11px] text-[var(--text-dim)] mono text-center">
              agentlinter.com/r/a3f8k2
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-7 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo size={16} />
              <span className="text-[13px] text-[var(--text-dim)]">Score Report</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg text-[13px] font-bold mono text-[var(--accent)] bg-[var(--accent-dim)]">
              A
            </div>
          </div>

          <div className="flex items-end gap-4">
            <span className="text-[48px] font-bold text-white leading-none glow-text">87</span>
            <div className="pb-2">
              <div className="text-[12px] mono text-[var(--accent)]">Top 12%</div>
              <div className="text-[11px] text-[var(--text-dim)]">of all agents</div>
            </div>
          </div>

          <div className="space-y-2.5">
            {cats.map((c) => (
              <div key={c.label} className="flex items-center gap-3">
                <span className="text-[11px] text-[var(--text-secondary)] w-[76px] text-right mono">{c.label}</span>
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
                <span className="text-[11px] w-5 mono" style={{ color: c.color }}>{c.score}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[var(--border)]">
            <div className="text-[11px] text-[var(--text-dim)] mono mb-2">Top issues</div>
            <div className="space-y-1.5">
              {[
                { type: "CRITICAL", text: "Rotate exposed API key", color: "var(--red)" },
                { type: "WARN", text: "Add error recovery strategy", color: "var(--amber)" },
                { type: "TIP", text: "3 issues with suggested fixes", color: "var(--teal)" },
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[9px] mono px-1 rounded" style={{ color: p.color, backgroundColor: `${p.color}15` }}>{p.type}</span>
                  <span className="text-[12px] text-[var(--text-secondary)]">{p.text}</span>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[14px] font-medium bg-[var(--accent-dim)] text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-all">
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
  const stars = useGitHubStars("seojoonkim/agentlinter");
  
  return (
    <div className="min-h-screen noise">
      {/* ── Nav ── */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-2xl bg-[var(--bg)]/80 border-b border-[var(--border)] px-5 sm:px-8" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="max-w-[1000px] mx-auto h-14 flex items-center">
          <div className="flex items-center gap-0.5">
            <Logo size={22} />
            <span className="text-[19px]" style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 600, letterSpacing: "-0.01em" }}>
              Agent<span className="text-[var(--accent)]">Linter</span>
            </span>
            <span className="ml-1.5 text-[10px] mono text-[var(--text-dim)] bg-white/[0.04] px-1.5 py-0.5 rounded-md">v1.1.0</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 flex-1 justify-center">
            <a href="#why" className="text-[13px] text-[var(--text-dim)] hover:text-[var(--text-secondary)] transition-colors">Why</a>
            <a href="#how" className="text-[13px] text-[var(--text-dim)] hover:text-[var(--text-secondary)] transition-colors">How</a>
            <a href="#compare" className="text-[13px] text-[var(--text-dim)] hover:text-[var(--text-secondary)] transition-colors">Compare</a>
            <a href="#privacy" className="text-[13px] text-[var(--text-dim)] hover:text-[var(--text-secondary)] transition-colors">Privacy</a>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <a href="https://github.com/seojoonkim/agentlinter" target="_blank" className="text-[13px] text-[var(--text-secondary)] hover:text-white transition-colors flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GitHub</span>
              <GitHubStarsBadge stars={stars} />
            </a>
            <a href="#start" className="hidden sm:inline-flex text-[13px] px-4 py-1.5 rounded-lg bg-[var(--accent)] text-black font-semibold hover:brightness-110 transition-all">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════
         HERO
         ══════════════════════════════════════ */}
      <section className="pt-[120px] sm:pt-[140px] pb-8 sm:pb-12 px-5 sm:px-8">
        <div className="max-w-[1000px] mx-auto">
          <motion.div className="max-w-[700px]" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--teal-dim)] text-[var(--teal)] text-[12px] sm:text-[13px] mono mb-3 whitespace-nowrap">
              <Sparkles className="w-3 h-3 shrink-0" />
              <span>Optimized for <span className="text-[var(--claude)]">CLAUDE.md</span> · Free &amp; Open Source</span>
            </div>

            <h1 className="display text-[36px] sm:text-[56px] lg:text-[72px] leading-[1.2] tracking-tight mb-5">
              Is your <RotatingAgentName />
              <br />
              <span className="text-[var(--accent)] glow-text">sharp & secure?</span>
            </h1>

            <p className="text-[16px] sm:text-[18px] text-[var(--text-secondary)] leading-[1.7] mb-8 max-w-[540px]">
              Built on Anthropic&apos;s <span className="mono text-[var(--claude)] font-medium">CLAUDE.md</span> best practices. Lint your agent&apos;s clarity, structure, security, memory, and consistency in one command.
              Catch leaked secrets, vague instructions, and broken references before they cost you.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="inline-flex items-center gap-3 px-5 py-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all w-full sm:w-auto justify-center sm:justify-start">
                <Terminal className="w-4 h-4 text-[var(--text-dim)]" />
                <CopyCommand command="npx agentlinter" className="text-[15px]" />
              </div>
              <a href="https://github.com/seojoonkim/agentlinter" target="_blank"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] text-[14px] hover:text-white hover:border-[var(--border-hover)] transition-all w-full sm:w-auto">
                <Github className="w-4 h-4" />
                View Source
                <GitHubStarsBadge stars={stars} />
              </a>
            </div>

            <p className="text-[13px] text-[var(--text-dim)] mono mb-12 sm:mb-16">
              Free &amp; open source · No config needed · Runs in seconds
            </p>
          </motion.div>

          {/* Terminal */}
          <motion.div initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
            <AnimatedTerminal />
          </motion.div>
        </div>

        {/* Spacer after hero */}
        <div className="h-16 sm:h-24" />
      </section>

      {/* ── Trust Bar ── */}
      <section className="py-8 sm:py-10 px-5 sm:px-8 border-t border-[var(--border)]">
        <div className="max-w-[1000px] mx-auto">
          <p className="text-center text-[12px] sm:text-[13px] text-[var(--text-dim)] mono mb-6 tracking-wider uppercase">
            Built on open standards
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {[
              { label: "Anthropic CLAUDE.md", href: "https://code.claude.com/docs/en/memory" },
              { label: "Agent Skills Standard", href: "https://agentskills.io" },
              { label: "Claude Code", href: "https://github.com/anthropics/claude-code" },
              { label: "OpenClaw", href: "https://docs.openclaw.ai" },
              { label: "Cursor", href: "https://cursor.sh" },
              { label: "Windsurf", href: "https://codeium.com/windsurf" },
            ].map((item) => (
              <a key={item.label} href={item.href} target="_blank"
                className="text-[13px] sm:text-[14px] text-[var(--text-dim)] hover:text-[var(--text-secondary)] transition-colors flex items-center gap-1">
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
      <section id="why" className="py-18 sm:py-24 px-5 sm:px-8 border-t border-[var(--border)]">
        <div className="max-w-[1000px] mx-auto">
          <FadeIn>
            <p className="text-[14px] mono text-[var(--accent)] mb-4 tracking-wider uppercase">Why this matters</p>
            <h2 className="display text-[32px] sm:text-[48px] lg:text-[56px] leading-[1.1] tracking-tight mb-6 max-w-[700px]">
              Your agent config is code.
              <br />
              <span className="text-[var(--text-secondary)]">Treat it like code.</span>
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="text-[15px] sm:text-[16px] text-[var(--text-secondary)] leading-[1.8] mb-12 max-w-[580px]">
              A single CLAUDE.md file can dramatically change how your agent performs.
              Vague instructions produce vague results. Leaked secrets become vulnerabilities.
              Contradictions across files cause unpredictable behavior.
            </p>
          </FadeIn>

          {/* Anthropic quote */}
          <FadeIn delay={0.15}>
            <div className="mb-12 p-6 sm:p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] max-w-[640px]">
              <Quote className="w-5 h-5 text-[var(--accent)] mb-4 opacity-50" />
              <p className="text-[15px] sm:text-[16px] text-[var(--text)] leading-[1.8] mb-4 italic">
                &ldquo;Be specific: &lsquo;Use 2-space indentation&rsquo; is better than &lsquo;Format code properly.&rsquo;&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--accent-dim)] flex items-center justify-center text-[11px] font-bold text-[var(--accent)]">A</div>
                <div>
                  <div className="text-[14px] text-[var(--text)]">Anthropic</div>
                  <a href="https://code.claude.com/docs/en/memory" target="_blank" className="text-[12px] text-[var(--accent)] hover:underline flex items-center gap-1">
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
                  <p className="text-[14px] text-[var(--text-secondary)] leading-[1.7] mb-5">{item.desc}</p>
                  <div className="pt-4 border-t border-[var(--border)]">
                    <span className="text-[22px] font-bold text-[var(--teal)]">{item.stat}</span>
                    <p className="text-[12px] text-[var(--text-dim)] mt-1">{item.statLabel}</p>
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
      <section id="how" className="py-18 sm:py-24 px-5 sm:px-8 border-t border-[var(--border)]">
        <div className="max-w-[1000px] mx-auto">
          <FadeIn>
            <p className="text-[14px] mono text-[var(--teal)] mb-4 tracking-wider uppercase">How it works</p>
            <h2 className="display text-[32px] sm:text-[48px] lg:text-[56px] leading-[1.1] tracking-tight mb-5">
              One command. <span className="text-[var(--teal)]">Full diagnosis.</span>
            </h2>
            <p className="text-[15px] text-[var(--text-secondary)] leading-[1.7] mb-12 max-w-[520px]">
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
                detail: "Supports Claude Code, OpenClaw, Moltbot, Cursor, Windsurf, and any Agent Skills–compatible workspace.",
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
                desc: "Every issue comes with a prescription and a suggested fix. Secrets get flagged for rotation. Contradictions get resolved.",
                detail: "Each diagnostic includes a 💡 Fix suggestion. Apply them to your files and re-run to verify your score improves.",
              },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={0.1 * i}>
                <div className="p-6 sm:p-7 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all h-full group">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[11px] mono text-[var(--teal)] bg-[var(--teal-dim)] px-2.5 py-1 rounded-lg">{item.step}</span>
                    <item.icon className="w-5 h-5 text-[var(--text-dim)] group-hover:text-[var(--teal)] transition-colors" />
                  </div>
                  <h3 className="text-[18px] font-semibold mb-3">{item.title}</h3>
                  <p className="text-[14px] text-[var(--text-secondary)] leading-[1.7] mb-4">{item.desc}</p>
                  <p className="text-[13px] text-[var(--text-dim)] leading-[1.6]">{item.detail}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
         SKILL SECURITY SCANNER
         ══════════════════════════════════════ */}
      <section className="py-18 sm:py-24 px-5 sm:px-8 border-t border-[var(--border)] bg-gradient-to-b from-[var(--red)]/[0.02] to-transparent">
        <div className="max-w-[1000px] mx-auto">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--red)]/30 text-[var(--red)] text-[12px] sm:text-[13px] mono mb-4">
              <Shield className="w-3 h-3" />
              <span>NEW in v1.1.0</span>
            </div>
            <p className="text-[14px] mono text-[var(--red)] mb-4 tracking-wider uppercase">Security Scanner</p>
            <h2 className="display text-[32px] sm:text-[48px] lg:text-[56px] leading-[1.1] tracking-tight mb-5">
              Scan skills before they
              <br />
              <span className="text-[var(--red)]">compromise your agent.</span>
            </h2>
            <p className="text-[15px] sm:text-[16px] text-[var(--text-secondary)] leading-[1.7] mb-8 max-w-[600px]">
              The MoltX incident exposed <span className="text-[var(--red)] font-semibold">440,000 agents</span> to private key theft through a malicious skill.
              AgentLinter now scans skills for hidden attack vectors before you install them.
            </p>
          </FadeIn>

          {/* 3-Layer Attack Structure */}
          <FadeIn delay={0.1}>
            <div className="mb-12 p-6 sm:p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--red)]/20">
              <h3 className="text-[16px] font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[var(--red)]" />
                3-Layer Attack Structure
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { layer: "L1", title: "Manifest", desc: "Metadata tricks — fake names, hidden permissions, misleading descriptions", color: "var(--amber)" },
                  { layer: "L2", title: "Skill File", desc: "Malicious code — remote eval, secret exfiltration, wallet drains", color: "var(--red)" },
                  { layer: "L3", title: "Prompt", desc: "Injection payloads — LLM manipulation, context poisoning", color: "var(--red)" },
                ].map((item) => (
                  <div key={item.layer} className="p-4 rounded-xl bg-white/[0.02] border border-[var(--border)]">
                    <span className="text-[11px] mono px-2 py-0.5 rounded" style={{ color: item.color, backgroundColor: `${item.color}15` }}>{item.layer}</span>
                    <h4 className="text-[14px] font-semibold mt-2 mb-1">{item.title}</h4>
                    <p className="text-[13px] text-[var(--text-dim)] leading-[1.5]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Detection Items */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { icon: Terminal, title: "Remote Code Injection", desc: "curl|bash, eval(), dynamic requires", severity: "CRITICAL" },
              { icon: Lock, title: "Key Theft", desc: "Private key, seed phrase, wallet access", severity: "CRITICAL" },
              { icon: Shield, title: "In-band Injection", desc: "Prompt manipulation, context override", severity: "DANGEROUS" },
              { icon: Zap, title: "Forced Wallet Connect", desc: "Unauthorized transaction signing", severity: "CRITICAL" },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={0.05 * i}>
                <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--red)]/30 transition-all h-full">
                  <div className="flex items-center justify-between mb-3">
                    <item.icon className="w-4 h-4 text-[var(--text-dim)]" />
                    <span className="text-[9px] mono text-[var(--red)] bg-[var(--red)]/10 px-1.5 py-0.5 rounded">{item.severity}</span>
                  </div>
                  <h3 className="font-semibold text-[14px] mb-1">{item.title}</h3>
                  <p className="text-[12px] text-[var(--text-dim)] leading-[1.5]">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Verdict Levels */}
          <FadeIn delay={0.15}>
            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] mb-10">
              <h3 className="text-[15px] font-semibold mb-4">Verdict Levels</h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: "SAFE", color: "#4ade80", desc: "No threats detected" },
                  { label: "SUSPICIOUS", color: "#fbbf24", desc: "Review recommended" },
                  { label: "DANGEROUS", color: "#f97316", desc: "Known risk patterns" },
                  { label: "MALICIOUS", color: "#ef4444", desc: "Active threat detected" },
                ].map((v) => (
                  <div key={v.label} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-[var(--border)]">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: v.color }} />
                    <span className="text-[13px] font-semibold" style={{ color: v.color }}>{v.label}</span>
                    <span className="text-[12px] text-[var(--text-dim)]">— {v.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* CLI Commands */}
          <FadeIn delay={0.2}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]">
                <div className="text-[11px] mono text-[var(--teal)] mb-2">DEFAULT SCAN</div>
                <CopyCommand command="npx agentlinter" className="text-[15px] mb-3" />
                <p className="text-[13px] text-[var(--text-dim)]">Score + Skill scan + Share (all-in-one)</p>
              </div>
              <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]">
                <div className="text-[11px] mono text-[var(--red)] mb-2">PRE-INSTALL CHECK</div>
                <CopyCommand command="npx agentlinter scan <url>" className="text-[15px] mb-3" />
                <p className="text-[13px] text-[var(--text-dim)]">Verify external skill before installing</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════
         AUTOMATIC MODE DETECTION
         ══════════════════════════════════════ */}
      <section className="py-18 sm:py-24 px-5 sm:px-8 border-t border-[var(--border)]">
        <div className="max-w-[1000px] mx-auto">
          <FadeIn>
            <p className="text-[14px] mono text-[var(--teal)] mb-4 tracking-wider uppercase">Smart Detection</p>
            <h2 className="display text-[32px] sm:text-[48px] lg:text-[56px] leading-[1.1] tracking-tight mb-5">
              Project vs Agent. <span className="text-[var(--teal)]">Auto-detected.</span>
            </h2>
            <p className="text-[15px] text-[var(--text-secondary)] leading-[1.7] mb-12 max-w-[560px]">
              AgentLinter automatically detects your workspace type and adjusts recommendations. 
              No configuration needed.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-6">
            <FadeIn delay={0.1}>
              <div className="p-6 sm:p-7 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] h-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[11px] mono text-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-1 rounded-lg">PROJECT MODE</span>
                </div>
                <h3 className="text-[18px] font-semibold mb-3">Claude Code Projects</h3>
                <p className="text-[14px] text-[var(--text-secondary)] leading-[1.7] mb-4">
                  Detected when only <code className="text-[var(--accent)] bg-[var(--accent)]/10 px-1.5 py-0.5 rounded text-[13px]">CLAUDE.md</code> is present.
                </p>
                <ul className="text-[13px] text-[var(--text-dim)] space-y-2">
                  <li>✓ Project-scoped rules</li>
                  <li>✓ No memory strategy requirements</li>
                  <li>✓ No USER.md recommendations</li>
                  <li>✓ No session handoff checks</li>
                </ul>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="p-6 sm:p-7 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] h-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[11px] mono text-[var(--teal)] bg-[var(--teal)]/10 px-2.5 py-1 rounded-lg">AGENT MODE</span>
                </div>
                <h3 className="text-[18px] font-semibold mb-3">OpenClaw / Moltbot Agents</h3>
                <p className="text-[14px] text-[var(--text-secondary)] leading-[1.7] mb-4">
                  Detected when <code className="text-[var(--teal)] bg-[var(--teal)]/10 px-1.5 py-0.5 rounded text-[13px]">AGENTS.md</code>, <code className="text-[var(--teal)] bg-[var(--teal)]/10 px-1.5 py-0.5 rounded text-[13px]">openclaw.json</code>, or <code className="text-[var(--teal)] bg-[var(--teal)]/10 px-1.5 py-0.5 rounded text-[13px]">moltbot.json</code> exists.
                </p>
                <ul className="text-[13px] text-[var(--text-dim)] space-y-2">
                  <li>✓ Full rule set applied</li>
                  <li>✓ Memory strategy checks</li>
                  <li>✓ User context recommendations</li>
                  <li>✓ Session handoff validation</li>
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
         FIVE DIMENSIONS (technical depth)
         ══════════════════════════════════════ */}
      <section className="py-18 sm:py-24 px-5 sm:px-8 border-t border-[var(--border)]">
        <div className="max-w-[1000px] mx-auto">
          <FadeIn>
            <p className="text-[14px] mono text-[var(--accent)] mb-4 tracking-wider uppercase">Scoring Engine</p>
            <h2 className="display text-[32px] sm:text-[48px] lg:text-[56px] leading-[1.1] tracking-tight mb-5">
              Eight dimensions. <span className="text-[var(--accent)]">Real rules.</span>
            </h2>
            <p className="text-[15px] text-[var(--text-secondary)] leading-[1.7] mb-12 max-w-[560px]">
              Not a vibe check. Every score is backed by specific, documented rules
              derived from Anthropic&apos;s guidelines, security best practices, and
              patterns from high-performing agent workspaces.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Structure",
                weight: "12%",
                icon: Layers,
                rules: ["File organization & naming conventions", "Section separation & hierarchy", "Required files present (CLAUDE.md, etc.)", "Consistent frontmatter format"],
                example: '🔴 CRITICAL  Missing TOOLS.md — referenced in CLAUDE.md:12',
              },
              {
                title: "Clarity",
                weight: "20%",
                icon: Eye,
                rules: ["Naked conditionals without criteria", "Compound instructions (too many per line)", "Ambiguous pronouns & vague language", "Missing priority signals (P0/P1/P2)"],
                example: '⚠️ WARN "be helpful" → specify: response length, tone, format',
              },
              {
                title: "Completeness",
                weight: "12%",
                icon: FileText,
                rules: ["Identity / persona defined", "Tool documentation present", "Boundaries & constraints set", "Error handling & workflows"],
                example: '⚠️ WARN No error recovery workflow — add escalation path',
              },
              {
                title: "Security",
                weight: "15%",
                icon: Shield,
                rules: ["API key / token / password detection", "Injection defense instructions", "Permission boundaries defined", "Sensitive data handling rules"],
                example: '🔴 CRITICAL  Secret: API key "sk-proj-..." in TOOLS.md:14',
              },
              {
                title: "Consistency",
                weight: "8%",
                icon: GitBranch,
                rules: ["Cross-file reference integrity", "Persona alignment (SOUL ↔ CLAUDE)", "Permission conflict detection", "Language mixing patterns (ko/en)"],
                example: '🔴 CRITICAL  SOUL.md persona ≠ CLAUDE.md persona — reconcile',
              },
              {
                title: "Memory",
                weight: "10%",
                icon: RefreshCw,
                rules: ["Session handoff protocol", "File-based persistence (daily notes, logs)", "Task state tracking (progress files)", "Learning loop & knowledge distillation"],
                example: '⚠️ WARN No handoff protocol — agent loses context between sessions',
              },
              {
                title: "Runtime Config",
                weight: "13%",
                icon: Terminal,
                rules: ["Gateway bind (loopback only)", "Auth mode enabled (token/password)", "Token strength (32+ chars)", "DM/group policy restrictions", "Plaintext secrets in config"],
                example: '🔴 CRITICAL  Gateway bind "0.0.0.0" — exposes agent to network',
              },
              {
                title: "Skill Safety",
                weight: "10%",
                icon: Search,
                rules: ["Dangerous shell commands (rm -rf, curl|bash)", "Sensitive path access (~/.ssh, ~/.env)", "Data exfiltration patterns", "Prompt injection vectors in skills", "Excessive permission requests"],
                example: '🔴 CRITICAL  Skill contains: curl ... | bash',
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
                        <span className="text-[13px] text-[var(--text-secondary)] leading-[1.5]">{rule}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-3 border-t border-[var(--border)]">
                    <code className="text-[11.5px] text-[var(--text-dim)] mono leading-[1.6] break-all">{dim.example}</code>
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
      <section id="compare" className="py-18 sm:py-24 px-5 sm:px-8 border-t border-[var(--border)]">
        <div className="max-w-[1000px] mx-auto">
          <FadeIn>
            <p className="text-[14px] mono text-[var(--teal)] mb-4 tracking-wider uppercase">How we&apos;re different</p>
            <h2 className="display text-[32px] sm:text-[48px] lg:text-[56px] leading-[1.1] tracking-tight mb-4 max-w-[700px]">
              <span className="text-[var(--claude)]">Anthropic</span> built the foundation.
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
            <div className="rounded-2xl border border-[var(--border)] overflow-hidden overflow-x-auto">
              <div className="grid grid-cols-[140px_1fr_1fr] bg-white/[0.02] min-w-[600px]">
                <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-r border-[var(--border)]">
                  <span className="text-[12px] text-[var(--text-dim)] mono">Feature</span>
                </div>
                <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-r border-[var(--border)] text-center">
                  <div className="text-[13px] text-[var(--text-secondary)]">Claude Code</div>
                  <div className="text-[10px] text-[var(--text-dim)] mono mt-0.5">Anthropic Official</div>
                </div>
                <div className="px-4 py-2.5 sm:px-5 sm:py-3 text-center">
                  <div className="text-[13px] font-semibold text-[var(--accent)]">AgentLinter</div>
                </div>
              </div>

              {[
                { feature: "Scoring", official: "Basic via /init", ours: "6-category (0-100) per file", os: "partial", us: "full" },
                { feature: "Scope", official: "Single CLAUDE.md", ours: "Full workspace (all files)", os: "partial", us: "full" },
                { feature: "Cross-file checks", official: "✕", ours: "Contradiction detection", os: "none", us: "full" },
                { feature: "Secret scanning", official: "✕", ours: "Keys, tokens, passwords", os: "none", us: "full" },
                { feature: "Fix guidance", official: "Prompting suggestions", ours: "Actionable fix per issue", os: "partial", us: "full" },
                { feature: "Custom rules", official: "✕", ours: ".agentlinterrc per team", os: "none", us: "full" },
                { feature: "CI/CD", official: "✕", ours: "GitHub Action per PR", os: "none", us: "full" },
                { feature: "Templates", official: "/init bootstrap", ours: "4 starter templates", os: "partial", us: "full" },
                { feature: "Reports", official: "✕", ours: "Web report + Share on X", os: "none", us: "full" },
                { feature: "Frameworks", official: "Claude Code only", ours: "CC, OpenClaw, Moltbot, Cursor, Windsurf", os: "partial", us: "full" },
              ].map((row, i) => (
                <div key={row.feature} className={`grid grid-cols-[140px_1fr_1fr] min-w-[600px] ${i % 2 === 0 ? "bg-[var(--bg)]" : "bg-white/[0.01]"}`}>
                  <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-r border-t border-[var(--border)]">
                    <span className="text-[13px] font-medium">{row.feature}</span>
                  </div>
                  <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-r border-t border-[var(--border)] flex items-center gap-2">
                    {row.os === "full" ? <CircleCheck className="w-3.5 h-3.5 text-[var(--green)] shrink-0" /> :
                     row.os === "partial" ? <CircleMinus className="w-3.5 h-3.5 text-[var(--amber)] shrink-0" /> :
                     <Minus className="w-3.5 h-3.5 text-[var(--text-dim)] shrink-0" />}
                    <span className="text-[13px] text-[var(--text-secondary)]">{row.official}</span>
                  </div>
                  <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-t border-[var(--border)] flex items-center gap-2">
                    <CircleCheck className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                    <span className="text-[13px] text-[var(--text-secondary)]">{row.ours}</span>
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
                <p className="text-[14px] text-[var(--text-secondary)] leading-[1.7]">
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
      <section className="py-18 sm:py-24 px-5 sm:px-8 border-t border-[var(--border)]">
        <div className="max-w-[1000px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <FadeIn>
              <div>
                <p className="text-[14px] mono text-[var(--accent)] mb-4 tracking-wider uppercase">Reports</p>
                <h2 className="display text-[32px] sm:text-[48px] leading-[1.1] tracking-tight mb-5">
                  Your score card.
                  <br />
                  <span className="text-[var(--teal)]">Share it.</span>
                </h2>
                <p className="text-[15px] text-[var(--text-secondary)] leading-[1.7] mb-8">
                  Every run generates a web report with tier grade, category breakdown,
                  prescriptions, and percentile ranking. Track progress over time.
                </p>
                <div className="space-y-3.5">
                  {[
                    "Tier grades: S → A+ → A → B+ → B → C",
                    "Exact prescriptions with actionable fix suggestions",
                    "Percentile ranking against all agents",
                    "Progress tracking: watch 72 become 89",
                    "One-click share on X with Score Card image",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full bg-[var(--accent-dim)] flex items-center justify-center mt-0.5 shrink-0">
                        <Check className="w-2.5 h-2.5 text-[var(--accent)]" />
                      </div>
                      <span className="text-[14px] text-[var(--text-secondary)] leading-[1.5]">{item}</span>
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
      <section className="py-18 sm:py-24 px-5 sm:px-8 border-t border-[var(--border)]">
        <div className="max-w-[1000px] mx-auto">
          <FadeIn>
            <p className="text-[14px] mono text-[var(--teal)] mb-4 tracking-wider uppercase">Intelligence</p>
            <h2 className="display text-[32px] sm:text-[48px] leading-[1.1] tracking-tight mb-5">
              Rules that <span className="text-[var(--accent)]">learn.</span>
            </h2>
            <p className="text-[15px] text-[var(--text-secondary)] leading-[1.7] mb-12 max-w-[540px]">
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
                  <div className="flex flex-col items-center gap-1.5 w-12 sm:w-14">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center">
                      <s.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--text-dim)]" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-[var(--text-dim)] mono truncate">{s.label}</span>
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
                <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] h-full flex flex-col">
                  <span className="text-[11px] mono text-[var(--accent)] bg-[var(--accent-dim)] px-2 py-0.5 rounded-lg self-start">{item.level}</span>
                  <h3 className="font-semibold text-[14px] mt-3 mb-2">{item.title}</h3>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-[1.6] flex-1">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <p className="text-[12px] text-[var(--text-dim)] mt-6 mono">All data anonymized · opt-out: --no-telemetry</p>
        </div>
      </section>

      {/* ══════════════════════════════════════
         PRIVACY & SECURITY
         ══════════════════════════════════════ */}
      <section id="privacy" className="py-18 sm:py-24 px-5 sm:px-8 border-t border-[var(--border)]">
        <div className="max-w-[1000px] mx-auto">
          <FadeIn>
            <p className="text-[14px] mono text-[var(--teal)] mb-4 tracking-wider uppercase">Privacy &amp; Security</p>
            <h2 className="display text-[32px] sm:text-[48px] lg:text-[56px] leading-[1.1] tracking-tight mb-6 max-w-[700px]">
              Your files never leave
              <br />
              <span className="text-[var(--teal)]">your machine.</span>
            </h2>
            <p className="text-[15px] text-[var(--text-secondary)] leading-[1.7] mb-12 max-w-[560px]">
              All scanning and scoring runs 100% locally. Your file contents never leave your machine.
              Report sharing is optional — when enabled, only scores and diagnostic messages are uploaded (not your actual files).
              Use <code className="text-[var(--teal)] bg-[var(--teal)]/10 px-1.5 py-0.5 rounded text-[13px]">--local</code> to skip sharing entirely.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Lock,
                title: "Local-First Execution",
                desc: "All scanning runs on your machine. File contents never leave. Report sharing (scores + diagnostics only) is optional — use --local to disable entirely.",
                badge: "Files stay local",
              },
              {
                icon: Shield,
                title: "Secrets Auto-Masked",
                desc: "When AgentLinter detects a secret (API key, token, password), it appears as [REDACTED] in diagnostics. Even in shareable reports, raw secrets are never included.",
                badge: "16 secret patterns",
              },
              {
                icon: Eye,
                title: "Reports ≠ Raw Files",
                desc: "Shareable reports contain only scores, file names, line numbers, and diagnostic messages. Never the original file content. Your SOUL.md stays private.",
                badge: "Metadata only",
              },
              {
                icon: FileText,
                title: "Open Source, Auditable",
                desc: "Every line of code is on GitHub. No obfuscated binaries, no hidden network calls. Read it, fork it, verify it. Trust through transparency.",
                badge: "MIT License",
              },
              {
                icon: Terminal,
                title: "No Telemetry by Default",
                desc: "Unlike many dev tools, AgentLinter sends zero analytics out of the box. If you opt in to anonymous usage stats, it's aggregated counts only — never content.",
                badge: "--no-telemetry flag",
              },
              {
                icon: Lock,
                title: "CI/CD Safe",
                desc: "In CI pipelines, AgentLinter only outputs scores and diagnostics to stdout. No artifacts, no uploads, no external dependencies beyond Node.js itself.",
                badge: "Air-gap compatible",
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={0.05 * i}>
                <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all h-full">
                  <div className="flex items-center justify-between mb-4">
                    <item.icon className="w-5 h-5 text-[var(--teal)]" />
                    <span className="text-[11px] mono text-[var(--teal)] bg-[var(--teal-dim)] px-2 py-0.5 rounded-lg">{item.badge}</span>
                  </div>
                  <h3 className="font-semibold text-[15px] mb-2">{item.title}</h3>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-[1.7]">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* TL;DR box */}
          <FadeIn delay={0.15}>
            <div className="mt-10 p-6 sm:p-8 rounded-2xl bg-[var(--teal-dim)] border border-[var(--teal)]/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--teal)]/15 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-[var(--teal)]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-[var(--teal)] mb-2">TL;DR</h3>
                  <p className="text-[15px] text-[var(--text)] leading-[1.7]">
                    AgentLinter reads your files locally, scores them locally, and outputs results locally.
                    Nothing touches a server unless <em>you</em> choose to share a report — and even then,
                    only scores and diagnostic messages are included, never your actual file contents.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════
         GET STARTED (bold CTA)
         ══════════════════════════════════════ */}
      <section id="start" className="py-22 sm:py-28 px-5 sm:px-8 border-t border-[var(--border)] relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[400px] rounded-full bg-[var(--accent)] opacity-[0.03] blur-[120px]" />
        </div>

        <div className="max-w-[640px] mx-auto text-center relative z-10">
          <FadeIn>
            <h2 className="display text-[32px] sm:text-[48px] lg:text-[56px] leading-[1.1] tracking-tight mb-5">
              One command.
              <br />
              <span className="text-[var(--accent)] glow-text">Try it now.</span>
            </h2>
            <p className="text-[15px] text-[var(--text-secondary)] leading-[1.7] mb-8 max-w-[440px] mx-auto">
              Run it in your agent workspace. Get your score in seconds.
              No signup. No API key. No config.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] glow-accent mb-5 w-full sm:w-auto justify-center">
              <Terminal className="w-5 h-5 text-[var(--text-dim)]" />
              <CopyCommand command="npx agentlinter" className="text-[17px] sm:text-[19px]" />
            </div>

            <p className="text-[13px] text-[var(--text-dim)] mono mb-8">
              100% free &amp; open source · Click to copy · Node.js 18+
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="https://github.com/seojoonkim/agentlinter" target="_blank"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] text-[14px] hover:text-white hover:border-[var(--border-hover)] transition-all w-full sm:w-auto">
                <Github className="w-4 h-4" />
                Star on GitHub
                <GitHubStarsBadge stars={stars} />
              </a>
              <a href="https://github.com/seojoonkim/agentlinter#readme" target="_blank"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] text-[14px] hover:text-white hover:border-[var(--border-hover)] transition-all w-full sm:w-auto">
                <FileText className="w-4 h-4" />
                Read the Docs
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════
         SPREAD THE WORD
         ══════════════════════════════════════ */}
      <section className="py-12 sm:py-16 px-5 sm:px-8 border-t border-[var(--border)]">
        <div className="max-w-[600px] mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--teal-dim)] mb-5">
              <Share2 className="w-5 h-5 text-[var(--teal)]" />
            </div>
            <h3 className="display text-[22px] sm:text-[28px] leading-[1.2] mb-4">
              Help us help more agents
            </h3>
            <p className="text-[15px] sm:text-[16px] text-[var(--text-secondary)] leading-[1.7] mb-8 max-w-[480px] mx-auto">
              If AgentLinter helped improve your agent setup, share it with fellow developers.
              Every share helps the open-source agent ecosystem grow stronger.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`https://x.com/intent/tweet?text=${encodeURIComponent("Just discovered AgentLinter — it's like ESLint for AI agents. Scores your CLAUDE.md, AGENTS.md and agent workspace files.\n\nFree & open source:\nnpx agentlinter\n\nagentlinter.com")}`}
                target="_blank"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] text-[14px] hover:text-white hover:border-[var(--border-hover)] transition-all w-full sm:w-auto"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Share on X
              </a>
              <a
                href="https://github.com/seojoonkim/agentlinter"
                target="_blank"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] text-[14px] hover:text-white hover:border-[var(--border-hover)] transition-all w-full sm:w-auto"
              >
                <Github className="w-3.5 h-3.5" />
                Star on GitHub
                <GitHubStarsBadge stars={stars} />
              </a>
              <a
                href="https://github.com/seojoonkim/agentlinter/discussions"
                target="_blank"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] text-[14px] hover:text-white hover:border-[var(--border-hover)] transition-all w-full sm:w-auto"
              >
                <Users className="w-3.5 h-3.5" />
                Join Community
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Changelog ── */}
      <section id="changelog" className="py-16 px-5 sm:px-8 border-t border-[var(--border)]">
        <div className="max-w-[720px] mx-auto">
          <FadeIn>
            <p className="text-[12px] mono text-[var(--accent)] mb-2 tracking-wider uppercase">Release History</p>
            <h2 className="text-[28px] font-bold text-[var(--text-primary)] mb-10">Changelog</h2>
          </FadeIn>
          <div className="space-y-8">
            {[
              { version: "v1.1.0", date: "2026-03-01", badge: "Latest", items: ["🎯 Position Risk Warning — detects critical rules buried in the middle of files", "📊 Token Efficiency Score — grades files by line count (A/B/C/D)", "🔐 Enhanced Security — prompt injection + API key exposure detection"] },
              { version: "v1.0.0", date: "2026-02-25", badge: "Stable", items: ["6 new Claude Code rules: instruction-count, relevance-trap, progressive-disclosure, hooks-structure, skills-vs-commands, agent-focus", "📊 Context Window Budget Estimator in every report", "🔍 Full .claude/ directory recursive scanning"] },
              { version: "v0.9.0", date: "2026-02", badge: "", items: ["Token Budget Checker, Instruction Scope, Skills Security+, Hooks Advisor", "Contradiction detection, vague conditional detection, Remote-Ready Score"] },
              { version: "v0.8.2", date: "2026-02", badge: "", items: ["4 new runtime rules: gateway-exposure, tool-policy-audit, session-limits, credential-rotation", "New Remote-Ready Score category"] },
              { version: "v0.8.1", date: "2026-02", badge: "", items: ["Fixed 5 false positive bugs: api-key-exposure, vague-instructions, file-reference, retention-strategy, tone-mismatch"] },
              { version: "v0.8.0", date: "2026-02", badge: "", items: ["7 new rules: prompt injection, enhanced API key exposure, MCP validator, skills linter, hooks checker, cross-file refs, workspace sync", "Claude Code Feb 2026 spec update"] },
              { version: "v0.7.0", date: "2026-02-14", badge: "", items: ["25+ new rules: instruction counter, context bloat, progressive disclosure, anti-patterns, auto-fix suggestions, MCP/skills/hooks integration", "Research-based: Song et al. (TMLR 2026) LLM failure modes"] },
              { version: "v0.6.0", date: "2026-02-11", badge: "", items: ["english-config-files rule (2.4-3.8× token savings)", "CLI share by default, all 8 scoring dimensions live"] },
              { version: "v0.5.0", date: "2026-02-10", badge: "", items: ["Skill Safety as 8th dimension, --audit-skill trojan detection", "Dangerous pattern scanner: curl|bash, ~/.ssh, webhook.site"] },
              { version: "v0.3.0", date: "2026-02-07", badge: "", items: ["Auto Agent/Project mode detection", "OpenClaw + Moltbot framework support"] },
              { version: "v0.1.0", date: "2026-02-05", badge: "Initial", items: ["8 scoring dimensions, ~30 core rules", "Web interface, npx CLI, GitHub repo analysis, share URLs", "Local-first: file contents never leave your machine"] },
            ].map((release) => (
              <FadeIn key={release.version}>
                <div className="flex gap-4 sm:gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] mt-1.5 shrink-0" />
                    <div className="w-px flex-1 bg-[var(--border)] mt-1" />
                  </div>
                  <div className="pb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[15px] font-bold text-[var(--text-primary)] mono">{release.version}</span>
                      <span className="text-[11px] text-[var(--text-dim)] mono">{release.date}</span>
                      {release.badge && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent)]/20 text-[var(--accent)] mono">{release.badge}</span>}
                    </div>
                    <ul className="space-y-1">
                      {release.items.map((item, i) => (
                        <li key={i} className="text-[13px] text-[var(--text-secondary)] leading-[1.6] flex gap-2">
                          <span className="text-[var(--border)] shrink-0">—</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn>
            <div className="mt-4 ml-9">
              <a href="https://github.com/seojoonkim/agentlinter/releases" target="_blank" className="text-[13px] text-[var(--accent)] hover:underline mono">
                → View all releases on GitHub ↗
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Acknowledgments ── */}
      <section className="py-10 px-5 sm:px-8 border-t border-[var(--border)]">
        <div className="max-w-[600px] mx-auto text-center">
          <FadeIn>
            <p className="text-[12px] mono text-[var(--text-dim)] mb-3 tracking-wider uppercase">Acknowledgments</p>
            <p className="text-[14px] text-[var(--text-secondary)] leading-[1.7]">
              Skill Security Scanner was inspired by{" "}
              <a href="https://dev.to/sebayaki/moltx-44-1plm" target="_blank" className="text-[var(--accent)] hover:underline">
                @sebayaki&apos;s MoltX security analysis
              </a>
              {" "}— thank you for uncovering the vulnerability that protects 440K+ agents today.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 px-5 sm:px-8 border-t border-[var(--border)]">
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
                <Github className="w-3.5 h-3.5" /> GitHub <GitHubStarsBadge stars={stars} />
              </a>
              <a href="https://twitter.com/simonkim_nft" target="_blank" className="hover:text-[var(--text-secondary)] transition-colors">
                @simonkim_nft
              </a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
            <p className="text-[12px] text-[var(--text-dim)] leading-[1.8]">
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
