"use client";

import { Target, AlertCircle, BookOpen, Zap } from "lucide-react";
import { getTier } from "../utils/getTier";

const TABS = [
  { id: "overview", label: "Overview", Icon: Target },
  { id: "diagnostics", label: "Diagnostics", Icon: AlertCircle },
  { id: "categories", label: "Categories", Icon: BookOpen },
  { id: "methodology", label: "How It Works", Icon: Zap },
] as const;

export default function TabBar({
  activeTab,
  setActiveTab,
  diagnosticCount,
  score,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  diagnosticCount: number;
  score: number;
}) {
  const activeIndex = Math.max(TABS.findIndex((tab) => tab.id === activeTab), 0);
  const tier = getTier(score);

  return (
    <div className="sticky top-[56px] z-40 bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--border)]">
      <div className="max-w-[760px] mx-auto px-4 sm:px-6">
        <div
          className="relative grid grid-cols-4 gap-1 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div
            className="pointer-events-none absolute bottom-0 left-0 h-full w-1/4 rounded-t-lg bg-white/5 transition-transform duration-300 ease-out"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-1/4 transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(${activeIndex * 100}%)`,
              background: `linear-gradient(90deg, ${tier.color}00 0%, ${tier.color} 28%, ${tier.color} 72%, ${tier.color}00 100%)`,
            }}
          />
          {TABS.map((tab) => {
            const Icon = tab.Icon;
            const isActive = activeTab === tab.id;
            return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative z-10 flex items-center justify-center gap-2 px-5 py-3.5 whitespace-nowrap
                text-[14px] sm:text-[15px] font-medium
                transition-colors shrink-0 rounded-t-lg
                ${isActive
                  ? "text-white bg-white/5"
                  : "text-[var(--text-dim)] hover:text-[var(--text-secondary)]"
                }
              `}
            >
              <Icon className="w-4 h-4 transition-colors" style={isActive ? { color: tier.color } : undefined} />
              {tab.label}
              {tab.id === "diagnostics" && diagnosticCount > 0 && (
                <span className="ml-1.5 text-[11px] mono px-1.5 py-0.5 rounded-full bg-[var(--red)]/20 text-[var(--red)]">
                  {diagnosticCount}
                </span>
              )}
            </button>
          );
          })}
        </div>
      </div>
    </div>
  );
}
