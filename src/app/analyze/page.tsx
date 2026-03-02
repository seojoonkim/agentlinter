"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, BarChart3, Layers, Shield, Users, ArrowLeft,
  AlertTriangle, FileText, Zap, Sparkles,
} from "lucide-react";
import { analyzeV2, V2AnalysisResult } from "../../engine/v2/analyzer";

const TABS = [
  { id: "overview", label: "Overview", icon: Sparkles },
  { id: "cognitive", label: "Cognitive Load", icon: Brain },
  { id: "tokens", label: "Token Map", icon: BarChart3 },
  { id: "modularity", label: "Modularity", icon: Layers },
  { id: "roles", label: "Roles", icon: Users },
  { id: "security", label: "Security", icon: Shield },
] as const;

type TabId = (typeof TABS)[number]["id"];

function CognitiveScoreBadge({ score }: { score: number }) {
  const color = score <= 40 ? "#4ade80" : score <= 70 ? "#fbbf24" : "#ef4444";
  const label = score <= 40 ? "Low Load" : score <= 70 ? "Medium Load" : "High Load";
  const emoji = score <= 40 ? "\u{1F7E2}" : score <= 70 ? "\u{1F7E1}" : "\u{1F534}";
  return (
    <div className="text-center">
      <div className="text-[72px] font-bold mono leading-none" style={{ color }}>{score}</div>
      <div className="text-[16px] mt-2 font-medium" style={{ color }}>{emoji} {label}</div>
      <div className="text-[13px] text-[var(--text-dim,#666)] mt-1">Cognitive Load Score (lower is better)</div>
    </div>
  );
}

function OverviewTab({ result }: { result: V2AnalysisResult }) {
  const { cognitiveLoad, tokenHeatmap, modularity, roleComplexity, securityScan, overallScore } = result;
  const scoreColor = overallScore >= 80 ? "#4ade80" : overallScore >= 60 ? "#fbbf24" : "#ef4444";
  const cards = [
    { label: "Cognitive Load", value: String(cognitiveLoad.score), desc: `${cognitiveLoad.sectionCount} sections, ${cognitiveLoad.duplicates.length} duplicates`, color: cognitiveLoad.score <= 40 ? "#4ade80" : cognitiveLoad.score <= 70 ? "#fbbf24" : "#ef4444" },
    { label: "Token Usage", value: tokenHeatmap.totalTokens.toLocaleString(), desc: `${tokenHeatmap.gpt4ContextPct}% of GPT-4 context`, color: "#a78bfa" },
    { label: "Modularity", value: String(modularity.suggestions.length), desc: modularity.shouldModularize ? `${modularity.totalLines} lines \u2014 split recommended` : `${modularity.totalLines} lines \u2014 OK`, color: modularity.suggestions.length === 0 ? "#4ade80" : "#fbbf24" },
    { label: "Roles", value: String(roleComplexity.roleCount), desc: roleComplexity.warning ? "Too many roles!" : "Manageable", color: roleComplexity.warning ? "#fbbf24" : "#4ade80" },
    { label: "Security Issues", value: String(securityScan.criticalCount + securityScan.warningCount), desc: `${securityScan.criticalCount} critical, ${securityScan.warningCount} warnings`, color: securityScan.criticalCount > 0 ? "#ef4444" : securityScan.warningCount > 0 ? "#fbbf24" : "#4ade80" },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center py-6">
        <div className="text-[13px] text-[var(--text-dim,#666)] mono mb-2 uppercase tracking-wider">Overall Health Score</div>
        <div className="text-[64px] font-bold mono leading-none" style={{ color: scoreColor }}>{overallScore}</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(c => (
          <div key={c.label} className="p-5 rounded-2xl bg-[var(--bg-card,#111)] border border-[var(--border,#222)]">
            <div className="text-[12px] text-[var(--text-dim,#666)] mono uppercase mb-2">{c.label}</div>
            <div className="text-[28px] font-bold mono" style={{ color: c.color }}>{c.value}</div>
            <div className="text-[13px] text-[var(--text-secondary,#999)] mt-1">{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CognitiveTab({ result }: { result: V2AnalysisResult }) {
  const { cognitiveLoad } = result;
  return (
    <div className="space-y-8">
      <div className="flex justify-center py-4"><CognitiveScoreBadge score={cognitiveLoad.score} /></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Sections", value: cognitiveLoad.sectionCount },
          { label: "Avg Complexity", value: cognitiveLoad.avgComplexity },
          { label: "Duplicates", value: cognitiveLoad.duplicates.length },
          { label: "Position Issues", value: cognitiveLoad.positionWarnings.length },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl bg-[var(--bg-card,#111)] border border-[var(--border,#222)] text-center">
            <div className="text-[24px] font-bold mono">{s.value}</div>
            <div className="text-[11px] text-[var(--text-dim,#666)] mono mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="p-5 rounded-2xl bg-[var(--bg-card,#111)] border border-[var(--border,#222)]">
        <h3 className="text-[15px] font-semibold mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-[#fbbf24]" />Pareto Analysis</h3>
        <p className="text-[14px] text-[var(--text-secondary,#999)] mb-3">Top 20% sections use <strong className="text-white">{cognitiveLoad.paretoAnalysis.totalTokens > 0 ? Math.round(cognitiveLoad.paretoAnalysis.top20pctTokens / cognitiveLoad.paretoAnalysis.totalTokens * 100) : 0}%</strong> of total tokens</p>
        <div className="flex flex-wrap gap-2">{cognitiveLoad.paretoAnalysis.top20pctSections.map(s => (<span key={s} className="px-2 py-1 rounded-lg bg-[#fbbf24]/10 text-[#fbbf24] text-[12px] mono">{s}</span>))}</div>
      </div>
      {cognitiveLoad.duplicates.length > 0 && (
        <div className="p-5 rounded-2xl bg-[var(--bg-card,#111)] border border-[#ef4444]/20">
          <h3 className="text-[15px] font-semibold mb-3 text-[#ef4444]">Duplicate Content</h3>
          {cognitiveLoad.duplicates.map((d, i) => (<div key={i} className="text-[13px] text-[var(--text-secondary,#999)] mb-2"><span className="text-[#ef4444]">{"\u25CF"}</span> &ldquo;{d.a}&rdquo; &harr; &ldquo;{d.b}&rdquo; &mdash; {d.similarity}% similar</div>))}
        </div>
      )}
      {cognitiveLoad.positionWarnings.length > 0 && (
        <div className="p-5 rounded-2xl bg-[var(--bg-card,#111)] border border-[#fbbf24]/20">
          <h3 className="text-[15px] font-semibold mb-3 text-[#fbbf24]">Position Warnings</h3>
          {cognitiveLoad.positionWarnings.map((w, i) => (<div key={i} className="text-[13px] text-[var(--text-secondary,#999)] mb-2"><AlertTriangle className="w-3 h-3 text-[#fbbf24] inline mr-1" /><strong>{w.section}</strong>: {w.issue}</div>))}
        </div>
      )}
    </div>
  );
}

function TokenTab({ result }: { result: V2AnalysisResult }) {
  const { tokenHeatmap } = result;
  const maxTokens = Math.max(...tokenHeatmap.sections.map(s => s.tokens), 1);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--bg-card,#111)] border border-[var(--border,#222)] text-center">
          <div className="text-[36px] font-bold mono text-[#a78bfa]">{tokenHeatmap.totalTokens.toLocaleString()}</div>
          <div className="text-[12px] text-[var(--text-dim,#666)] mono mt-1">Total Tokens</div>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--bg-card,#111)] border border-[var(--border,#222)] text-center">
          <div className="text-[36px] font-bold mono" style={{ color: tokenHeatmap.gpt4ContextPct > 20 ? "#fbbf24" : "#4ade80" }}>{tokenHeatmap.gpt4ContextPct}%</div>
          <div className="text-[12px] text-[var(--text-dim,#666)] mono mt-1">of GPT-4 128k Context</div>
        </div>
      </div>
      <div className="space-y-3">
        {tokenHeatmap.sections.map((s, i) => {
          const widthPct = Math.max(3, (s.tokens / maxTokens) * 100);
          const intensity = s.tokens / maxTokens;
          const barColor = intensity > 0.7 ? "#ef4444" : intensity > 0.4 ? "#fbbf24" : "#4ade80";
          return (
            <div key={i} className="group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] text-[var(--text-secondary,#999)] truncate max-w-[60%]">{s.heading}</span>
                <span className="text-[12px] mono text-[var(--text-dim,#666)]">{s.tokens} tokens ({s.pct}%)</span>
              </div>
              <div className="w-full h-6 bg-white/[0.03] rounded-lg overflow-hidden">
                <motion.div className="h-full rounded-lg" initial={{ width: 0 }} animate={{ width: `${widthPct}%` }} transition={{ duration: 0.5, delay: i * 0.05 }} style={{ backgroundColor: barColor, opacity: 0.8 }} />
              </div>
              <div className="text-[11px] text-[var(--text-dim,#666)] mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">{s.savingsMessage} &middot; Density: {s.density} tok/line</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ModularityTab({ result }: { result: V2AnalysisResult }) {
  const { modularity } = result;
  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-[var(--bg-card,#111)] border border-[var(--border,#222)]">
        <div className="flex items-center gap-3 mb-3">
          <FileText className="w-5 h-5 text-[var(--text-dim,#666)]" />
          <div>
            <div className="text-[15px] font-semibold">{modularity.totalLines} lines total</div>
            <div className="text-[13px] text-[var(--text-dim,#666)]">{modularity.shouldModularize ? "Exceeds 150-line threshold" : "Under 150 lines \u2014 OK"}</div>
          </div>
        </div>
        <div className="w-full h-3 bg-white/[0.03] rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, (modularity.totalLines / 300) * 100)}%`, backgroundColor: modularity.shouldModularize ? "#fbbf24" : "#4ade80" }} />
        </div>
      </div>
      {modularity.suggestions.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-[15px] font-semibold">Suggested Splits</h3>
          {modularity.suggestions.map((s, i) => (
            <div key={i} className="p-4 rounded-xl bg-[var(--bg-card,#111)] border border-[var(--border,#222)]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[12px] mono px-2 py-0.5 rounded bg-[#a78bfa]/10 text-[#a78bfa]">{s.suggestedFile}</span>
                <span className="text-[13px] text-[var(--text-secondary,#999)]">&larr; {s.section}</span>
              </div>
              <div className="text-[12px] text-[var(--text-dim,#666)]">{s.reason}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-[var(--bg-card,#111)] border border-[#4ade80]/20 text-center">
          <div className="text-[15px] font-semibold text-[#4ade80]">{"\u2705"} No modularization needed</div>
        </div>
      )}
    </div>
  );
}

function RolesTab({ result }: { result: V2AnalysisResult }) {
  const { roleComplexity } = result;
  const colors = ["#a78bfa", "#5eead4", "#fbbf24", "#f472b6", "#60a5fa", "#4ade80", "#f97316"];
  return (
    <div className="space-y-6">
      <div className={`p-5 rounded-2xl border ${roleComplexity.warning ? "border-[#fbbf24]/30 bg-[#fbbf24]/5" : "border-[var(--border,#222)] bg-[var(--bg-card,#111)]"}`}>
        <div className="flex items-center gap-3">
          {roleComplexity.warning && <AlertTriangle className="w-5 h-5 text-[#fbbf24]" />}
          <div>
            <div className="text-[18px] font-bold">{roleComplexity.roleCount} Role{roleComplexity.roleCount !== 1 ? "s" : ""} Detected</div>
            <div className="text-[14px] text-[var(--text-secondary,#999)]">{roleComplexity.message}</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {roleComplexity.roles.map((r, i) => (
          <div key={r.name} className="p-4 rounded-xl bg-[var(--bg-card,#111)] border border-[var(--border,#222)]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
              <span className="text-[15px] font-semibold">{r.name}</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">{r.keywords.map(k => (<span key={k} className="px-1.5 py-0.5 rounded text-[11px] mono bg-white/[0.04] text-[var(--text-dim,#666)]">{k}</span>))}</div>
            <div className="text-[11px] text-[var(--text-dim,#666)]">Found in: {r.sections.slice(0, 3).join(", ")}{r.sections.length > 3 ? ` +${r.sections.length - 3}` : ""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityTab({ result }: { result: V2AnalysisResult }) {
  const { securityScan } = result;
  const sc: Record<string, string> = { CRITICAL: "#ef4444", WARNING: "#fbbf24", INFO: "#60a5fa" };
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[{ l: "Critical", c: securityScan.criticalCount, cl: "#ef4444" }, { l: "Warnings", c: securityScan.warningCount, cl: "#fbbf24" }, { l: "Info", c: securityScan.infoCount, cl: "#60a5fa" }].map(s => (
          <div key={s.l} className="p-4 rounded-xl bg-[var(--bg-card,#111)] border border-[var(--border,#222)] text-center">
            <div className="text-[28px] font-bold mono" style={{ color: s.cl }}>{s.c}</div>
            <div className="text-[11px] mono mt-1" style={{ color: s.cl }}>{s.l}</div>
          </div>
        ))}
      </div>
      {securityScan.findings.length > 0 ? (
        <div className="space-y-3">{securityScan.findings.map((f, i) => (
          <div key={i} className="p-4 rounded-xl bg-[var(--bg-card,#111)] border border-[var(--border,#222)]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] mono px-1.5 py-0.5 rounded font-bold" style={{ color: sc[f.severity], backgroundColor: `${sc[f.severity]}15` }}>{f.severity}</span>
              <span className="text-[12px] mono text-[var(--text-dim,#666)]">Line {f.line}</span>
              <span className="text-[11px] mono text-[var(--text-dim,#666)] bg-white/[0.03] px-1.5 py-0.5 rounded">{f.pattern}</span>
            </div>
            <div className="text-[14px] text-[var(--text-secondary,#999)] mb-1">{f.description}</div>
            <div className="text-[12px] mono text-[var(--text-dim,#666)] bg-white/[0.02] px-3 py-1.5 rounded-lg overflow-x-auto">{f.lineContent}</div>
          </div>
        ))}</div>
      ) : (
        <div className="p-8 rounded-2xl bg-[var(--bg-card,#111)] border border-[#4ade80]/20 text-center">
          <Shield className="w-10 h-10 text-[#4ade80] mx-auto mb-3" />
          <div className="text-[18px] font-semibold text-[#4ade80]">All Clear</div>
          <div className="text-[13px] text-[var(--text-dim,#666)] mt-1">No security issues detected</div>
        </div>
      )}
    </div>
  );
}

export default function AnalyzePage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<V2AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const handleAnalyze = () => {
    if (!input.trim()) return;
    setResult(analyzeV2(input));
    setActiveTab("overview");
  };

  const renderTab = () => {
    if (!result) return null;
    switch (activeTab) {
      case "overview": return <OverviewTab result={result} />;
      case "cognitive": return <CognitiveTab result={result} />;
      case "tokens": return <TokenTab result={result} />;
      case "modularity": return <ModularityTab result={result} />;
      case "roles": return <RolesTab result={result} />;
      case "security": return <SecurityTab result={result} />;
    }
  };

  return (
    <div className="min-h-screen noise">
      <nav className="fixed top-0 w-full z-50 backdrop-blur-2xl bg-[var(--bg,#000)]/80 border-b border-[var(--border,#222)] px-5 sm:px-8" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="max-w-[1000px] mx-auto h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-[var(--text-dim,#666)] hover:text-white transition-colors"><ArrowLeft className="w-4 h-4" /><span className="text-[13px]">AgentLinter</span></a>
          <div className="text-[14px] font-semibold">Cognitive Load Analyzer <span className="text-[var(--accent,#a78bfa)]">for AI Agents</span></div>
          <div className="w-20" />
        </div>
      </nav>

      <main className="pt-[80px] pb-20 px-5 sm:px-8">
        <div className="max-w-[1000px] mx-auto">
          {!result && (
            <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-[28px] sm:text-[42px] font-bold leading-[1.2] mb-4 tracking-tight">
                Your AGENTS.md is probably<br /><span className="text-[var(--accent,#a78bfa)]">sabotaging your agent.</span>
              </h1>
              <p className="text-[15px] text-[var(--text-secondary,#999)] max-w-[500px] mx-auto">Find out how.</p>
            </motion.div>
          )}

          <div className="mb-8">
            <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Paste your AGENTS.md or CLAUDE.md content here..." className="w-full p-5 rounded-2xl bg-[var(--bg-card,#111)] border border-[var(--border,#222)] text-[14px] mono text-[var(--text,#eee)] placeholder:text-[var(--text-dim,#444)] resize-y focus:outline-none focus:border-[var(--accent,#a78bfa)]/50 transition-colors" style={{ minHeight: result ? "100px" : "200px" }} />
            <div className="flex items-center justify-between mt-3">
              <span className="text-[12px] text-[var(--text-dim,#666)] mono">{input.length > 0 ? `${input.split("\n").length} lines` : ""}</span>
              <button onClick={handleAnalyze} disabled={!input.trim()} className="px-6 py-2.5 rounded-xl text-[14px] font-semibold bg-[var(--accent,#a78bfa)] text-black hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed">Analyze</button>
            </div>
          </div>

          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex gap-1 mb-8 overflow-x-auto pb-2 -mx-2 px-2">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] whitespace-nowrap transition-all ${activeTab === tab.id ? "bg-[var(--accent,#a78bfa)]/15 text-[var(--accent,#a78bfa)] font-medium" : "text-[var(--text-dim,#666)] hover:text-[var(--text-secondary,#999)] hover:bg-white/[0.03]"}`}>
                      <Icon className="w-3.5 h-3.5" />{tab.label}
                      {tab.id === "security" && result.securityScan.criticalCount > 0 && <span className="w-2 h-2 rounded-full bg-[#ef4444]" />}
                    </button>
                  );
                })}
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>{renderTab()}</motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
