"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export default function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative rounded-lg bg-[var(--bg)] border border-[var(--border)] overflow-hidden">
      {label && (
        <div className="px-3 py-1.5 border-b border-[var(--border)] text-[11px] mono text-[var(--text-dim)] uppercase tracking-wider">
          {label}
        </div>
      )}
      <pre className="px-3 py-2.5 text-[13px] mono leading-relaxed overflow-x-auto text-[var(--text-secondary)]">
        {code}
      </pre>
      <button
        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
      >
        {copied ? <Check className="w-3 h-3 text-[var(--green)]" /> : <Copy className="w-3 h-3 text-[var(--text-dim)]" />}
      </button>
    </div>
  );
}
