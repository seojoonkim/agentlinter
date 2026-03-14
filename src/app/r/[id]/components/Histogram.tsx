"use client";

export default function Histogram({ userScore }: { userScore: number }) {
  const bins = [
    { range: "0\u201329", count: 3, min: 0, max: 29 },
    { range: "30\u201339", count: 5, min: 30, max: 39 },
    { range: "40\u201349", count: 12, min: 40, max: 49 },
    { range: "50\u201359", count: 22, min: 50, max: 59 },
    { range: "60\u201369", count: 35, min: 60, max: 69 },
    { range: "70\u201379", count: 28, min: 70, max: 79 },
    { range: "80\u201389", count: 15, min: 80, max: 89 },
    { range: "90\u2013100", count: 6, min: 90, max: 100 },
  ];
  const max = Math.max(...bins.map((b) => b.count));
  const activeBin = bins.findIndex((b) => userScore >= b.min && userScore <= b.max);

  return (
    <div>
      <div className="flex items-end gap-1 h-[80px]">
        {bins.map((bin, i) => {
          const height = (bin.count / max) * 100;
          const isActive = i === activeBin;
          return (
            <div key={bin.range} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] mono" style={{ color: isActive ? "var(--accent)" : "var(--text-dim)" }}>
                {bin.count}
              </span>
              <div
                className="w-full rounded-sm transition-all"
                style={{
                  height: `${height}%`,
                  backgroundColor: isActive ? "var(--accent)" : "rgba(255,255,255,0.06)",
                  minHeight: "3px",
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1 mt-1.5">
        {bins.map((bin, i) => (
          <div
            key={bin.range}
            className="flex-1 text-center text-[10px] mono"
            style={{ color: i === activeBin ? "var(--accent)" : "var(--text-dim)" }}
          >
            {bin.range}
          </div>
        ))}
      </div>
    </div>
  );
}
