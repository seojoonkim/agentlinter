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
  const tier = getTier(score);

  return (
    <div className="sticky top-[56px] z-40 bg-[var(--bg)] border-b border-[var(--border)]">
      <div className="max-w-[760px] mx-auto px-4 sm:px-6">
        <div
          className="flex overflow-x-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {TABS.map((tab) => {
            const Icon = tab.Icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-1.5 px-4 py-3.5 whitespace-nowrap shrink-0
                  text-[13px] sm:text-[14px] transition-colors
                  border-b-2
                  ${isActive
                    ? "font-semibold text-white"
                    : "font-medium text-white/35 hover:text-white/60 border-transparent"
                  }
                `}
                style={isActive ? { borderBottomColor: tier.color } : {}}
              >
                <Icon
                  className="w-3.5 h-3.5 shrink-0"
                  style={isActive ? { color: tier.color } : { opacity: 0.35 }}
                />
                {tab.label}
                {tab.id === "diagnostics" && diagnosticCount > 0 && (
                  <span className="ml-1 text-[11px] mono px-1.5 py-0.5 rounded-full bg-[var(--red)]/20 text-[var(--red)]">
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
