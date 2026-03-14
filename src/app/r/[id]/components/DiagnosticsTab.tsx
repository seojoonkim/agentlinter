"use client";

import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Zap,
  Sparkles,
  Copy,
} from "lucide-react";
import { useState } from "react";
import type { ReportData } from "../types";
import { CATEGORY_META } from "../constants/category-meta";
import { RULE_EDUCATION } from "../constants/rule-education";
import CodeBlock from "./CodeBlock";

function SeverityIcon({ severity }: { severity: string }) {
  if (severity === "critical" || severity === "error") return <AlertCircle className="w-5 h-5 shrink-0 text-[var(--red)]" />;
  if (severity === "warning") return <AlertTriangle className="w-5 h-5 shrink-0 text-[var(--amber)]" />;
  return <Info className="w-5 h-5 shrink-0 text-[var(--text-dim)]" />;
}

type SeverityFilter = "critical" | "warning" | "info";

export default function DiagnosticsTab({ data }: { data: ReportData }) {
  const [filters, setFilters] = useState<Set<SeverityFilter>>(new Set(["critical", "warning", "info"]));
  const [copiedLink, setCopiedLink] = useState(false);

  const totalRules = Object.values(CATEGORY_META).reduce((sum, c) => sum + c.rules.length, 0);

  const toggleFilter = (f: SeverityFilter) => {
    const next = new Set(filters);
    if (next.has(f)) {
      if (next.size > 1) next.delete(f);
    } else {
      next.add(f);
    }
    setFilters(next);
  };

  const filtered = data.diagnostics.filter((d) => {
    const sev = (d.severity === "error" ? "critical" : d.severity) as SeverityFilter;
    return filters.has(sev);
  });

  const criticalCount = data.diagnostics.filter((d) => d.severity === "critical" || d.severity === "error").length;
  const warningCount = data.diagnostics.filter((d) => d.severity === "warning").length;
  const infoCount = data.diagnostics.filter((d) => d.severity === "info").length;

  if (data.diagnostics.length === 0) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20 text-center">
        <CheckCircle2 className="w-16 h-16 text-[var(--green)] mb-4" />
        <div className="text-[32px] font-bold text-[var(--green)]">Zero issues</div>
        <p className="text-[14px] text-[var(--text-secondary)] mt-2">
          All {totalRules} rules passed without any flags.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Fix CTA banner */}
      {criticalCount > 0 && (
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
          }}
          className="w-full rounded-xl bg-[var(--accent)] p-4 flex items-center gap-3 text-left hover:brightness-110 transition-all"
        >
          <Sparkles className="w-5 h-5 text-white shrink-0" />
          <span className="text-[15px] font-medium text-white flex-1">Fix all {data.diagnostics.length} issues with AI</span>
          <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 text-white text-[13px] font-medium">
            <Copy className="w-3.5 h-3.5" />
            {copiedLink ? "Copied!" : "Copy Link"}
          </span>
        </button>
      )}

      {/* Filter bar */}
      <div className="flex gap-2">
        <button
          onClick={() => toggleFilter("critical")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] mono font-medium transition-all ${
            filters.has("critical")
              ? "bg-[var(--red)]/15 text-[var(--red)] ring-1 ring-[var(--red)]/30"
              : "bg-white/5 text-[var(--text-dim)]"
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          {criticalCount} critical{criticalCount !== 1 ? "s" : ""}
        </button>
        <button
          onClick={() => toggleFilter("warning")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] mono font-medium transition-all ${
            filters.has("warning")
              ? "bg-[var(--amber)]/15 text-[var(--amber)] ring-1 ring-[var(--amber)]/30"
              : "bg-white/5 text-[var(--text-dim)]"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          {warningCount} warning{warningCount !== 1 ? "s" : ""}
        </button>
        <button
          onClick={() => toggleFilter("info")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] mono font-medium transition-all ${
            filters.has("info")
              ? "bg-white/10 text-[var(--text-secondary)] ring-1 ring-white/20"
              : "bg-white/5 text-[var(--text-dim)]"
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          {infoCount} info
        </button>
      </div>

      {/* Issue cards */}
      <div className="space-y-3">
        {filtered.map((d, i) => {
          const education = RULE_EDUCATION[d.rule];
          return (
            <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
              <div className="flex items-start gap-3">
                <SeverityIcon severity={d.severity} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[13px] mono text-[var(--text-secondary)]">
                      {d.file}{d.line ? `:${d.line}` : ""}
                    </span>
                    <span className="text-[11px] mono px-1.5 py-0.5 rounded bg-white/5 text-[var(--text-dim)]">
                      {d.rule}
                    </span>
                    <span className={`text-[11px] mono px-1.5 py-0.5 rounded ${
                      d.severity === "critical" || d.severity === "error" ? "bg-[var(--red)]/10 text-[var(--red)]" :
                      d.severity === "warning" ? "bg-[var(--amber)]/10 text-[var(--amber)]" :
                      "bg-white/5 text-[var(--text-dim)]"
                    }`}>
                      {d.severity}
                    </span>
                  </div>
                  <p className="text-[14px] text-[var(--text)]">{d.message}</p>
                </div>
              </div>

              {d.fix && (
                <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-[var(--green)]/5 border border-[var(--green)]/10">
                  <Zap className="w-3.5 h-3.5 mt-0.5 text-[var(--green)] shrink-0" />
                  <span className="text-[13px] text-[var(--green)]">
                    <strong>Fix:</strong> {d.fix}
                  </span>
                </div>
              )}

              {education && (
                <div className="mt-3 space-y-2">
                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                    {education.impact}
                  </p>
                  {education.example && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      <CodeBlock code={education.example.bad} label="\u274C Before" />
                      <CodeBlock code={education.example.good} label="\u2705 After" />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
