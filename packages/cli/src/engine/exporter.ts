/* ─── Multi-Framework Exporter (v2.2.0) ─── */

import fs from "node:fs";
import path from "node:path";

export type ExportFormat = "cursor" | "copilot" | "gemini";

interface ExportResult {
  format: ExportFormat;
  outputPath: string;
  content: string;
}

/**
 * Read CLAUDE.md or AGENTS.md from workspace and convert to target format
 */
export function exportConfig(
  workspaceDir: string,
  format: ExportFormat
): ExportResult {
  // Find source file
  const candidates = ["CLAUDE.md", "AGENTS.md", "SOUL.md"];
  let sourceContent = "";
  let sourceName = "";

  for (const candidate of candidates) {
    const filePath = path.join(workspaceDir, candidate);
    if (fs.existsSync(filePath)) {
      sourceContent += fs.readFileSync(filePath, "utf-8") + "\n\n";
      if (!sourceName) sourceName = candidate;
    }
  }

  if (!sourceContent.trim()) {
    throw new Error("No agent config files found (CLAUDE.md, AGENTS.md, SOUL.md)");
  }

  switch (format) {
    case "cursor":
      return exportToCursor(workspaceDir, sourceContent, sourceName);
    case "copilot":
      return exportToCopilot(workspaceDir, sourceContent, sourceName);
    case "gemini":
      return exportToGemini(workspaceDir, sourceContent, sourceName);
    default:
      throw new Error(`Unknown export format: ${format}`);
  }
}

function exportToCursor(
  workspaceDir: string,
  content: string,
  sourceName: string
): ExportResult {
  const outputPath = path.join(workspaceDir, ".cursorrules");

  // Transform CLAUDE.md format to .cursorrules format
  let transformed = `# Cursor Rules\n# Auto-generated from ${sourceName} by AgentLinter v2.2.0\n\n`;
  transformed += transformContent(content, "cursor");

  return { format: "cursor", outputPath, content: transformed };
}

function exportToCopilot(
  workspaceDir: string,
  content: string,
  sourceName: string
): ExportResult {
  const githubDir = path.join(workspaceDir, ".github");
  const outputPath = path.join(githubDir, "copilot-instructions.md");

  let transformed = `# GitHub Copilot Instructions\n`;
  transformed += `<!-- Auto-generated from ${sourceName} by AgentLinter v2.2.0 -->\n\n`;
  transformed += transformContent(content, "copilot");

  return { format: "copilot", outputPath, content: transformed };
}

function exportToGemini(
  workspaceDir: string,
  content: string,
  sourceName: string
): ExportResult {
  const outputPath = path.join(workspaceDir, "GEMINI.md");

  let transformed = `# Gemini CLI Instructions\n`;
  transformed += `<!-- Auto-generated from ${sourceName} by AgentLinter v2.2.0 -->\n\n`;
  transformed += transformContent(content, "gemini");

  return { format: "gemini", outputPath, content: transformed };
}

/**
 * Transform CLAUDE.md content to target format
 * - Strips Claude-specific directives
 * - Preserves core instructions, coding style, project structure
 */
function transformContent(content: string, format: ExportFormat): string {
  const lines = content.split("\n");
  const outputLines: string[] = [];
  let skipSection = false;
  let inCodeBlock = false;

  // Patterns specific to Claude Code that should be stripped
  const claudeSpecificPatterns = [
    /^#+\s*(?:Claude Code|\.claude|hooks|skills\/)/i,
    /\b(?:claude code|npx agentlinter|\.claude\/)\b/i,
    /\b(?:MCP server|claude\.ai|anthropic\.com)\b/i,
  ];

  // Section headers to always preserve
  const preserveSections = [
    /^#+\s*(?:coding style|project structure|conventions|rules|guidelines|tools|dependencies)/i,
    /^#+\s*(?:what|how|why|goals|constraints|boundaries|security)/i,
  ];

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      outputLines.push(line);
      continue;
    }

    if (inCodeBlock) {
      outputLines.push(line);
      continue;
    }

    // Check if this is a section header
    if (/^#+\s/.test(line)) {
      // Skip Claude-specific sections
      if (claudeSpecificPatterns.some((p) => p.test(line))) {
        skipSection = true;
        continue;
      }
      skipSection = false;
    }

    if (skipSection) continue;

    // Skip individual Claude-specific lines (not in preserved sections)
    if (claudeSpecificPatterns.some((p) => p.test(line)) && !preserveSections.some((p) => p.test(line))) {
      continue;
    }

    outputLines.push(line);
  }

  let result = outputLines.join("\n").trim();

  // Add format-specific footer
  switch (format) {
    case "cursor":
      result += "\n\n# End of Cursor Rules\n";
      break;
    case "copilot":
      result += "\n\n<!-- End of Copilot Instructions -->\n";
      break;
    case "gemini":
      result += "\n\n<!-- End of Gemini Instructions -->\n";
      break;
  }

  return result;
}

/**
 * Get supported formats
 */
export function getSupportedFormats(): ExportFormat[] {
  return ["cursor", "copilot", "gemini"];
}
