#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { scanWorkspace, lint } from './engine';
import { formatJSON } from './engine/reporter';
import { uploadReport } from './upload';
import { LintResult, Diagnostic } from './engine/types';

const { version: VERSION } = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8')
);

/* ─── ANSI Colors ─── */
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

async function main() {
  const args = process.argv.slice(2);
  let targetDir = process.cwd();
  let jsonOutput = false;
  let share = true; // share by default
  let local = false;

  // Parse args
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--json') jsonOutput = true;
    else if (arg === '--share') share = true;
    else if (arg === '--local' || arg === '--no-share') { share = false; local = true; }
    else if (arg === 'score') continue;
    else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
    else if (!arg.startsWith('-')) targetDir = path.resolve(process.cwd(), arg);
  }

  if (!fs.existsSync(targetDir)) {
    console.error(`${c.red}Error: Directory not found: ${targetDir}${c.reset}`);
    process.exit(1);
  }

  if (!jsonOutput) {
    console.log(`\n${c.magenta}${c.bold}🔍 AgentLinter${c.reset} ${c.dim}v${VERSION}${c.reset}`);
    console.log(`${c.dim}Scanning: ${targetDir}${c.reset}\n`);
  }

  try {
    const files = scanWorkspace(targetDir);
    if (files.length === 0) {
      if (jsonOutput) {
        console.log(JSON.stringify({ error: "No files found", score: 0 }));
      } else {
        console.log(`${c.yellow}No agent configuration files found (CLAUDE.md, AGENTS.md, etc).${c.reset}`);
      }
      process.exit(0);
    }

    const result = lint(targetDir, files);

    if (jsonOutput) {
      console.log(formatJSON(result));
    } else {
      console.log(formatTerminalColored(result));
    }

    if (share) {
      if (!jsonOutput) console.log(`\n${c.dim}Generating report link...${c.reset}`);
      try {
        const { url } = await uploadReport(result);
        if (jsonOutput) {
          console.error(`Link: ${url}`);
        } else {
          console.log("");
          console.log(`  ┌─────────────────────────────────────────────────┐`);
          console.log(`  │                                                 │`);
          console.log(`  │  ${c.bold}📊 View full report & share your score${c.reset}        │`);
          console.log(`  │                                                 │`);
          console.log(`  │  ${c.cyan}${c.bold}→ ${url}${c.reset}`);
          console.log(`  │                                                 │`);
          console.log(`  └─────────────────────────────────────────────────┘`);
          // Build rich share text
          const catLabels: Record<string, string> = {
            structure: "📁",
            clarity: "💡", 
            completeness: "📋",
            security: "🔒",
            consistency: "🔗",
            memory: "🧠",
            runtime: "⚙️",
            skillSafety: "🛡️",
          };
          const allCats = result.categories
            .sort((a, b) => b.score - a.score)
            .map(c => `${catLabels[c.category] || ""}${c.score}`)
            .join(" ");
          
          const grade = result.totalScore >= 98 ? "S" : result.totalScore >= 96 ? "A+" : result.totalScore >= 93 ? "A" : result.totalScore >= 90 ? "A-" : result.totalScore >= 85 ? "B+" : result.totalScore >= 80 ? "B" : result.totalScore >= 75 ? "B-" : result.totalScore >= 68 ? "C+" : result.totalScore >= 60 ? "C" : result.totalScore >= 55 ? "C-" : result.totalScore >= 50 ? "D" : "F";
          const percentile = result.totalScore >= 98 ? 1 : result.totalScore >= 96 ? 3 : result.totalScore >= 93 ? 5 : result.totalScore >= 90 ? 8 : result.totalScore >= 85 ? 12 : result.totalScore >= 80 ? 18 : result.totalScore >= 75 ? 25 : result.totalScore >= 68 ? 35 : 50;
          
          const shareText = `🧬 AgentLinter Score: ${result.totalScore}/100

⭐ ${grade} tier · Top ${percentile}%

Is YOUR AI agent secure?
Free & open source — try it yourself:

npx agentlinter

https://agentlinter.com`;
          
          console.log(`\n  ${c.dim}Share on X: https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}${c.reset}\n`);
        }
      } catch (err) {
        if (!jsonOutput) {
          console.log(`\n${c.dim}(Could not upload report. Use --local to skip.)${c.reset}\n`);
        }
      }
    } else {
      if (!jsonOutput) {
        console.log(`\n${c.dim}Run without --local to get a shareable report link.${c.reset}\n`);
      }
    }

  } catch (error) {
    console.error(`${c.red}Error: ${error instanceof Error ? error.message : String(error)}${c.reset}`);
    process.exit(1);
  }
}

function formatTerminalColored(result: LintResult): string {
  const lines: string[] = [];
  
  lines.push(`📁 Workspace: ${c.bold}${result.workspace}${c.reset}`);
  lines.push(`📄 Files: ${result.files.map(f => f.name).join(", ")}`);
  lines.push("");

  // Score
  // Grade tiers (strict) - 50점 미만 F, B+ 이하 촘촘하게
  let scoreColor = c.red;
  let scoreEmoji = "💀";
  let grade = "F";
  if (result.totalScore >= 98) { scoreColor = c.magenta; scoreEmoji = "🏆"; grade = "S"; }
  else if (result.totalScore >= 96) { scoreColor = c.magenta; scoreEmoji = "⭐"; grade = "A+"; }
  else if (result.totalScore >= 93) { scoreColor = c.green; scoreEmoji = "🎯"; grade = "A"; }
  else if (result.totalScore >= 90) { scoreColor = c.green; scoreEmoji = "✨"; grade = "A-"; }
  else if (result.totalScore >= 85) { scoreColor = c.green; scoreEmoji = "👍"; grade = "B+"; }
  else if (result.totalScore >= 80) { scoreColor = c.green; scoreEmoji = "👌"; grade = "B"; }
  else if (result.totalScore >= 75) { scoreColor = c.yellow; scoreEmoji = "📝"; grade = "B-"; }
  else if (result.totalScore >= 68) { scoreColor = c.yellow; scoreEmoji = "🔧"; grade = "C+"; }
  else if (result.totalScore >= 60) { scoreColor = c.yellow; scoreEmoji = "📊"; grade = "C"; }
  else if (result.totalScore >= 55) { scoreColor = c.red; scoreEmoji = "⚠️"; grade = "C-"; }
  else if (result.totalScore >= 50) { scoreColor = c.red; scoreEmoji = "🚨"; grade = "D"; }

  lines.push(`${scoreEmoji} Overall Score: ${c.bold}${scoreColor}${result.totalScore}/100${c.reset} ${c.dim}(${grade})${c.reset}`);
  lines.push("");

  // Categories
  for (const cat of result.categories) {
    const label = (cat.category.charAt(0).toUpperCase() + cat.category.slice(1)).padEnd(14);
    
    let barColor = c.red;
    if (cat.score >= 95) barColor = c.magenta;
    else if (cat.score >= 85) barColor = c.green;
    else if (cat.score >= 68) barColor = c.yellow;

    // Grade per category - 50점 미만 F, B+ 이하 촘촘하게
    let catGrade = "F";
    if (cat.score >= 98) catGrade = "S";
    else if (cat.score >= 96) catGrade = "A+";
    else if (cat.score >= 93) catGrade = "A";
    else if (cat.score >= 90) catGrade = "A-";
    else if (cat.score >= 85) catGrade = "B+";
    else if (cat.score >= 80) catGrade = "B";
    else if (cat.score >= 75) catGrade = "B-";
    else if (cat.score >= 68) catGrade = "C+";
    else if (cat.score >= 60) catGrade = "C";
    else if (cat.score >= 55) catGrade = "C-";
    else if (cat.score >= 50) catGrade = "D";

    const bar = makeBar(cat.score);
    lines.push(`  ${label} ${barColor}${bar}${c.reset} ${cat.score} ${c.dim}${catGrade}${c.reset}`);
  }
  lines.push("");

  // Diagnostics
  const sorted = [...result.diagnostics].sort((a, b) => {
    const sevScore: Record<string, number> = { critical: 0, error: 0, warning: 1, info: 2 };
    return ((sevScore[a.severity] ?? 1) - (sevScore[b.severity] ?? 1)) || a.file.localeCompare(b.file);
  });

  const criticals = sorted.filter(d => d.severity === 'critical');
  const warnings = sorted.filter(d => d.severity === 'warning');
  const infos = sorted.filter(d => d.severity === 'info');
  
  {
      const parts = [];
      if (criticals.length) parts.push(`${c.red}${criticals.length} critical(s)${c.reset}`);
      if (warnings.length) parts.push(`${c.yellow}${warnings.length} warning(s)${c.reset}`);
      if (infos.length) parts.push(`${c.blue}${infos.length} suggestion(s)${c.reset}`);
      if (parts.length > 0) {
        lines.push(`📋 ${parts.join(", ")}`);
        lines.push("");
      }
  }

  for (const diag of sorted) {
    let icon = "💡 TIP ";
    let color = c.blue;
    if (diag.severity === "critical") { icon = "🔴 CRITICAL"; color = c.red; }
    else if (diag.severity === "warning") { icon = "⚠️  WARN"; color = c.yellow; }

    const location = diag.line ? `${diag.file}:${diag.line}` : diag.file;
    lines.push(`  ${color}${icon}${c.reset}  ${c.dim}${location}${c.reset}`);
    lines.push(`         ${diag.message}`);
    if (diag.fix) {
      lines.push(`         ${c.cyan}💡 Fix: ${diag.fix}${c.reset}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function makeBar(score: number): string {
  const total = 25;
  const filled = Math.round((score / 100) * total);
  const empty = total - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

function printHelp() {
  console.log(`
${c.bold}AgentLinter CLI${c.reset}

Usage:
  npx agentlinter [path]       Lint & share report (default)
  npx agentlinter --local      Lint without uploading
  npx agentlinter --json       Output raw JSON

Options:
  --local, --no-share  Skip report upload
  --json               JSON output to stdout
  -h, --help           Show this help
`);
}

main().catch(console.error);
