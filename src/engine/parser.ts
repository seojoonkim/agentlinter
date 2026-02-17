/* ─── Markdown Parser ─── */

import { FileInfo, Section } from "./types";
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
  "clawdbot.json",
  "openclaw.json",
];

const AGENT_DIRS = [".claude", "claude", ".cursor", ".windsurf"];

/**
 * Scan a workspace for agent configuration files
 */
export function scanWorkspace(workspacePath: string): FileInfo[] {
  const files: FileInfo[] = [];

  // Check root-level files
  for (const fileName of AGENT_FILES) {
    const filePath = path.join(workspacePath, fileName);
    if (fs.existsSync(filePath)) {
      files.push(parseFile(filePath, fileName));
    }
  }

  // Check agent directories
  for (const dir of AGENT_DIRS) {
    const dirPath = path.join(workspacePath, dir);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      const dirFiles = fs.readdirSync(dirPath);
      for (const fileName of dirFiles) {
        if (fileName.endsWith(".md") || fileName.endsWith(".txt")) {
          const filePath = path.join(dirPath, fileName);
          const relativeName = `${dir}/${fileName}`;
          files.push(parseFile(filePath, relativeName));
        }
      }
    }
  }

  // Also check for compound/ directory (Clawdbot pattern)
  const compoundDir = path.join(workspacePath, "compound");
  if (fs.existsSync(compoundDir) && fs.statSync(compoundDir).isDirectory()) {
    const compoundFiles = fs.readdirSync(compoundDir);
    for (const fileName of compoundFiles) {
      if (fileName.endsWith(".md")) {
        const filePath = path.join(compoundDir, fileName);
        files.push(parseFile(filePath, `compound/${fileName}`));
      }
    }
  }

  // Check ~/.openclaw/openclaw.json (runtime config)
  // ONLY include home config when scanning the home directory itself.
  // Scanning a project dir should NOT pull in the user's live API keys.
  const homeDir = process.env.HOME || process.env.USERPROFILE || "";
  const isHomeDir = homeDir && path.resolve(workspacePath) === path.resolve(homeDir);
  if (isHomeDir) {
    const clawdbotConfigPaths = [
      path.join(homeDir, ".clawdbot", "clawdbot.json"),
      path.join(homeDir, ".openclaw", "openclaw.json"),
    ];
    for (const configPath of clawdbotConfigPaths) {
      if (fs.existsSync(configPath)) {
        const name = path.basename(configPath);
        files.push(parseFile(configPath, name));
        break; // Only read the first one found
      }
    }
  }

  // Scan skills/ directory for skill safety checks
  const skillsDirs = [
    path.join(workspacePath, "skills"),
    path.join(homeDir, ".clawdbot", "skills"),
    path.join(homeDir, ".openclaw", "skills"),
  ];
  for (const skillsDir of skillsDirs) {
    if (fs.existsSync(skillsDir) && fs.statSync(skillsDir).isDirectory()) {
      scanSkillsDir(skillsDir, files, skillsDir);
    }
  }

  return files;
}

/**
 * Recursively scan skills directory (max depth 3)
 */
function scanSkillsDir(dir: string, files: FileInfo[], baseDir: string, depth = 0) {
  if (depth > 3) return;
  try {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      if (entry === "node_modules" || entry.startsWith(".")) continue;
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanSkillsDir(fullPath, files, baseDir, depth + 1);
      } else if (entry === "SKILL.md" || entry.endsWith(".md")) {
        const relativeName = "skills/" + path.relative(baseDir, fullPath);
        // Avoid duplicates
        if (!files.some((f) => f.path === fullPath)) {
          files.push(parseFile(fullPath, relativeName));
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
export function parseFile(filePath: string, name: string): FileInfo {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const sections = parseSections(lines);

  return { name, path: filePath, content, lines, sections };
}

/**
 * Extract sections from markdown by headings
 */
function parseSections(lines: string[]): Section[] {
  const sections: Section[] = [];
  let currentSection: Section | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
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
