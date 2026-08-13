/* ─── Markdown Parser ─── */

import { FileInfo, Section, LintContext } from "./types";
import * as fs from "fs";
import * as path from "path";

const AGENT_FILES = [
  "CLAUDE.md",
  "AGENTS.md",
  "SOUL.md",
  "IDENTITY.md",
  "USER.md",
  "TOOLS.md",
  "SECURITY.md",
  "FORMATTING.md",
  "HEARTBEAT.md",
  "MEMORY.md",
  "BOOTSTRAP.md",
  ".clauderc",
  ".agentlinterrc",
  // Multi-framework config files
  ".cursorrules",
  ".github/copilot-instructions.md",
  // Runtime configs
  "clawdbot.json",
  "openclaw.json",
  "moltbot.json",
  "config.yaml",
];

const AGENT_DIRS = [".claude", "claude", ".cursor", ".windsurf", ".github"];
const HERMES_DIRS = ["plugins", "profiles"];

function isHermesMarker(fileName: string): boolean {
  return fileName === "config.yaml" ||
    fileName === ".hermes/config.yaml" ||
    /^\.hermes\/profiles\/[^/]+\/config\.yaml$/.test(fileName) ||
    /^profiles\/[^/]+\/config\.yaml$/.test(fileName) ||
    /(^|\/)plugins\/.*\/plugin\.ya?ml$/.test(fileName);
}

/**
 * Detect lint context based on files present
 */
export function detectContext(fileNames: string[]): LintContext {
  // CLAUDE.md → claude-code context
  if (fileNames.includes("CLAUDE.md")) {
    return "claude-code";
  }

  // .cursorrules → cursor context
  if (fileNames.includes(".cursorrules") || fileNames.some(f => f.startsWith(".cursor/"))) {
    return "cursor";
  }

  // copilot-instructions.md → copilot context
  if (fileNames.includes(".github/copilot-instructions.md") || fileNames.some(f => f.includes("copilot-instructions"))) {
    return "copilot";
  }

  // Hermes and OpenClaw both use AGENTS.md, so require a Hermes-specific
  // marker before assigning the dedicated Hermes runtime context.
  if (fileNames.some(isHermesMarker)) {
    return "hermes-runtime";
  }

  // AGENTS.md or OpenClaw runtime config → OpenClaw context
  if (fileNames.includes("AGENTS.md") ||
      fileNames.includes("openclaw.json") ||
      fileNames.includes("clawdbot.json") ||
      fileNames.includes("moltbot.json")) {
    return "openclaw-runtime";
  }

  // Default to universal
  return "universal";
}

/**
 * Scan a workspace for agent configuration files
 */
export function scanWorkspace(workspacePath: string): FileInfo[] {
  const files: FileInfo[] = [];
  const fileNames: string[] = [];

  // First pass: collect file names for context detection
  for (const fileName of AGENT_FILES) {
    const filePath = path.join(workspacePath, fileName);
    if (fs.existsSync(filePath)) {
      fileNames.push(fileName);
    }
  }

  // Nested profile/plugin paths are Hermes-specific markers and must be
  // collected before context detection.
  collectHermesMarkers(workspacePath, fileNames);

  // Detect context based on collected files
  const context = detectContext(fileNames);

  // Second pass: parse files with context
  for (const fileName of AGENT_FILES) {
    const filePath = path.join(workspacePath, fileName);
    if (fs.existsSync(filePath)) {
      files.push(parseFile(filePath, fileName, context));
    }
  }

  // Check agent directories (recursive for .claude/, 1-level for others)
  for (const dir of AGENT_DIRS) {
    const dirPath = path.join(workspacePath, dir);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      if (dir === ".claude" || dir === "claude") {
        // Recursively scan .claude/ tree (agents/, rules/, skills/, hooks/, etc.)
        scanDirRecursive(dirPath, files, dir, context, 0, 3);
      } else {
        // Other dirs: one level only
        const dirFiles = fs.readdirSync(dirPath);
        for (const fileName of dirFiles) {
          if (fileName.endsWith(".md") || fileName.endsWith(".txt")) {
            const filePath = path.join(dirPath, fileName);
            const relativeName = `${dir}/${fileName}`;
            if (!files.some((f) => f.path === filePath)) {
              files.push(parseFile(filePath, relativeName, context));
            }
          }
        }
      }
    }
  }

  // Hermes profile and plugin YAML belongs in FileInfo as text. Existing
  // rules are text-oriented, so introducing a YAML parser would add no value.
  for (const dir of HERMES_DIRS) {
    const dirPath = path.join(workspacePath, dir);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      scanHermesDir(dirPath, files, dir, context, 0, 4);
    }
  }

  // Also check for compound/ directory (Clawdbot pattern)
  const compoundDir = path.join(workspacePath, "compound");
  if (fs.existsSync(compoundDir) && fs.statSync(compoundDir).isDirectory()) {
    const compoundFiles = fs.readdirSync(compoundDir);
    for (const fileName of compoundFiles) {
      if (fileName.endsWith(".md")) {
        const filePath = path.join(compoundDir, fileName);
        files.push(parseFile(filePath, `compound/${fileName}`, context));
      }
    }
  }

  // Check ~/.openclaw/openclaw.json (runtime config)
  // ONLY include home config when scanning the home directory itself.
  // Scanning a project dir should NOT pull in the user's live API keys.
  const homeDir = process.env.HOME || process.env.USERPROFILE || "";
  const isHomeDir = homeDir && path.resolve(workspacePath) === path.resolve(homeDir);
  if (isHomeDir) {
    const runtimeConfigPaths = [
      path.join(homeDir, ".clawdbot", "clawdbot.json"),
      path.join(homeDir, ".openclaw", "openclaw.json"),
      path.join(homeDir, ".moltbot", "moltbot.json"),
    ];
    for (const configPath of runtimeConfigPaths) {
      if (fs.existsSync(configPath)) {
        const name = path.basename(configPath);
        files.push(parseFile(configPath, name, context));
        break; // Only read the first one found
      }
    }
  }

  // Scan skills/ directory for skill safety checks
  const skillsDirs = [
    path.join(workspacePath, "skills"),
    path.join(homeDir, ".clawdbot", "skills"),
    path.join(homeDir, ".openclaw", "skills"),
    path.join(homeDir, ".moltbot", "skills"),
  ];
  for (const skillsDir of skillsDirs) {
    if (fs.existsSync(skillsDir) && fs.statSync(skillsDir).isDirectory()) {
      scanSkillsDir(skillsDir, files, skillsDir, context);
    }
  }

  return files;
}

/**
 * Recursively scan a directory tree (for .claude/ and similar)
 */
function scanDirRecursive(
  dir: string,
  files: FileInfo[],
  prefix: string,
  context: LintContext,
  depth: number,
  maxDepth: number
) {
  if (depth > maxDepth) return;
  try {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      if (entry === "node_modules" || (entry.startsWith(".") && depth > 0)) continue;
      const fullPath = path.join(dir, entry);
      let stat: fs.Stats;
      try {
        stat = fs.statSync(fullPath);
      } catch {
        continue;
      }
      const relativeName = `${prefix}/${entry}`;
      if (stat.isDirectory()) {
        scanDirRecursive(fullPath, files, relativeName, context, depth + 1, maxDepth);
      } else if (
        entry.endsWith(".md") ||
        entry.endsWith(".txt") ||
        entry.endsWith(".json")
      ) {
        if (!files.some((f) => f.path === fullPath)) {
          files.push(parseFile(fullPath, relativeName, context));
        }
      }
    }
  } catch {
    // Permission denied or other error — skip
  }
}

function collectHermesMarkers(workspacePath: string, fileNames: string[]) {
  for (const dir of HERMES_DIRS) {
    const dirPath = path.join(workspacePath, dir);
    collectHermesPaths(dirPath, dir, fileNames, 0, 4);
  }
}

function collectHermesPaths(dir: string, prefix: string, fileNames: string[], depth: number, maxDepth: number) {
  if (depth > maxDepth || !fs.existsSync(dir)) return;
  try {
    for (const entry of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, entry);
      const relativeName = `${prefix}/${entry}`;
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        collectHermesPaths(fullPath, relativeName, fileNames, depth + 1, maxDepth);
      } else if (entry === "config.yaml" || /^plugin\.ya?ml$/.test(entry)) {
        fileNames.push(relativeName);
      }
    }
  } catch {
    // Optional unreadable runtime directories do not abort the scan.
  }
}

function scanHermesDir(dir: string, files: FileInfo[], prefix: string, context: LintContext, depth: number, maxDepth: number) {
  if (depth > maxDepth) return;
  try {
    for (const entry of fs.readdirSync(dir)) {
      if (entry === "node_modules") continue;
      const fullPath = path.join(dir, entry);
      const relativeName = `${prefix}/${entry}`;
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanHermesDir(fullPath, files, relativeName, context, depth + 1, maxDepth);
      } else if ([".md", ".json", ".yaml", ".yml"].some((extension) => entry.endsWith(extension))) {
        if (!files.some((file) => file.path === fullPath)) {
          files.push(parseFile(fullPath, relativeName, context));
        }
      }
    }
  } catch {
    // Optional unreadable runtime directories do not abort the scan.
  }
}

/**
 * Recursively scan skills directory (max depth 3)
 */
function scanSkillsDir(dir: string, files: FileInfo[], baseDir: string, context: LintContext, depth = 0) {
  if (depth > 3) return;
  try {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      if (entry === "node_modules" || entry.startsWith(".")) continue;
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanSkillsDir(fullPath, files, baseDir, context, depth + 1);
      } else if (entry === "SKILL.md" || entry.endsWith(".md")) {
        const relativeName = "skills/" + path.relative(baseDir, fullPath);
        // Avoid duplicates
        if (!files.some((f) => f.path === fullPath)) {
          files.push(parseFile(fullPath, relativeName, context));
        }
      }
    }
  } catch {
    // Permission denied or other error — skip
  }
}

/**
 * Parse a single markdown file
 */
export function parseFile(filePath: string, name: string, context: LintContext): FileInfo {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const sections = parseSections(lines);

  return { name, path: filePath, content, lines, sections, context };
}

/**
 * Extract sections from markdown by headings
 */
function parseSections(lines: string[]): Section[] {
  const sections: Section[] = [];
  let currentSection: Section | null = null;
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track code block state — skip heading detection inside code blocks
    if (line.trimStart().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
    }
    if (inCodeBlock) continue;

    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);

    if (headingMatch) {
      // Close previous section
      if (currentSection) {
        currentSection.endLine = i - 1;
        currentSection.content = lines
          .slice(currentSection.startLine, i)
          .join("\n");
        sections.push(currentSection);
      }

      currentSection = {
        heading: headingMatch[2].trim(),
        level: headingMatch[1].length,
        startLine: i,
        endLine: i,
        content: "",
      };
    }
  }

  // Close last section
  if (currentSection) {
    currentSection.endLine = lines.length - 1;
    currentSection.content = lines
      .slice(currentSection.startLine)
      .join("\n");
    sections.push(currentSection);
  }

  return sections;
}
