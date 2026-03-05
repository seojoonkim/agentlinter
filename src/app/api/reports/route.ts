import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { nanoid } from "nanoid";

// Rate limit: simple in-memory (resets on cold start, fine for MVP)
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // per minute per IP
const RATE_WINDOW = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// Validate incoming report data
function validateReport(data: any): string | null {
  if (typeof data.score !== "number" || data.score < 0 || data.score > 100) {
    return "Invalid score";
  }
  if (!Array.isArray(data.categories) || data.categories.length === 0) {
    return "Invalid categories";
  }
  if (!Array.isArray(data.diagnostics)) {
    return "Invalid diagnostics";
  }
  if (!Array.isArray(data.fileNames)) {
    return "Invalid fileNames";
  }
  if (typeof data.machineId !== "string" || data.machineId.length < 5 || data.machineId.length > 50) {
    return "Invalid machineId";
  }
  // Limit sizes to prevent abuse
  if (data.diagnostics.length > 500) {
    return "Too many diagnostics (max 500)";
  }
  if (data.fileNames.length > 1000) {
    return "Too many files (max 1000)";
  }
  if (JSON.stringify(data).length > 500_000) {
    return "Payload too large (max 500KB)";
  }
  return null;
}

// Sanitize diagnostics: ensure no raw file content leaks
function sanitizeDiagnostics(diagnostics: any[]): any[] {
  return diagnostics.map((d) => ({
    severity: String(d.severity || "info").slice(0, 10),
    category: String(d.category || "").slice(0, 30),
    rule: String(d.rule || "").slice(0, 80),
    file: String(d.file || "").slice(0, 200),
    line: typeof d.line === "number" ? d.line : undefined,
    message: String(d.message || "").slice(0, 500),
    fix: d.fix ? String(d.fix).slice(0, 500) : undefined,
  }));
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Rate limited. Try again in 1 minute." }, { status: 429 });
    }

    const body = await req.json();
    const validationError = validateReport(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const id = nanoid(12);

    const { error } = await supabase.from("reports").insert({
      id,
      machine_id: body.machineId,
      score: body.score,
      categories: body.categories,
      diagnostics: sanitizeDiagnostics(body.diagnostics),
      file_names: body.fileNames,
      files_scanned: body.fileNames.length,
      rules_checked: body.rulesChecked || 0,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to save report" }, { status: 500 });
    }

    return NextResponse.json({
      id,
      url: `https://agentlinter.com/r/${id}`,
    });
  } catch (e) {
    console.error("Report API error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
