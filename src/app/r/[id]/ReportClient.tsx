"use client";

import {
  Share2,
  Github,
} from "lucide-react";
import { useState } from "react";
import { getTier } from "./utils/getTier";
import TabBar from "./components/TabBar";
import OverviewTab from "./components/OverviewTab";
import DiagnosticsTab from "./components/DiagnosticsTab";
import CategoriesTab from "./components/CategoriesTab";
import MethodologyTab from "./components/MethodologyTab";

import type { ReportData } from "./types";
export type { ReportData } from "./types";

/* ─── Logo ─── */
function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M10 4 C10 9, 22 11, 22 16 C22 21, 10 23, 10 28" stroke="url(#lg)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M22 4 C22 9, 10 11, 10 16 C10 21, 22 23, 22 28" stroke="#5eead4" strokeWidth="2" strokeLinecap="round" fill="none" />
      <line x1="12" y1="8" x2="20" y2="8" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <line x1="14" y1="12.5" x2="18" y2="12.5" stroke="currentColor" strokeWidth="1" opacity="0.15" />
      <line x1="14" y1="19.5" x2="18" y2="19.5" stroke="currentColor" strokeWidth="1" opacity="0.15" />
      <line x1="12" y1="24" x2="20" y2="24" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <circle cx="16" cy="10.5" r="1.5" fill="#a78bfa" />
      <circle cx="16" cy="16" r="2" fill="#5eead4" />
      <circle cx="16" cy="21.5" r="1.5" fill="#a78bfa" />
      <defs>
        <linearGradient id="lg" x1="10" y1="4" x2="22" y2="28">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Main Report Page ─── */
export default function ReportPage({ data }: { data: ReportData }) {
  const tier = getTier(data.totalScore);
  const [activeTab, setActiveTab] = useState("overview");

  const percentile = data.totalScore >= 98 ? 1 : data.totalScore >= 96 ? 3 : data.totalScore >= 93 ? 5 : data.totalScore >= 90 ? 8 : data.totalScore >= 85 ? 12 : data.totalScore >= 80 ? 18 : data.totalScore >= 75 ? 25 : data.totalScore >= 68 ? 35 : 50;

  const shareText = `\u{1F9EC} AgentLinter Score: ${data.totalScore}/100\n\n\u2B50 ${tier.grade} tier \u00B7 Top ${percentile}%\n\nIs YOUR AI agent secure?\nFree & open source \u2014 try it yourself:\n\nnpx agentlinter\n\nhttps://agentlinter.com`;
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="min-h-screen bg-[var(--bg)] noise">
      {/* Nav */}
      <nav className="border-b border-[var(--border)] sticky top-0 bg-[var(--bg)]/80 backdrop-blur-xl z-50">
        <div className="max-w-[760px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <Logo size={20} />
            <span className="font-semibold text-[14px]">AgentLinter</span>
            <span className="text-[11px] mono text-[var(--text-dim)] ml-1">Report</span>
          </a>
          <div className="flex items-center gap-3">
            <a
              href={shareUrl}
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all hover:brightness-125"
              style={{ backgroundColor: tier.bg, color: tier.color }}
            >
              <Share2 className="w-3 h-3" />
              Share
            </a>
            <a
              href="https://github.com/seojoonkim/agentlinter"
              target="_blank"
              className="text-[var(--text-dim)] hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </nav>

      {/* TabBar */}
      <TabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        diagnosticCount={data.diagnostics.length}
        score={data.totalScore}
      />

      {/* Content */}
      <main className="max-w-[760px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-10">
        <div key={activeTab} className="animate-fade-in">
          {activeTab === "overview" && (
            <OverviewTab data={data} onTabChange={setActiveTab} />
          )}
          {activeTab === "diagnostics" && (
            <DiagnosticsTab data={data} />
          )}
          {activeTab === "categories" && (
            <CategoriesTab data={data} />
          )}
          {activeTab === "methodology" && (
            <MethodologyTab data={data} />
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between text-[12px] text-[var(--text-dim)]">
          <div className="flex items-center gap-2">
            <Logo size={14} />
            <span>AgentLinter</span>
            <span className="text-[10px] mono">v0.1.0</span>
          </div>
          <span className="mono">{new Date(data.timestamp).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
        </div>
      </main>
    </div>
  );
}
