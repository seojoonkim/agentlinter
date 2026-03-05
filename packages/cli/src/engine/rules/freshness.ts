/* ─── Freshness / Staleness Detector ─── */
// v2.1: stale-file-reference, stale-date, stale-package-reference

import { Rule, Diagnostic } from "../types";
import * as fs from "fs";
import * as path from "path";

// Extract file paths from markdown content
const PATH_PATTERNS = [
  /`((?:\.\.?\/|~\/)[^`\s]+)`/g,           // `./path` or `~/path` or `../path`
  /`([a-zA-Z0-9_\-./]+\.[a-zA-Z]{1,5})`/g, // `file.ext` in backticks
];

// Date patterns
const DATE_PATTERNS = [
  /(\d{4}-\d{2}-\d{2})/g,                            // YYYY-MM-DD
  /(?:last_updated|updated|date):\s*(\d{4}-\d{2}-\d{2})/gi, // key: YYYY-MM-DD
];

// Package reference patterns
const PKG_PATTERNS = [
  /npm install\s+([a-z@][a-z0-9\-_@/.]*)/gi,
  /yarn add\s+([a-z@][a-z0-9\-_@/.]*)/gi,
  /pnpm add\s+([a-z@][a-z0-9\-_@/.]*)/gi,
  /`([a-z@][a-z0-9\-_@/.]*)`\s+(?:package|dependency|library)/gi,
];

function getDaysAgo(dateStr: string): number {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return -1;
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export const freshnessRules: Rule[] = [
  // stale-file-reference
  {
    id: "consistency/stale-file-reference",
    category: "consistency",
    severity: "warning",
    description: "Checks that file paths referenced in markdown actually exist on disk",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const targetFiles = files.filter(
        (f) => !f.name.startsWith("compound/") && !f.name.startsWith("memory/") && f.name.endsWith(".md")
      );

      for (const file of targetFiles) {
        const workspaceDir = file.path ? path.dirname(file.path) : ".";
        // Walk up to find workspace root (where the agent file is)
        const rootDir = file.path
          ? path.resolve(path.dirname(file.path), "..")
          : process.cwd();

        let codeBlock = false;
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];
          if (line.trim().startsWith("```")) {
            codeBlock = !codeBlock;
            continue;
          }
          if (codeBlock) continue;

          for (const pattern of PATH_PATTERNS) {
            pattern.lastIndex = 0;
            let match;
            while ((match = pattern.exec(line)) !== null) {
              const refPath = match[1];
              // Skip URLs, anchors, wildcards
              if (refPath.includes("://") || refPath.startsWith("#") || refPath.includes("*")) continue;
              // Skip dynamic placeholder paths
              const DYNAMIC_PLACEHOLDERS = /YYYY|MM[-\/]DD|HH:mm|\{[^}]+\}|\$\{[^}]+\}|<[^>]+>/;
              if (DYNAMIC_PLACEHOLDERS.test(refPath)) continue;

              // Resolve path relative to workspace
              let resolved = refPath;
              if (refPath.startsWith("~/")) {
                resolved = path.join(process.env.HOME || "", refPath.slice(2));
              } else if (refPath.startsWith("./") || refPath.startsWith("../")) {
                resolved = path.resolve(workspaceDir, refPath);
              } else {
                // Try relative to root, then fall back to workspaceDir
                resolved = path.resolve(rootDir, refPath);
                if (!fs.existsSync(resolved)) {
                  resolved = path.resolve(workspaceDir, refPath);
                }
              }

              if (!fs.existsSync(resolved)) {
                diagnostics.push({
                  severity: "warning",
                  category: "consistency",
                  rule: this.id,
                  file: file.name,
                  line: i + 1,
                  message: `Referenced file \`${refPath}\` does not exist.`,
                  fix: "Update the path or remove the stale reference.",
                });
              }
            }
          }
        }
      }

      return diagnostics;
    },
  },

  // stale-date
  {
    id: "consistency/stale-date",
    category: "consistency",
    severity: "warning",
    description: "Detects dates older than 90 days (warning) or 180 days (error) in agent files",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const coreFiles = files.filter(
        (f) => !f.name.startsWith("compound/") && !f.name.startsWith("memory/")
      );
      for (const file of coreFiles) {
        let codeBlock = false;
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];
          if (line.trim().startsWith("```")) {
            codeBlock = !codeBlock;
            continue;
          }
          if (codeBlock) continue;

          for (const pattern of DATE_PATTERNS) {
            pattern.lastIndex = 0;
            let match;
            while ((match = pattern.exec(line)) !== null) {
              const dateStr = match[1];
              const daysAgo = getDaysAgo(dateStr);
              if (daysAgo < 0) continue;

              if (daysAgo >= 180) {
                diagnostics.push({
                  severity: "error",
                  category: "consistency",
                  rule: this.id,
                  file: file.name,
                  line: i + 1,
                  message: `Date ${dateStr} is ${daysAgo} days old (>180 days). Content may be severely outdated.`,
                  fix: "Review and update the content, or update the date if already verified.",
                });
              } else if (daysAgo >= 90) {
                diagnostics.push({
                  severity: "warning",
                  category: "consistency",
                  rule: this.id,
                  file: file.name,
                  line: i + 1,
                  message: `Date ${dateStr} is ${daysAgo} days old (>90 days). Content may be outdated.`,
                  fix: "Verify the content is still current and update the date.",
                });
              }
            }
          }
        }
      }

      return diagnostics;
    },
  },

  // stale-package-reference
  {
    id: "consistency/stale-package-reference",
    category: "consistency",
    severity: "info",
    description: "Cross-checks package names referenced in markdown against package.json",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      // Try to find package.json in workspace
      let pkgDeps: Set<string> | null = null;
      for (const file of files) {
        if (!file.path) continue;
        const pkgPath = path.resolve(path.dirname(file.path), "package.json");
        if (fs.existsSync(pkgPath)) {
          try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
            pkgDeps = new Set([
              ...Object.keys(pkg.dependencies || {}),
              ...Object.keys(pkg.devDependencies || {}),
              ...Object.keys(pkg.peerDependencies || {}),
            ]);
          } catch {
            // ignore parse errors
          }
          break;
        }
        // Also try parent directory
        const parentPkgPath = path.resolve(path.dirname(file.path), "..", "package.json");
        if (fs.existsSync(parentPkgPath)) {
          try {
            const pkg = JSON.parse(fs.readFileSync(parentPkgPath, "utf-8"));
            pkgDeps = new Set([
              ...Object.keys(pkg.dependencies || {}),
              ...Object.keys(pkg.devDependencies || {}),
              ...Object.keys(pkg.peerDependencies || {}),
            ]);
          } catch {
            // ignore
          }
          break;
        }
      }

      if (!pkgDeps) return diagnostics;

      for (const file of files) {
        if (!file.name.endsWith(".md")) continue;

        let codeBlock = false;
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];
          if (line.trim().startsWith("```")) {
            codeBlock = !codeBlock;
            continue;
          }
          if (codeBlock) continue;

          for (const pattern of PKG_PATTERNS) {
            pattern.lastIndex = 0;
            let match;
            while ((match = pattern.exec(line)) !== null) {
              const pkgName = match[1].replace(/@[\d^~><=.*]+$/, ""); // strip version suffix
              if (pkgName && !pkgDeps.has(pkgName)) {
                diagnostics.push({
                  severity: "info",
                  category: "consistency",
                  rule: this.id,
                  file: file.name,
                  line: i + 1,
                  message: `Referenced package \`${pkgName}\` not found in package.json.`,
                  fix: "Add the package to dependencies or remove the stale reference.",
                });
              }
            }
          }
        }
      }

      return diagnostics;
    },
  },
];
