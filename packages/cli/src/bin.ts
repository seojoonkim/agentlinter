#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { scanWorkspace, lint } from './engine';
import { formatJSON } from './engine/reporter';
import { uploadReport } from './upload';
import { LintResult } from './engine/types';
import { auditSkillFile, formatAuditResult, formatAuditJSON, AuditResult } from './engine/audit-skill';
import {
  Locale,
  resolveLocale,
  t,
  getCategoryLabel,
  getHelpText,
  getShareText,
  getVerdictLabel,
  getDiagnosticBadge,
  getSupportedLocaleHint,
} from './i18n';
import { localizeDiagnostics } from './i18n-diagnostics';

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

const DEFAULT_CLI_FLAGS = {
  jsonOutput: false,
  share: true,
  noAudit: false,
  showHelp: false,
  cliLang: null as string | null,
  auditSkillPath: null as string | null,
} as const;

async function main() {
  const args = process.argv.slice(2);
  let targetDir = process.cwd();
  let jsonOutput = DEFAULT_CLI_FLAGS.jsonOutput;
  let share = DEFAULT_CLI_FLAGS.share;
  let auditSkillPath = DEFAULT_CLI_FLAGS.auditSkillPath;
  let noAudit = DEFAULT_CLI_FLAGS.noAudit;
  let showHelp = DEFAULT_CLI_FLAGS.showHelp;
  let cliLang = DEFAULT_CLI_FLAGS.cliLang;
  let missingLangValue = false;

  // Parse args
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--json') jsonOutput = true;
    else if (arg === '--local' || arg === '--no-share') { share = false; }
    else if (arg === '--no-audit') noAudit = true;
    else if (arg === '--lang') {
      const value = args[i + 1];
      if (!value || value.startsWith('-')) {
        missingLangValue = true;
        break;
      }
      cliLang = value;
      i++;
    }
    else if (arg === '--audit-skill') {
      auditSkillPath = args[++i];
    }
    else if (arg === 'scan') {
      // scan <file|url> subcommand
      auditSkillPath = args[++i];
    }
    else if (arg === 'score') continue;
    else if (arg === '--help' || arg === '-h') {
      showHelp = true;
    }
    else if (!arg.startsWith('-')) targetDir = path.resolve(process.cwd(), arg);
  }

  const { locale, invalidCliLang } = resolveLocale(cliLang);
  const supportedLocales = getSupportedLocaleHint();

  if (missingLangValue) {
    console.error(`${c.red}${t(locale, "errorLangOptionNeedsValue", { supported: supportedLocales })}${c.reset}`);
    process.exit(1);
  }

  if (invalidCliLang) {
    console.error(`${c.red}${t(locale, "errorInvalidLang", { lang: invalidCliLang, supported: supportedLocales })}${c.reset}`);
    process.exit(1);
  }

  if (showHelp) {
    printHelp(locale);
    process.exit(0);
  }

  // Skill Audit Mode
  if (auditSkillPath) {
    await runSkillAudit(auditSkillPath, jsonOutput, locale);
    return;
  }

  if (!fs.existsSync(targetDir)) {
    console.error(`${c.red}${t(locale, "errorDirectoryNotFound", { path: targetDir })}${c.reset}`);
    process.exit(1);
  }

  if (!jsonOutput) {
    console.log(`\n${c.magenta}${c.bold}🔍 AgentLinter${c.reset} ${c.dim}v${VERSION}${c.reset}`);
    console.log(`${c.dim}${t(locale, "scanStart", { path: targetDir })}${c.reset}\n`);
  }

  try {
    const files = scanWorkspace(targetDir);
    if (files.length === 0) {
      if (jsonOutput) {
        console.log(JSON.stringify({ error: t(locale, "noFilesFound"), score: 0 }));
      } else {
        console.log(`${c.yellow}${t(locale, "noAgentConfigFiles")}${c.reset}`);
      }
      process.exit(0);
    }

    const result = lint(targetDir, files);

    if (jsonOutput) {
      console.log(formatJSON(result, locale));
    } else {
      console.log(formatTerminalColored(result, locale));
    }

    // Skills Security Scan (unless --no-audit)
    if (!noAudit) {
      const skillsResults = await scanSkillsFolders(targetDir);
      if (skillsResults.length > 0) {
        if (!jsonOutput) {
          console.log(formatSkillsScanResults(skillsResults, locale));
        }
      }
    }

    if (share) {
      if (!jsonOutput) console.log(`\n${c.dim}${t(locale, "generatingReport")}${c.reset}`);
      try {
        const { url } = await uploadReport(result);
        if (jsonOutput) {
          console.error(`${t(locale, "linkLabel")}: ${url}`);
        } else {
          console.log("");
          console.log(`  ┌─────────────────────────────────────────────────┐`);
          console.log(`  │                                                 │`);
          console.log(`  │  ${c.bold}${t(locale, "viewReportTitle")}${c.reset}          │`);
          console.log(`  │                                                 │`);
          console.log(`  │  ${c.cyan}${c.bold}→ ${url}${c.reset}`);
          console.log(`  │                                                 │`);
          console.log(`  └─────────────────────────────────────────────────┘`);

          const grade = result.totalScore >= 98 ? "S" : result.totalScore >= 96 ? "A+" : result.totalScore >= 93 ? "A" : result.totalScore >= 90 ? "A-" : result.totalScore >= 85 ? "B+" : result.totalScore >= 80 ? "B" : result.totalScore >= 75 ? "B-" : result.totalScore >= 68 ? "C+" : result.totalScore >= 60 ? "C" : result.totalScore >= 55 ? "C-" : result.totalScore >= 50 ? "D" : "F";
          const percentile = result.totalScore >= 98 ? 1 : result.totalScore >= 96 ? 3 : result.totalScore >= 93 ? 5 : result.totalScore >= 90 ? 8 : result.totalScore >= 85 ? 12 : result.totalScore >= 80 ? 18 : result.totalScore >= 75 ? 25 : result.totalScore >= 68 ? 35 : 50;

          const shareText = getShareText(locale, result.totalScore, grade, percentile);
          console.log(`\n  ${c.dim}${t(locale, "shareOnX")}: https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}${c.reset}\n`);
        }
      } catch (err) {
        if (!jsonOutput) {
          console.log(`\n${c.dim}${t(locale, "uploadFailedHint")}${c.reset}\n`);
        }
      }
    } else {
      // Report link generation skipped (--no-share)
    }

  } catch (error) {
    console.error(`${c.red}${t(locale, "errorGeneric", { message: error instanceof Error ? error.message : String(error) })}${c.reset}`);
    process.exit(1);
  }
}

function formatTerminalColored(result: LintResult, locale: Locale): string {
  const lines: string[] = [];
  const diagnostics = localizeDiagnostics(result.diagnostics, locale);
  
  lines.push(`📁 ${t(locale, "workspace")}: ${c.bold}${result.workspace}${c.reset}`);
  lines.push(`📄 ${t(locale, "files")}: ${result.files.map(f => f.name).join(", ")}`);
  lines.push("");

  // Score
  // Grade tiers (strict)
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

  lines.push(`${scoreEmoji} ${t(locale, "overallScore")}: ${c.bold}${scoreColor}${result.totalScore}/100${c.reset} ${c.dim}(${grade})${c.reset}`);
  lines.push("");

  // Categories
  for (const cat of result.categories) {
    const label = getCategoryLabel(cat.category, locale).padEnd(14);
    
    let barColor = c.red;
    if (cat.score >= 95) barColor = c.magenta;
    else if (cat.score >= 85) barColor = c.green;
    else if (cat.score >= 68) barColor = c.yellow;

    // Grade per category
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
  const sorted = [...diagnostics].sort((a, b) => {
    const sevScore: Record<string, number> = { critical: 0, error: 0, warning: 1, info: 2 };
    return ((sevScore[a.severity] ?? 1) - (sevScore[b.severity] ?? 1)) || a.file.localeCompare(b.file);
  });

  const criticals = sorted.filter(d => d.severity === 'critical' || d.severity === 'error');
  const warnings = sorted.filter(d => d.severity === 'warning');
  const infos = sorted.filter(d => d.severity === 'info');
  
  {
      const parts = [];
      if (criticals.length) parts.push(`${c.red}${t(locale, "criticalCount", { count: criticals.length })}${c.reset}`);
      if (warnings.length) parts.push(`${c.yellow}${t(locale, "warningCount", { count: warnings.length })}${c.reset}`);
      if (infos.length) parts.push(`${c.blue}${t(locale, "suggestionCount", { count: infos.length })}${c.reset}`);
      if (parts.length > 0) {
        lines.push(`📋 ${parts.join(", ")}`);
        lines.push("");
      }
  }

  for (const diag of sorted) {
    let icon = getDiagnosticBadge(locale, "tip");
    let color = c.blue;
    if (diag.severity === "critical" || diag.severity === "error") {
      icon = getDiagnosticBadge(locale, "critical");
      color = c.red;
    } else if (diag.severity === "warning") {
      icon = getDiagnosticBadge(locale, "warning");
      color = c.yellow;
    }

    const location = diag.line ? `${diag.file}:${diag.line}` : diag.file;
    lines.push(`  ${color}${icon}${c.reset}  ${c.dim}${location}${c.reset}`);
    lines.push(`         ${diag.message}`);
    if (diag.fix) {
      lines.push(`         ${c.cyan}💡 ${t(locale, "fixLabel")}: ${diag.fix}${c.reset}`);
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

async function runSkillAudit(skillPath: string, jsonOutput: boolean, locale: Locale) {
  let content: string;
  let filename: string;
  
  // Check if it's a URL
  if (skillPath.startsWith('http://') || skillPath.startsWith('https://')) {
    if (!jsonOutput) {
      console.log(`${c.dim}${t(locale, "fetching", { path: skillPath })}${c.reset}`);
    }
    try {
      const res = await fetch(skillPath);
      if (!res.ok) {
        console.error(`${c.red}${t(locale, "errorFetchFailed", { status: res.status })}${c.reset}`);
        process.exit(1);
      }
      content = await res.text();
      filename = skillPath.split('/').pop() || 'skill.md';
    } catch (err) {
      console.error(`${c.red}${t(locale, "errorFetchCouldNot", { message: err instanceof Error ? err.message : String(err) })}${c.reset}`);
      process.exit(1);
    }
  } else {
    // Local file
    const resolvedPath = path.resolve(process.cwd(), skillPath);
    
    if (!fs.existsSync(resolvedPath)) {
      console.error(`${c.red}${t(locale, "errorFileNotFound", { path: skillPath })}${c.reset}`);
      process.exit(1);
    }
    
    content = fs.readFileSync(resolvedPath, 'utf-8');
    filename = path.basename(resolvedPath);
  }
  
  const result = auditSkillFile(content, filename);
  
  if (jsonOutput) {
    console.log(formatAuditJSON(result, locale));
  } else {
    console.log(formatAuditResult(result, locale));
  }
  
  // Exit with error code if dangerous
  if (result.verdict === "DANGEROUS" || result.verdict === "MALICIOUS") {
    process.exit(1);
  }
}

function printHelp(locale: Locale) {
  console.log(getHelpText(locale));
}

/* ─── Skills Folder Scanning ─── */

interface SkillScanResult {
  folder: string;
  skills: { name: string; result: AuditResult }[];
}

async function scanSkillsFolders(workspaceDir: string): Promise<SkillScanResult[]> {
  const results: SkillScanResult[] = [];
  
  // Skill folder candidates
  const candidates = [
    path.join(workspaceDir, 'skills'),
    path.join(workspaceDir, '.claude', 'skills'),
    path.join(os.homedir(), '.clawd', 'skills'),
  ];
  
  for (const folder of candidates) {
    if (!fs.existsSync(folder)) continue;
    
    const stat = fs.statSync(folder);
    if (!stat.isDirectory()) continue;
    
    const skills: { name: string; result: AuditResult }[] = [];
    const entries = fs.readdirSync(folder, { withFileTypes: true });
    
    for (const entry of entries) {
      const entryPath = path.join(folder, entry.name);
      
      if (entry.isDirectory()) {
        // Look for SKILL.md or skill.md inside
        const skillMdPaths = [
          path.join(entryPath, 'SKILL.md'),
          path.join(entryPath, 'skill.md'),
          path.join(entryPath, 'README.md'),
        ];
        
        for (const skillMd of skillMdPaths) {
          if (fs.existsSync(skillMd)) {
            const content = fs.readFileSync(skillMd, 'utf-8');
            const result = auditSkillFile(content, path.basename(skillMd));
            skills.push({ name: entry.name, result });
            break;
          }
        }
      } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.txt'))) {
        // Direct skill file
        const content = fs.readFileSync(entryPath, 'utf-8');
        const result = auditSkillFile(content, entry.name);
        skills.push({ name: entry.name.replace(/\.(md|txt)$/, ''), result });
      }
    }
    
    if (skills.length > 0) {
      results.push({ folder, skills });
    }
  }
  
  return results;
}

function formatSkillsScanResults(results: SkillScanResult[], locale: Locale): string {
  const lines: string[] = [];
  
  lines.push("");
  lines.push(`${c.bold}${t(locale, "skillsScanTitle")}${c.reset}`);
  lines.push("");
  
  let totalSafe = 0;
  let totalSuspicious = 0;
  let totalDangerous = 0;
  let totalMalicious = 0;
  
  for (const { folder, skills } of results) {
    const relFolder = folder.startsWith(os.homedir()) 
      ? folder.replace(os.homedir(), '~') 
      : folder;
    lines.push(`${c.dim}${t(locale, "foundSkillsIn", { count: skills.length, folder: relFolder })}${c.reset}`);
    
    for (const { name, result } of skills) {
      let icon = "✅";
      let status = `${c.green}${getVerdictLabel(locale, "SAFE")}${c.reset}`;
      
      if (result.verdict === "SUSPICIOUS") {
        icon = "⚠️";
        const warnings = result.findings.filter(f => f.severity === "WARNING").length;
        status = `${c.yellow}${getVerdictLabel(locale, "SUSPICIOUS")}${c.reset} ${c.dim}(${warnings} ${t(locale, "warningsWord")})${c.reset}`;
        totalSuspicious++;
      } else if (result.verdict === "DANGEROUS") {
        icon = "🚨";
        const criticals = result.findings.filter(f => f.severity === "CRITICAL").length;
        status = `${c.red}${getVerdictLabel(locale, "DANGEROUS")}${c.reset} ${c.dim}(${criticals} ${t(locale, "criticalsWord")})${c.reset}`;
        totalDangerous++;
      } else if (result.verdict === "MALICIOUS") {
        icon = "💀";
        status = `${c.red}${c.bold}${getVerdictLabel(locale, "MALICIOUS")}${c.reset}`;
        totalMalicious++;
      } else {
        totalSafe++;
      }
      
      lines.push(`  ${icon} ${name}: ${status}`);
    }
    lines.push("");
  }
  
  // Summary
  const summaryParts: string[] = [];
  if (totalSafe > 0) summaryParts.push(`${c.green}${totalSafe} ${getVerdictLabel(locale, "SAFE")}${c.reset}`);
  if (totalSuspicious > 0) summaryParts.push(`${c.yellow}${totalSuspicious} ${getVerdictLabel(locale, "SUSPICIOUS")}${c.reset}`);
  if (totalDangerous > 0) summaryParts.push(`${c.red}${totalDangerous} ${getVerdictLabel(locale, "DANGEROUS")}${c.reset}`);
  if (totalMalicious > 0) summaryParts.push(`${c.red}${c.bold}${totalMalicious} ${getVerdictLabel(locale, "MALICIOUS")}${c.reset}`);
  
  lines.push(`${t(locale, "overall")}: ${summaryParts.join(' | ')}`);
  
  return lines.join("\n");
}

main().catch(console.error);
