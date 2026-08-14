/* ─── Markdown Parser ─── */

import { FileInfo, Section, LintContext } from "./types";
import * as fs from "fs";
import * as path from "path";

const AGENT_FILES = [
  "CLAUDE.md", "AGENTS.md", "SOUL.md", "IDENTITY.md", "USER.md", "TOOLS.md",
  "SECURITY.md", "FORMATTING.md", "HEARTBEAT.md", "MEMORY.md", "BOOTSTRAP.md",
  ".clauderc", ".agentlinterrc", ".cursorrules", ".github/copilot-instructions.md",
  "clawdbot.json", "openclaw.json", "moltbot.json",
];
const AGENT_DIRS = [".claude", "claude", ".cursor", ".windsurf", ".github"];
const HERMES_ROOT_CONFIG_MARKER = "<validated-hermes-root-config>";

function isHermesMarker(fileName: string): boolean {
  return fileName === HERMES_ROOT_CONFIG_MARKER ||
    /^profiles\/[^/]+\/config\.yaml$/.test(fileName) ||
    /^plugins\/.+\/plugin\.yaml$/.test(fileName);
}

/** A generic root config.yaml is not Hermes unless its top-level shape is distinctive. */
function isHermesRootConfig(content: string): boolean {
  const topLevelKeys = new Set(
    Array.from(content.matchAll(/^([A-Za-z_][\w-]*)\s*:/gm), (match) => match[1])
  );
  // Root config collection is an upload boundary, so fail closed. Generic
  // application keys, even in combination, are not sufficient evidence.
  return topLevelKeys.has("mcp_servers");
}

/** Detect lint context based on already validated file names. */
export function detectContext(fileNames: string[]): LintContext {
  if (fileNames.includes("CLAUDE.md")) return "claude-code";
  if (fileNames.includes(".cursorrules") || fileNames.some((f) => f.startsWith(".cursor/"))) return "cursor";
  if (fileNames.includes(".github/copilot-instructions.md") || fileNames.some((f) => f.includes("copilot-instructions"))) return "copilot";
  if (fileNames.some(isHermesMarker)) return "hermes-runtime";
  if (fileNames.includes("AGENTS.md") || fileNames.includes("openclaw.json") ||
      fileNames.includes("clawdbot.json") || fileNames.includes("moltbot.json")) {
    return "openclaw-runtime";
  }
  return "universal";
}

interface NamedPath { name: string; path: string }

/** Scan a workspace without following symlinks or reading outside its real path. */
export function scanWorkspace(workspacePath: string): FileInfo[] {
  const files: FileInfo[] = [];
  const workspaceRealPath = safeRealpath(workspacePath);
  if (!workspaceRealPath) return files;

  const fileNames = AGENT_FILES.filter((name) => isSafeFile(path.join(workspaceRealPath, name), workspaceRealPath));
  const hermesPaths = collectHermesPaths(workspaceRealPath);
  fileNames.push(...hermesPaths.map((item) => item.name));

  const rootConfigPath = path.join(workspaceRealPath, "config.yaml");
  if (isSafeFile(rootConfigPath, workspaceRealPath)) {
    try {
      if (isHermesRootConfig(fs.readFileSync(rootConfigPath, "utf-8"))) fileNames.push(HERMES_ROOT_CONFIG_MARKER);
    } catch { /* Ignore unreadable optional config. */ }
  }

  const context = detectContext(fileNames);
  for (const name of AGENT_FILES) {
    const filePath = path.join(workspaceRealPath, name);
    if (isSafeFile(filePath, workspaceRealPath)) files.push(parseFile(filePath, name, context));
  }
  if (fileNames.includes(HERMES_ROOT_CONFIG_MARKER)) files.push(parseFile(rootConfigPath, "config.yaml", context));
  for (const item of hermesPaths) files.push(parseFile(item.path, item.name, context));

  for (const dir of AGENT_DIRS) {
    const dirPath = path.join(workspaceRealPath, dir);
    if (!isSafeDirectory(dirPath, workspaceRealPath)) continue;
    if (dir === ".claude" || dir === "claude") {
      scanDirRecursive(dirPath, files, dir, context, workspaceRealPath, 0, 3);
    } else {
      try {
        for (const name of fs.readdirSync(dirPath)) {
          if (!name.endsWith(".md") && !name.endsWith(".txt")) continue;
          const filePath = path.join(dirPath, name);
          if (isSafeFile(filePath, workspaceRealPath) && !files.some((file) => file.path === filePath)) {
            files.push(parseFile(filePath, `${dir}/${name}`, context));
          }
        }
      } catch { /* Ignore unreadable optional directory. */ }
    }
  }

  const compoundDir = path.join(workspaceRealPath, "compound");
  if (isSafeDirectory(compoundDir, workspaceRealPath)) {
    try {
      for (const name of fs.readdirSync(compoundDir)) {
        const filePath = path.join(compoundDir, name);
        if (name.endsWith(".md") && isSafeFile(filePath, workspaceRealPath)) {
          files.push(parseFile(filePath, `compound/${name}`, context));
        }
      }
    } catch { /* Ignore unreadable optional directory. */ }
  }

  const homeDir = process.env.HOME || process.env.USERPROFILE || "";
  const isHomeDir = Boolean(homeDir) && workspaceRealPath === safeRealpath(homeDir);
  if (isHomeDir) {
    for (const configPath of [
      path.join(homeDir, ".clawdbot", "clawdbot.json"),
      path.join(homeDir, ".openclaw", "openclaw.json"),
      path.join(homeDir, ".moltbot", "moltbot.json"),
    ]) {
      if (isSafeFile(configPath, workspaceRealPath)) {
        files.push(parseFile(configPath, path.basename(configPath), context));
        break;
      }
    }
  }

  const skillsDirs = [
    path.join(workspaceRealPath, "skills"),
    ...(isHomeDir ? [
      path.join(homeDir, ".clawdbot", "skills"),
      path.join(homeDir, ".openclaw", "skills"),
      path.join(homeDir, ".moltbot", "skills"),
    ] : []),
  ];
  for (const skillsDir of skillsDirs) {
    if (isSafeDirectory(skillsDir, workspaceRealPath)) {
      scanSkillsDir(skillsDir, files, skillsDir, context, workspaceRealPath);
    }
  }
  return files;
}

function collectHermesPaths(workspaceRealPath: string): NamedPath[] {
  const results: NamedPath[] = [];
  const profilesDir = path.join(workspaceRealPath, "profiles");
  if (isSafeDirectory(profilesDir, workspaceRealPath)) {
    try {
      for (const profile of fs.readdirSync(profilesDir)) {
        const profileDir = path.join(profilesDir, profile);
        const configPath = path.join(profileDir, "config.yaml");
        if (isSafeDirectory(profileDir, workspaceRealPath) && isSafeFile(configPath, workspaceRealPath)) {
          results.push({ name: `profiles/${profile}/config.yaml`, path: configPath });
        }
      }
    } catch { /* Ignore unreadable optional directory. */ }
  }
  collectPluginManifests(path.join(workspaceRealPath, "plugins"), "plugins", workspaceRealPath, results);
  return results;
}

function collectPluginManifests(dir: string, prefix: string, workspaceRealPath: string, results: NamedPath[]) {
  if (!isSafeDirectory(dir, workspaceRealPath)) return;
  try {
    for (const entry of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, entry);
      const relativeName = `${prefix}/${entry}`;
      const stat = safeLstat(fullPath, workspaceRealPath);
      if (!stat) continue;
      if (stat.isDirectory()) collectPluginManifests(fullPath, relativeName, workspaceRealPath, results);
      else if (entry === "plugin.yaml" && prefix !== "plugins") results.push({ name: relativeName, path: fullPath });
    }
  } catch { /* Ignore unreadable optional directory. */ }
}

function scanDirRecursive(dir: string, files: FileInfo[], prefix: string, context: LintContext,
  workspaceRealPath: string, depth: number, maxDepth: number) {
  if (depth > maxDepth) return;
  try {
    for (const entry of fs.readdirSync(dir)) {
      if (entry === "node_modules" || (entry.startsWith(".") && depth > 0)) continue;
      const fullPath = path.join(dir, entry);
      const stat = safeLstat(fullPath, workspaceRealPath);
      if (!stat) continue;
      const relativeName = `${prefix}/${entry}`;
      if (stat.isDirectory()) scanDirRecursive(fullPath, files, relativeName, context, workspaceRealPath, depth + 1, maxDepth);
      else if (entry.endsWith(".md") || entry.endsWith(".txt") || entry.endsWith(".json")) {
        if (!files.some((file) => file.path === fullPath)) files.push(parseFile(fullPath, relativeName, context));
      }
    }
  } catch { /* Ignore unreadable optional directory. */ }
}

/** Skills have their own scanner, but only SKILL.md is an allowed skill input. */
function scanSkillsDir(dir: string, files: FileInfo[], baseDir: string, context: LintContext,
  workspaceRealPath: string, depth = 0) {
  if (depth > 3) return;
  try {
    for (const entry of fs.readdirSync(dir)) {
      if (entry === "node_modules" || entry.startsWith(".")) continue;
      const fullPath = path.join(dir, entry);
      const stat = safeLstat(fullPath, workspaceRealPath);
      if (!stat) continue;
      if (stat.isDirectory()) scanSkillsDir(fullPath, files, baseDir, context, workspaceRealPath, depth + 1);
      else if (entry === "SKILL.md") {
        const relativeName = "skills/" + path.relative(baseDir, fullPath);
        if (!files.some((file) => file.path === fullPath)) files.push(parseFile(fullPath, relativeName, context));
      }
    }
  } catch { /* Ignore unreadable optional directory. */ }
}

function safeRealpath(targetPath: string): string | undefined {
  try { return fs.realpathSync(targetPath); } catch { return undefined; }
}

function isInsideWorkspace(targetRealPath: string, workspaceRealPath: string): boolean {
  const relative = path.relative(workspaceRealPath, targetRealPath);
  return relative === "" || (relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

function safeLstat(targetPath: string, workspaceRealPath: string): fs.Stats | undefined {
  try {
    const stat = fs.lstatSync(targetPath);
    if (stat.isSymbolicLink()) return undefined;
    const realPath = fs.realpathSync(targetPath);
    return isInsideWorkspace(realPath, workspaceRealPath) ? stat : undefined;
  } catch { return undefined; }
}

function isSafeFile(targetPath: string, workspaceRealPath: string): boolean {
  return safeLstat(targetPath, workspaceRealPath)?.isFile() === true;
}
function isSafeDirectory(targetPath: string, workspaceRealPath: string): boolean {
  return safeLstat(targetPath, workspaceRealPath)?.isDirectory() === true;
}

/** Parse a single text file. */
export function parseFile(filePath: string, name: string, context: LintContext): FileInfo {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  return { name, path: filePath, content, lines, sections: parseSections(lines), context };
}

function parseSections(lines: string[]): Section[] {
  const sections: Section[] = [];
  let currentSection: Section | null = null;
  let inCodeBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trimStart().startsWith("```")) inCodeBlock = !inCodeBlock;
    if (inCodeBlock) continue;
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (!headingMatch) continue;
    if (currentSection) {
      currentSection.endLine = i - 1;
      currentSection.content = lines.slice(currentSection.startLine, i).join("\n");
      sections.push(currentSection);
    }
    currentSection = { heading: headingMatch[2].trim(), level: headingMatch[1].length, startLine: i, endLine: i, content: "" };
  }
  if (currentSection) {
    currentSection.endLine = lines.length - 1;
    currentSection.content = lines.slice(currentSection.startLine).join("\n");
    sections.push(currentSection);
  }
  return sections;
}
