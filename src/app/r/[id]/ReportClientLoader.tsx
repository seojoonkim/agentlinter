"use client";

import dynamic from "next/dynamic";
import type { ReportData } from "./ReportClient";

const ReportPage = dynamic(() => import("./ReportClient"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center text-[var(--text-dim)]">
      Loading report...
    </div>
  ),
});

export default function ReportClientLoader({ data }: { data: ReportData }) {
  return <ReportPage data={data} />;
}
