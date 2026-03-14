"use client";

import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sparkles,
  Copy,
  Zap,
  Lock,
  Layers,
  Eye,
  Puzzle,
  Shield,
  Scale,
  Target,
  FileText,
} from "lucide-react";
import { useState } from "react";
import type { ReportData } from "../types";
import { getTier } from "../utils/getTier";
import { CATEGORY_META } from "../constants/category-meta";
import Histogram from "./Histogram";

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const cn = className || "w-4 h-4";
  switch (name) {
    case "Structure": return <Layers className={cn} />;
    case "Clarity": return <Eye className={cn} />;
    case "Completeness": return <Puzzle className={cn} />;
    case "Security": return <Shield className={cn} />;
    case "Consistency": return <Scale className={cn} />;
    case "Blueprint": return <Target className={cn} />;
    default: return <FileText className={cn} />;
  }
}

export default function OverviewTab({
  data,
  onTabChange,
}: {
  data: ReportData;
  onTabChange: (tab: string) => void;
}) {
  const tier = getTier(data.totalScore);
  const [copied, setCopied] = useState(false);

  const totalRules = Object.values(CATEGORY_META).reduce((sum, c) => sum + c.rules.length, 0);
  const passedRules = totalRules - data.diagnostics.length;
  const errors = data.diagnostics.filter((d) => d.severity === "critical" || d.severity === "error");
  const warnings = data.diagnostics.filter((d) => d.severity === "warning");

  const percentile = data.totalScore >= 98 ? 1 : data.totalScore >= 96 ? 3 : data.totalScore >= 93 ? 5 : data.totalScore >= 90 ? 8 : data.totalScore >= 85 ? 12 : data.totalScore >= 80 ? 18 : data.totalScore >= 75 ? 25 : data.totalScore >= 68 ? 35 : 50;

  // Token efficiency
  const tokenBudgetDiags = data.diagnostics.filter((d) => d.rule === "clarity/token-budget-range");
  const tokenFiles: { tokens: number; grade: string }[] = tokenBudgetDiags
    .map((d) => {
      const tokMatch = d.message?.match(/~([\d,]+)\s*estimated tokens/);
      const gradeMatch = d.message?.match(/Grade\s+([A-D])/);
      if (!tokMatch) return null;
      return { tokens: parseInt(tokMatch[1].replace(/,/g, ""), 10), grade: gradeMatch?.[1] || "?" };
    })
    .filter(Boolean) as { tokens: number; grade: string }[];
  const totalTokens = tokenFiles.reduce((s, f) => s + f.tokens, 0);
  const gradeOrder = ["A", "B", "C", "D"];
  const avgGradeIdx = tokenFiles.length > 0
    ? Math.round(tokenFiles.reduce((s, f) => s + gradeOrder.indexOf(f.grade), 0) / tokenFiles.length)
    : 0;
  const avgGrade = tokenFiles.length > 0 ? gradeOrder[Math.min(avgGradeIdx, 3)] : null;
  const potentialSavings = tokenFiles.length > 0
    ? Math.round(
        tokenFiles.reduce((s, f) => {
          if (f.grade === "B") return s + f.tokens * 0.3;
          if (f.grade === "C") return s + f.tokens * 0.5;
          if (f.grade === "D") return s + f.tokens * 0.6;
          return s;
        }, 0) / Math.max(totalTokens, 1) * 100
      )
    : 0;

  const shareText = `\u{1F9EC} AgentLinter Score: ${data.totalScore}/100\n\n\u2B50 ${tier.grade} tier \u00B7 Top ${percentile}%\n\nIs YOUR AI agent secure?\nFree & open source \u2014 try it yourself:\n\nnpx agentlinter\n\nhttps://agentlinter.com`;

  return (
    <div className="space-y-8 sm:space-y-10 animate-fade-in">
      {/* Score Hero */}
      <div className="text-center">
        <div className="inline-flex flex-col items-center">
          <span className="text-[96px] sm:text-[128px] font-black text-white leading-none display">
            {data.totalScore}
          </span>
          <div className="mt-2 flex items-center gap-3">
            <div
              className="px-6 py-2 rounded-2xl text-[32px] sm:text-[40px] font-bold mono"
              style={{ color: tier.color, backgroundColor: tier.bg }}
            >
              {tier.grade}
            </div>
          </div>
          <span className="mt-2 text-[18px] sm:text-[20px] font-medium" style={{ color: tier.color }}>
            {tier.label}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-5">
          <div className="text-[40px] sm:text-[48px] font-black mono leading-none text-[var(--red)]">
            {errors.length}
          </div>
          <div className="text-[13px] sm:text-[14px] text-[var(--text-dim)] mt-2">criticals</div>
        </div>
        <div className="text-center rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-5">
          <div className="text-[40px] sm:text-[48px] font-black mono leading-none text-[var(--amber)]">
            {warnings.length}
          </div>
          <div className="text-[13px] sm:text-[14px] text-[var(--text-dim)] mt-2">warnings</div>
        </div>
        <div className="text-center rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-5">
          <div className="text-[40px] sm:text-[48px] font-black mono leading-none text-[var(--green)]">
            {passedRules}
          </div>
          <div className="text-[13px] sm:text-[14px] text-[var(--text-dim)] mt-2">passed rules</div>
        </div>
      </div>

      {/* Category Bars */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-6">
        <div className="space-y-1">
          {data.categories.map((cat) => {
            const catTier = getTier(cat.score);
            const meta = CATEGORY_META[cat.name];
            if (!meta) return null;
            return (
              <div
                key={cat.name}
                onClick={() => onTabChange("categories")}
                className="flex items-center gap-4 h-12 cursor-pointer hover:bg-white/5 rounded-lg px-2 transition-colors"
              >
                <div className="flex items-center gap-2 w-[130px]">
                  <CategoryIcon name={cat.name} className="w-4 h-4 text-[var(--text-dim)]" />
                  <span className="text-[15px] sm:text-[16px] font-medium text-[var(--text-secondary)] truncate">
                    {cat.name}
                  </span>
                </div>
                <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ backgroundColor: catTier.color, width: `${cat.score}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[22px] sm:text-[24px] font-bold mono w-[50px] text-right" style={{ color: catTier.color }}>
                    {cat.score}
                  </span>
                  <span
                    className="text-[11px] mono px-2 py-0.5 rounded"
                    style={{ color: catTier.color, backgroundColor: catTier.bg }}
                  >
                    {catTier.grade}
                  </span>
                  <span className="text-[11px] mono text-[var(--text-dim)] w-[36px]">
                    \u00D7{meta.weight}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Token Efficiency */}
      {tokenFiles.length > 0 && (
        <div className="rounded-xl border border-[var(--green)]/20 bg-[var(--green)]/5 p-5 sm:p-6">
          <div className="text-[13px] font-medium text-[var(--green)] mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Token Efficiency
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <span>
              <span className="text-[24px] font-bold mono text-[var(--green)]">{totalTokens.toLocaleString()}</span>{" "}
              <span className="text-[13px] text-[var(--green)]/70">total tokens</span>
            </span>
            <span>
              <span className="text-[24px] font-bold mono text-[var(--green)]">{avgGrade}</span>{" "}
              <span className="text-[13px] text-[var(--green)]/70">avg grade</span>
            </span>
            {potentialSavings > 0 && (
              <span>
                <span className="text-[24px] font-bold mono text-[var(--green)]">~{potentialSavings}%</span>{" "}
                <span className="text-[13px] text-[var(--green)]/70">potential savings</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Primary CTA: Fix with AI */}
      {data.diagnostics.length > 0 && (
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="w-full rounded-xl bg-[var(--accent)] p-5 sm:p-6 flex items-center gap-4 text-left hover:brightness-110 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <Sparkles className="w-6 h-6 text-white shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[16px] font-semibold text-white">Fix issues with your AI agent</div>
            <div className="text-[13px] text-white/70 mt-0.5">Copy this report link and paste it to Claude, ChatGPT, or your favorite AI</div>
          </div>
          <div className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 text-white text-[14px] font-medium">
            <Copy className="w-4 h-4" />
            {copied ? "Copied!" : "Copy Link"}
          </div>
        </button>
      )}

      {/* Secondary CTA: Share on X */}
      <a
        href={`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
        target="_blank"
        className="w-full rounded-xl border border-[#1d9bf0]/40 p-4 flex items-center gap-3 hover:bg-[#1d9bf0]/5 transition-all"
      >
        <svg className="w-5 h-5 text-[#1d9bf0] shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span className="text-[15px] font-medium text-[#1d9bf0] flex-1">Share your score on X</span>
        <span className="shrink-0 text-[14px] font-medium text-[#1d9bf0] px-3 py-1.5 rounded-lg border border-[#1d9bf0]/30">
          Post on X
        </span>
      </a>

      {/* Score Distribution */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[14px] text-[var(--text-secondary)]">Where you stand among all scanned workspaces</span>
          <span className="text-[13px] mono" style={{ color: tier.color }}>Top {percentile}%</span>
        </div>
        <Histogram userScore={data.totalScore} />
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-white/3 p-3">
            <div className="text-[11px] mono text-[var(--text-dim)] mb-1">Median</div>
            <div className="text-[18px] font-bold mono text-[var(--text-secondary)]">64</div>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: tier.bg }}>
            <div className="text-[11px] mono text-[var(--text-dim)] mb-1">Your Score</div>
            <div className="text-[18px] font-bold mono" style={{ color: tier.color }}>{data.totalScore}</div>
          </div>
          <div className="rounded-lg bg-white/3 p-3">
            <div className="text-[11px] mono text-[var(--text-dim)] mb-1">Top 1%</div>
            <div className="text-[18px] font-bold mono text-[var(--text-secondary)]">98+</div>
          </div>
        </div>
      </div>

      {/* Privacy Note */}
      <div className="flex items-center gap-2 text-[13px] text-[var(--teal)] justify-center">
        <Lock className="w-3.5 h-3.5" />
        <span>Results only \u2014 your files never uploaded</span>
      </div>
    </div>
  );
}
