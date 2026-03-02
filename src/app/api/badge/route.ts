import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const score = parseInt(searchParams.get("score") || "0", 10);
  const label = searchParams.get("label") || "AgentLinter";

  let color = "red";
  if (score >= 90) color = "brightgreen";
  else if (score >= 70) color = "yellow";
  else if (score >= 50) color = "orange";

  return NextResponse.json(
    {
      schemaVersion: 1,
      label,
      message: `${score}/100`,
      color,
    },
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    }
  );
}
