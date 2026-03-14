"use client";

import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Lightbulb,
  Zap,
  Layers,
  Eye,
  Puzzle,
  Shield,
  Scale,
  Target,
  FileText,
} from "lucide-react";
import type { ReportData } from "../types";
import { getTier } from "../utils/getTier";
import { CATEGORY_META } from "../constants/category-meta";
import { RULE_EDUCATION } from "../constants/rule-education";
import Collapsible from "./Collapsible";
import CodeBlock from "./CodeBlock";

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

function SeverityIcon({ severity }: { severity: string }) {
  if (severity === "critical" || severity === "error") return <AlertCircle className="w-4 h-4 text-[var(--red)]" />;
  if (severity === "warning") return <AlertTriangle className="w-4 h-4 text-[var(--amber)]" />;
  return <Info className="w-4 h-4 text-[var(--text-dim)]" />;
}

export default function CategoriesTab({ data }: { data: ReportData }) {
  return (
    <div className="space-y-5 animate-fade-in">
      <p className="text-[14px] text-[var(--text-secondary)]">
        Each category evaluates a different dimension of your agent workspace. Click to expand and see every rule checked, what passed, what flagged, and why each rule exists.
      </p>

      {data.categories.map((cat) => {
        const catTier = getTier(cat.score);
        const meta = CATEGORY_META[cat.name];
        if (!meta) return null;
        const catDiagnostics = data.diagnostics.filter(
          (d) => d.category === cat.name.toLowerCase()
        );
        const flaggedRules = new Set(catDiagnostics.map((d) => d.rule));

        return (
          <Collapsible
            key={cat.name}
            title={cat.name}
            icon={<CategoryIcon name={cat.name} className="w-5 h-5" />}
            badge={
              <div className="flex items-center gap-2">
                <span className="text-[24px] sm:text-[28px] font-bold mono" style={{ color: catTier.color }}>
                  {cat.score}
                </span>
                <span
                  className="text-[11px] mono px-2 py-0.5 rounded-md"
                  style={{ color: catTier.color, backgroundColor: catTier.bg }}
                >
                  {catTier.grade} \u00B7 {meta.weight}% weight
                </span>
              </div>
            }
            defaultOpen={cat.score < 100}
          >
            <div className="space-y-6 pt-4">
              {/* Description */}
              <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">{meta.description}</p>

              {/* Why It Matters */}
              <div className="rounded-lg bg-[var(--accent-glow)] border border-[var(--accent-dim)] p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-[var(--accent)]" />
                  <span className="text-[13px] font-semibold text-[var(--accent)] uppercase tracking-wider">Why This Matters</span>
                </div>
                <p className="text-[14px] text-[var(--text)] leading-relaxed">{meta.whyItMatters}</p>
              </div>

              {/* Rules Checklist */}
              <div>
                <h4 className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                  Rules Checked ({meta.rules.length})
                </h4>
                <div className="space-y-1">
                  {meta.rules.map((rule) => {
                    const isFlagged = flaggedRules.has(rule.id);
                    const diagnostic = catDiagnostics.find((d) => d.rule === rule.id);
                    return (
                      <div
                        key={rule.id}
                        className="flex items-start gap-2.5 py-3 px-3 rounded-lg"
                        style={{ backgroundColor: isFlagged ? "rgba(255,255,255,0.02)" : "transparent" }}
                      >
                        {isFlagged ? (
                          <span className="mt-0.5">
                            {rule.severity === "critical" || rule.severity === "error" ? (
                              <AlertCircle className="w-4 h-4 text-[var(--red)]" />
                            ) : rule.severity === "warning" ? (
                              <AlertTriangle className="w-4 h-4 text-[var(--amber)]" />
                            ) : (
                              <Info className="w-4 h-4 text-[var(--text-dim)]" />
                            )}
                          </span>
                        ) : (
                          <CheckCircle2 className="w-4 h-4 mt-0.5 text-[var(--green)]" />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className={`text-[14px] ${isFlagged ? "text-[var(--text)]" : "text-[var(--text-secondary)]"}`}>
                            {rule.description}
                          </span>
                          <div className="text-[11px] mono text-[var(--text-dim)] mt-0.5">{rule.id}</div>
                          {diagnostic && (
                            <p className="text-[13px] text-[var(--text-secondary)] mt-1">
                              \u2192 {diagnostic.message.length > 120 ? diagnostic.message.substring(0, 120) + "..." : diagnostic.message}
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
                  <h4 className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                    Flagged Issues ({catDiagnostics.length})
                  </h4>
                  <div className="space-y-4">
                    {catDiagnostics.map((d, i) => {
                      const education = RULE_EDUCATION[d.rule];
                      return (
                        <div key={i} className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-5">
                          <div className="flex items-start gap-3 mb-2">
                            <SeverityIcon severity={d.severity} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[13px] mono text-[var(--text-secondary)]">
                                  {d.file}{d.line ? `:${d.line}` : ""}
                                </span>
                                <span className="text-[11px] mono px-1.5 py-0.5 rounded bg-white/5 text-[var(--text-dim)]">
                                  {d.rule}
                                </span>
                              </div>
                              <p className="text-[14px] text-[var(--text)] mt-1">{d.message}</p>
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
              )}

              {/* Perfect score message */}
              {catDiagnostics.length === 0 && (
                <div className="flex items-center gap-3 py-4 px-5 rounded-lg bg-[var(--green)]/5 border border-[var(--green)]/10">
                  <CheckCircle2 className="w-6 h-6 text-[var(--green)]" />
                  <div>
                    <p className="text-[14px] text-[var(--green)] font-medium">Perfect score \u2014 all {meta.rules.length} rules passed</p>
                    <p className="text-[13px] text-[var(--text-secondary)]">
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
  );
}
