"use client";

import { Target, AlertCircle, BookOpen, Zap } from "lucide-react";

const TABS = [
  { id: "overview", label: "Overview", icon: <Target className="w-4 h-4" /> },
  { id: "diagnostics", label: "Diagnostics", icon: <AlertCircle className="w-4 h-4" /> },
  { id: "categories", label: "Categories", icon: <BookOpen className="w-4 h-4" /> },
  { id: "methodology", label: "How It Works", icon: <Zap className="w-4 h-4" /> },
] as const;

export default function TabBar({
  activeTab,
  setActiveTab,
  diagnosticCount,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  diagnosticCount: number;
}) {
  return (
    <div className="sticky top-[56px] z-40 bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--border)]">
      <div className="max-w-[760px] mx-auto px-4 sm:px-6">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 whitespace-nowrap
                text-[14px] sm:text-[15px] font-medium
                transition-colors shrink-0
                ${activeTab === tab.id
                  ? "text-white border-b-2 border-[var(--accent)]"
                  : "text-[var(--text-dim)] hover:text-[var(--text-secondary)]"
                }
              `}
            >
              {tab.icon}
              {tab.label}
              {tab.id === "diagnostics" && diagnosticCount > 0 && (
                <span className="ml-1.5 text-[11px] mono px-1.5 py-0.5 rounded-full bg-[var(--red)]/20 text-[var(--red)]">
                  {diagnosticCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
