#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { scanWorkspace, lint } from './engine';
import { formatJSON } from './engine/reporter';
import { uploadReport } from './upload';
import { LintResult, Diagnostic } from './engine/types';

const VERSION = "0.1.6";

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
          console.log(`\n  ${c.dim}Share on X: https://x.com/intent/tweet?text=${encodeURIComponent(`I scored ${result.totalScore}/100 on AgentLinter! ${url}`)}${c.reset}\n`);
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
  // Grade tiers (strict)
  let scoreColor = c.red;
  let scoreEmoji = "💀";
  let grade = "F";
  if (result.totalScore >= 98) { scoreColor = c.magenta; scoreEmoji = "🏆"; grade = "S"; }
  else if (result.totalScore >= 95) { scoreColor = c.magenta; scoreEmoji = "⭐"; grade = "A+"; }
  else if (result.totalScore >= 90) { scoreColor = c.green; scoreEmoji = "🎯"; grade = "A"; }
  else if (result.totalScore >= 85) { scoreColor = c.green; scoreEmoji = "✨"; grade = "A-"; }
  else if (result.totalScore >= 80) { scoreColor = c.green; scoreEmoji = "👍"; grade = "B+"; }
  else if (result.totalScore >= 75) { scoreColor = c.green; scoreEmoji = "👌"; grade = "B"; }
  else if (result.totalScore >= 68) { scoreColor = c.yellow; scoreEmoji = "📝"; grade = "B-"; }
  else if (result.totalScore >= 58) { scoreColor = c.yellow; scoreEmoji = "🔧"; grade = "C+"; }
  else if (result.totalScore >= 45) { scoreColor = c.red; scoreEmoji = "⚠️"; grade = "C"; }
  else if (result.totalScore >= 30) { scoreColor = c.red; scoreEmoji = "🚨"; grade = "D"; }

  lines.push(`${scoreEmoji} Overall Score: ${c.bold}${scoreColor}${result.totalScore}/100${c.reset} ${c.dim}(${grade})${c.reset}`);
  lines.push("");

  // Categories
  for (const cat of result.categories) {
    const label = (cat.category.charAt(0).toUpperCase() + cat.category.slice(1)).padEnd(14);
    
    let barColor = c.red;
    if (cat.score >= 95) barColor = c.magenta;
    else if (cat.score >= 85) barColor = c.green;
    else if (cat.score >= 68) barColor = c.yellow;

    // Grade per category
    let catGrade = "F";
    if (cat.score >= 98) catGrade = "S";
    else if (cat.score >= 95) catGrade = "A+";
    else if (cat.score >= 90) catGrade = "A";
    else if (cat.score >= 85) catGrade = "A-";
    else if (cat.score >= 80) catGrade = "B+";
    else if (cat.score >= 75) catGrade = "B";
    else if (cat.score >= 68) catGrade = "B-";
    else if (cat.score >= 58) catGrade = "C+";
    else if (cat.score >= 45) catGrade = "C";
    else if (cat.score >= 30) catGrade = "D";

    const bar = makeBar(cat.score);
    lines.push(`  ${label} ${barColor}${bar}${c.reset} ${cat.score} ${c.dim}${catGrade}${c.reset}`);
  }
  lines.push("");

  // Diagnostics
  const sorted = [...result.diagnostics].sort((a, b) => {
    const sevScore = { critical: 0, warning: 1, info: 2 };
    return (sevScore[a.severity] - sevScore[b.severity]) || a.file.localeCompare(b.file);
  });

  const criticals = sorted.filter(d => d.severity === 'critical');
  const warnings = sorted.filter(d => d.severity === 'warning');
  
  if (criticals.length > 0 || warnings.length > 0) {
      const parts = [];
      if (criticals.length) parts.push(`${c.red}${criticals.length} critical(s)${c.reset}`);
      if (warnings.length) parts.push(`${c.yellow}${warnings.length} warning(s)${c.reset}`);
      lines.push(`📋 ${parts.join(", ")}`);
      lines.push("");
  }

  for (const diag of sorted) {
    if (diag.severity === 'info') continue;

    let icon = "ℹ️  INFO";
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
