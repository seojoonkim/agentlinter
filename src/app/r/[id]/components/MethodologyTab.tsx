"use client";

import {
  Target,
  CheckCircle2,
  Info,
  FileText,
  Lock,
} from "lucide-react";
import type { ReportData } from "../types";
import { getTier } from "../utils/getTier";
import { CATEGORY_META } from "../constants/category-meta";
import { SCORING_METHODOLOGY } from "../constants/scoring";

export default function MethodologyTab({ data }: { data: ReportData }) {
  const tier = getTier(data.totalScore);

  return (
    <div className="space-y-8 sm:space-y-10 animate-fade-in">
      {/* Grade Scale */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-[var(--accent)]" />
          <span className="text-[18px] sm:text-[20px] font-semibold">Grade Scale</span>
        </div>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 text-center">
          {[
            { grade: "S", min: "98+", color: "#c084fc" },
            { grade: "A+", min: "96", color: "#a78bfa" },
            { grade: "A", min: "93", color: "#818cf8" },
            { grade: "A-", min: "90", color: "#60a5fa" },
            { grade: "B+", min: "85", color: "#34d399" },
            { grade: "B", min: "80", color: "#4ade80" },
            { grade: "B-", min: "75", color: "#a3e635" },
            { grade: "C+", min: "68", color: "#fbbf24" },
            { grade: "C", min: "60", color: "#f59e0b" },
            { grade: "C-", min: "55", color: "#fb923c" },
            { grade: "D", min: "50", color: "#ef4444" },
            { grade: "F", min: "<50", color: "#991b1b" },
          ].map((g) => (
            <div
              key={g.grade}
              className={`py-2 px-1 rounded-lg text-[11px] mono ${tier.grade === g.grade ? "ring-2 ring-white/30" : ""}`}
              style={{ backgroundColor: `${g.color}18`, color: g.color }}
            >
              <div className="font-bold text-[13px]">{g.grade}</div>
              <div className="opacity-70 text-[10px]">{g.min}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[13px] text-[var(--text-dim)] leading-relaxed">
          <strong>90+</strong> = Production-ready &middot; <strong>80-89</strong> = Good with minor fixes &middot; <strong>70-79</strong> = Needs attention &middot; <strong>&lt;70</strong> = Significant improvements needed
        </p>
      </div>

      {/* Scoring Formula */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 sm:p-6 space-y-6">
        {/* Base score */}
        <div>
          <h3 className="text-[18px] sm:text-[20px] font-semibold mb-2">Base Score</h3>
          <p className="text-[14px] text-[var(--text-secondary)]">{SCORING_METHODOLOGY.base}</p>
        </div>

        {/* Deductions */}
        <div>
          <h3 className="text-[18px] sm:text-[20px] font-semibold mb-3">Deductions</h3>
          <div className="space-y-3">
            {SCORING_METHODOLOGY.deductions.map((d) => (
              <div key={d.severity} className="flex items-start gap-3">
                <div
                  className="flex items-center justify-center w-[48px] h-[32px] rounded-lg mono text-[14px] font-bold shrink-0"
                  style={{ color: d.color, backgroundColor: `color-mix(in srgb, ${d.color} 12%, transparent)` }}
                >
                  {d.points}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[14px] font-medium" style={{ color: d.color }}>{d.severity}</span>
                  <span className="text-[13px] text-[var(--text-dim)] ml-2 break-words">{d.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bonuses */}
        <div>
          <h3 className="text-[18px] sm:text-[20px] font-semibold mb-3">Bonus Points</h3>
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-[13px]">
            {SCORING_METHODOLOGY.bonuses.map((b) => (
              <div key={b.category} className="contents">
                <span className="text-[var(--green)] mono font-medium whitespace-nowrap">{b.category}</span>
                <span className="text-[var(--text-secondary)]">{b.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Formula */}
        <div className="rounded-lg bg-[var(--bg)] border border-[var(--border)] p-5">
          <h3 className="text-[13px] font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-3">Final Score Formula</h3>
          <code className="text-[16px] text-[var(--accent)]">
            Total = \u03A3 (category_score \u00D7 category_weight)
          </code>
          <div className="mt-4 text-[13px] mono text-[var(--text-dim)] space-y-1.5">
            {data.categories.map((cat) => {
              const meta = CATEGORY_META[cat.name];
              if (!meta) return null;
              return (
                <div key={cat.name} className="flex gap-2">
                  <span className="text-[var(--text-secondary)]">{cat.name}:</span>
                  <span>{cat.score} \u00D7 {meta.weight / 100} = {(cat.score * meta.weight / 100).toFixed(1)}</span>
                </div>
              );
            })}
            <div className="border-t border-[var(--border)] pt-2 mt-2 flex gap-2 font-medium text-[var(--accent)]">
              <span>Total:</span>
              <span>
                {data.categories.reduce((s, c) => {
                  const meta = CATEGORY_META[c.name];
                  return s + (meta ? c.score * meta.weight / 100 : 0);
                }, 0).toFixed(1)} \u2248 {data.totalScore}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Files Scanned */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-[var(--accent)]" />
          <span className="text-[18px] sm:text-[20px] font-semibold">Files Scanned ({data.filesScanned})</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {data.files.map((f) => {
            const issues = data.diagnostics.filter((d) => d.file === f);
            const hasIssue = issues.length > 0;
            return (
              <div
                key={f}
                className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-white/3 transition-colors"
              >
                {hasIssue ? (
                  <Info className="w-3.5 h-3.5 shrink-0 text-[var(--text-dim)]" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[var(--green)]" />
                )}
                <span className="text-[13px] mono text-[var(--text-secondary)] truncate">{f}</span>
                {hasIssue && (
                  <span className="text-[11px] mono text-[var(--text-dim)] ml-auto shrink-0">
                    {issues.length} issue{issues.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Privacy Note */}
      <div className="rounded-xl border border-[var(--teal-dim)] bg-[var(--teal-dim)] p-5 flex items-start gap-3">
        <Lock className="w-4 h-4 text-[var(--teal)] mt-0.5 shrink-0" />
        <div className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
          <span className="font-medium text-[var(--teal)]">Results only \u2014 files never uploaded.</span> AgentLinter scans 100% locally. This report contains only scores and diagnostic messages. Your actual file contents (CLAUDE.md, SOUL.md, etc.) never leave your machine.{" "}
          <a href="https://agentlinter.com/#privacy" className="text-[var(--teal)] hover:underline">Learn more \u2192</a>
        </div>
      </div>
    </div>
  );
}
