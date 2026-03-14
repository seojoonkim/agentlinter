"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function Collapsible({ title, children, defaultOpen = false, badge, icon }: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-[var(--border)] rounded-xl bg-[var(--bg-card)] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 sm:px-6 py-4 sm:py-5 hover:bg-[var(--bg-card-hover)] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {icon}
          <span className="text-[15px] sm:text-[16px] font-semibold">{title}</span>
          {badge}
        </div>
        <ChevronDown
          className="w-4 h-4 text-[var(--text-dim)] transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
        />
      </button>
      {open && (
        <div className="overflow-hidden border-t border-[var(--border)]">
          <div className="px-4 sm:px-6 pb-5 sm:pb-6">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
