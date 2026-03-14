"use client";

export default function Histogram({ userScore }: { userScore: number }) {
  // Gaussian bell curve approximating score distribution (mean=64, sd=14)
  const WIDTH = 400;
  const HEIGHT = 100;
  const MEAN = 64;
  const SD = 14;

  const gaussian = (x: number) =>
    Math.exp(-0.5 * Math.pow((x - MEAN) / SD, 2));

  // Build smooth SVG path (0–100)
  const points: [number, number][] = [];
  for (let x = 0; x <= 100; x++) {
    const svgX = (x / 100) * WIDTH;
    const svgY = HEIGHT - gaussian(x) * (HEIGHT - 10);
    points.push([svgX, svgY]);
  }

  const pathD =
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ") +
    ` L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`;

  // Area under curve up to userScore (filled region)
  const fillPoints: [number, number][] = [];
  for (let x = 0; x <= userScore; x++) {
    const svgX = (x / 100) * WIDTH;
    const svgY = HEIGHT - gaussian(x) * (HEIGHT - 10);
    fillPoints.push([svgX, svgY]);
  }
  const fillD =
    fillPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ") +
    ` L ${((userScore / 100) * WIDTH).toFixed(1)} ${HEIGHT} L 0 ${HEIGHT} Z`;

  // User score marker X position
  const markerX = (userScore / 100) * WIDTH;
  const markerY = HEIGHT - gaussian(userScore) * (HEIGHT - 10);

  // Mean marker
  const meanX = (MEAN / 100) * WIDTH;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        style={{ height: 100, overflow: "visible" }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="curve-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.07)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.01)" />
          </linearGradient>
          <linearGradient id="user-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Full curve fill */}
        <path d={pathD} fill="url(#curve-fill)" />

        {/* User score fill (left of marker) */}
        <path d={fillD} fill="url(#user-fill)" />

        {/* Full curve stroke */}
        <path
          d={points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1.5"
        />

        {/* Mean dotted line */}
        <line
          x1={meanX} y1="8" x2={meanX} y2={HEIGHT}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
        <text x={meanX + 3} y="14" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="monospace">
          avg
        </text>

        {/* User score vertical line */}
        <line
          x1={markerX} y1={markerY - 2} x2={markerX} y2={HEIGHT}
          stroke="var(--accent)"
          strokeWidth="1.5"
        />

        {/* User score dot */}
        <circle cx={markerX} cy={markerY} r="4" fill="var(--accent)" />
        <circle cx={markerX} cy={markerY} r="7" fill="var(--accent)" fillOpacity="0.2" />
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between mt-1 px-0">
        {[0, 20, 40, 60, 80, 100].map((v) => (
          <span
            key={v}
            className="text-[10px] mono"
            style={{ color: Math.abs(v - userScore) < 12 ? "var(--accent)" : "var(--text-dim)" }}
          >
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}
