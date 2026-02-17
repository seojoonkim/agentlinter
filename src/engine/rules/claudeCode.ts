/* ─── Claude Code v0.8.0 Rules ─── */
/*
 * Rules reflecting Claude Code's latest spec:
 * - Memory 6-layer hierarchy (Managed → Project → Rules → User → Local → Auto Memory)
 * - .claude/rules/ path-specific rule validation
 * - @import recursion depth limit (max 5 levels)
 * - Auto Memory MEMORY.md 200-line limit
 * - Agent description required (.claude/agents/*.md)
 * - Plugin manifest validation (.claude-plugin/plugin.json)
 * - Repomix-generated skill detection hint
 */

import { Rule, Diagnostic } from "../types";

export const claudeCodeRules: Rule[] = [
  /* ── 1. Agent description required ── */
  {
    id: "claude-code/agent-description-required",
    category: "completeness",
    severity: "error",
    description:
      "Agent files in .claude/agents/ must have a description frontmatter field — used by Claude to decide when to delegate",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      const agentFiles = files.filter(
        (f) =>
          (f.name.includes(".claude/agents/") || f.name.includes("/.claude/agents/")) &&
          f.name.endsWith(".md")
      );

      for (const file of agentFiles) {
        if (!file.content.startsWith("---")) {
          diagnostics.push({
            severity: "error",
            category: "completeness",
            rule: this.id,
            file: file.name,
            message: "Agent file missing YAML frontmatter. 'name' and 'description' are required.",
            fix: "Add frontmatter:\n---\nname: agent-name\ndescription: \"When to delegate to this agent\"\n---",
          });
          continue;
        }

        const frontmatter = file.content.split("---")[1] || "";

        if (!frontmatter.includes("description")) {
          diagnostics.push({
            severity: "error",
            category: "completeness",
            rule: this.id,
            file: file.name,
            message:
              "Agent missing 'description' field — Claude uses this to decide when to delegate tasks.",
            fix:
              "Add description to frontmatter. Include 'PROACTIVELY' keyword if you want automatic delegation:\n  description: \"PROACTIVELY use this agent when working with TypeScript files\"",
          });
        }

        if (!frontmatter.includes("name")) {
          diagnostics.push({
            severity: "warning",
            category: "completeness",
            rule: this.id,
            file: file.name,
            message: "Agent missing 'name' field (falls back to filename).",
            fix: "Add name field: name: my-agent-name",
          });
        }
      }

      return diagnostics;
    },
  },

  /* ── 2. Plugin manifest validation ── */
  {
    id: "claude-code/validate-plugin-manifest",
    category: "structure",
    severity: "warning",
    description:
      "Validate .claude-plugin/plugin.json manifest — required for Claude Code Plugin distribution",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      const manifestFile = files.find(
        (f) =>
          f.name === ".claude-plugin/plugin.json" ||
          f.name.endsWith("/.claude-plugin/plugin.json")
      );

      if (!manifestFile) return []; // No plugin — that's fine

      let manifest: Record<string, unknown>;
      try {
        manifest = JSON.parse(manifestFile.content);
      } catch (e) {
        return [
          {
            severity: "error",
            category: "structure",
            rule: this.id,
            file: manifestFile.name,
            message: `Invalid JSON in plugin.json: ${(e as Error).message}`,
            fix: "Fix JSON syntax. Required fields: name, version, description.",
          },
        ];
      }

      const REQUIRED_FIELDS = ["name", "version"] as const;
      const SEMVER_PATTERN = /^\d+\.\d+\.\d+/;

      for (const field of REQUIRED_FIELDS) {
        if (!manifest[field]) {
          diagnostics.push({
            severity: "error",
            category: "structure",
            rule: this.id,
            file: manifestFile.name,
            message: `plugin.json missing required field: '${field}'`,
            fix: `Add '${field}' to plugin.json. Example: { "name": "my-plugin", "version": "1.0.0" }`,
          });
        }
      }

      if (manifest.version && typeof manifest.version === "string") {
        if (!SEMVER_PATTERN.test(manifest.version)) {
          diagnostics.push({
            severity: "warning",
            category: "structure",
            rule: this.id,
            file: manifestFile.name,
            message: `plugin.json version '${manifest.version}' is not valid semver (e.g. 1.0.0).`,
            fix: "Use semver format: MAJOR.MINOR.PATCH",
          });
        }
      }

      if (!manifest.description) {
        diagnostics.push({
          severity: "warning",
          category: "structure",
          rule: this.id,
          file: manifestFile.name,
          message: "plugin.json missing 'description' — shown in Plugin Marketplace.",
          fix: 'Add: "description": "What this plugin does"',
        });
      }

      // Check plugin directory structure
      const hasPluginDir = files.some((f) => f.name.includes(".claude-plugin/"));
      const hasPluginOutsideDir = files.some(
        (f) =>
          (f.name.includes("agents/") || f.name.includes("skills/")) &&
          !f.name.includes(".claude/") &&
          !f.name.includes(".claude-plugin/")
      );

      if (hasPluginDir && hasPluginOutsideDir) {
        diagnostics.push({
          severity: "warning",
          category: "structure",
          rule: this.id,
          file: manifestFile.name,
          message:
            "Plugin agents/skills appear to be outside the plugin directory structure.",
          fix:
            "Plugin assets (agents/, skills/, hooks/) should be siblings of .claude-plugin/, not inside it.",
        });
      }

      return diagnostics;
    },
  },

  /* ── 3. Memory hierarchy: Auto Memory 200-line limit ── */
  {
    id: "claude-code/auto-memory-line-limit",
    category: "memory",
    severity: "warning",
    description:
      "Auto Memory MEMORY.md files should stay under 200 lines — only the first 200 lines are auto-loaded by Claude Code",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      const memoryFiles = files.filter(
        (f) =>
          f.name === "MEMORY.md" ||
          f.name.endsWith("/MEMORY.md") ||
          f.name.toLowerCase().includes("memory.md")
      );

      for (const file of memoryFiles) {
        if (file.lines.length > 200) {
          diagnostics.push({
            severity: "warning",
            category: "memory",
            rule: this.id,
            file: file.name,
            message: `MEMORY.md has ${file.lines.length} lines. Claude Code only auto-loads the first 200 lines — content beyond line 200 is ignored.`,
            fix:
              "Split overflow content into topic files (e.g., memory/skills.md, memory/projects.md). Keep MEMORY.md as an index under 200 lines.",
          });
        }
      }

      return diagnostics;
    },
  },

  /* ── 4. @import recursion depth limit ── */
  {
    id: "claude-code/import-depth-limit",
    category: "structure",
    severity: "warning",
    description:
      "Claude Code supports @import up to 5 levels deep — deeper chains may silently fail",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      // Build import map: file → [imported files]
      const importMap = new Map<string, string[]>();
      const IMPORT_PATTERN = /@import\s+([^\s\n]+)/g;

      for (const file of files) {
        const imports: string[] = [];
        for (const match of file.content.matchAll(IMPORT_PATTERN)) {
          imports.push(match[1]);
        }
        if (imports.length > 0) {
          importMap.set(file.name, imports);
        }
      }

      // DFS to find max depth chains
      const getDepth = (
        fileName: string,
        visited = new Set<string>()
      ): number => {
        if (visited.has(fileName)) return 0; // Circular import guard
        visited.add(fileName);
        const imports = importMap.get(fileName) || [];
        if (imports.length === 0) return 0;
        return 1 + Math.max(...imports.map((imp) => getDepth(imp, new Set(visited))));
      };

      for (const [fileName] of importMap) {
        const depth = getDepth(fileName);
        if (depth >= 5) {
          diagnostics.push({
            severity: "warning",
            category: "structure",
            rule: this.id,
            file: fileName,
            message: `@import chain depth is ${depth + 1} levels. Claude Code supports max 5 levels — imports beyond this may be silently ignored.`,
            fix: "Flatten the import chain or restructure files to stay within 5 levels of @import nesting.",
          });
        }
      }

      return diagnostics;
    },
  },

  /* ── 5. .claude/rules/ path-specific rule validation ── */
  {
    id: "claude-code/validate-rules-path",
    category: "structure",
    severity: "info",
    description:
      "Files in .claude/rules/ support path-specific activation via YAML frontmatter 'paths' field",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      const ruleFiles = files.filter(
        (f) =>
          (f.name.includes(".claude/rules/") || f.name.includes("/.claude/rules/")) &&
          f.name.endsWith(".md")
      );

      for (const file of ruleFiles) {
        if (!file.content.startsWith("---")) {
          diagnostics.push({
            severity: "info",
            category: "structure",
            rule: this.id,
            file: file.name,
            message:
              "Rule file in .claude/rules/ has no frontmatter. Consider adding a 'paths' field for context-specific activation.",
            fix:
              "Add frontmatter with paths glob:\n---\npaths:\n  - \"src/**/*.ts\"\n  - \"tests/**\"\n---",
          });
          continue;
        }

        const frontmatter = file.content.split("---")[1] || "";

        if (!frontmatter.includes("paths")) {
          diagnostics.push({
            severity: "info",
            category: "structure",
            rule: this.id,
            file: file.name,
            message:
              "Rule file missing 'paths' field — applies globally. Add 'paths' to activate only for relevant files.",
            fix:
              "Add paths to limit activation:\n---\npaths:\n  - \"src/**\"\n---",
          });
        }

        // Validate glob patterns if present
        const pathsMatch = frontmatter.match(/paths:\s*([\s\S]*?)(?=\n\w|\n---)/);
        if (pathsMatch) {
          const pathLines = pathsMatch[1]
            .split("\n")
            .filter((l) => l.trim().startsWith("-"))
            .map((l) => l.replace(/^\s*-\s*["']?/, "").replace(/["']?\s*$/, ""));

          for (const glob of pathLines) {
            if (glob && !/[\w*?[\]/.]/.test(glob)) {
              diagnostics.push({
                severity: "warning",
                category: "structure",
                rule: this.id,
                file: file.name,
                message: `Paths glob pattern may be invalid: "${glob}"`,
                fix: "Use standard glob patterns: 'src/**/*.ts', '*.md', 'tests/**'",
              });
            }
          }
        }
      }

      return diagnostics;
    },
  },

  /* ── 6. Repomix-generated skill detection hint ── */
  {
    id: "claude-code/repomix-skill-hint",
    category: "skillSafety",
    severity: "info",
    description:
      "Detect Repomix-generated skills and suggest AgentLinter validation workflow",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      const repomixSignatures = [
        /repomix/i,
        /Generated by Repomix/i,
        /This file is a merged representation/i,
        /project-structure\.md/,
        /tech-stack\.md/,
        /files\.md.*grep/i,
      ];

      const skillFiles = files.filter(
        (f) =>
          f.name.includes("skills/") &&
          (f.name.endsWith("SKILL.md") || f.name.endsWith("/files.md") || f.name.endsWith("/tech-stack.md") || f.name.endsWith("/summary.md"))
      );

      const detectedRepomixSkills: string[] = [];

      for (const file of skillFiles) {
        const isRepomix = repomixSignatures.some((p) =>
          p.test(file.content.substring(0, 500))
        );
        if (isRepomix) {
          detectedRepomixSkills.push(file.name);
        }
      }

      // Also check for typical repomix skill structure (references/ subdirectory)
      const hasRepomixStructure = files.some(
        (f) =>
          f.name.includes("/references/") &&
          (f.name.endsWith("files.md") || f.name.endsWith("tech-stack.md"))
      );

      if (hasRepomixSkills(files) || hasRepomixStructure) {
        diagnostics.push({
          severity: "info",
          category: "skillSafety",
          rule: this.id,
          file: "(workspace)",
          message: `Repomix로 생성된 skill 감지됨 — 자동 생성 skill은 추가 검증을 권장합니다.`,
          fix:
            "Repomix-generated skills may have large reference files. Verify:\n" +
            "1. SKILL.md has description (claude-code/skill-description-required)\n" +
            "2. File size is under 500 lines (skill-safety/skill-line-limit)\n" +
            "3. Run: npx agentlinter --focus skills",
        });
      }

      return diagnostics;
    },
  },

  /* ── 7. Memory hierarchy awareness ── */
  {
    id: "claude-code/memory-hierarchy-awareness",
    category: "memory",
    severity: "info",
    description:
      "Claude Code supports 6-layer memory hierarchy — agent configs should align with this structure",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      const allContent = files.map((f) => f.content).join("\n");

      // Check if project uses CLAUDE.local.md without gitignore
      const hasLocalMemory = files.some(
        (f) => f.name === "CLAUDE.local.md" || f.name.endsWith("/CLAUDE.local.md")
      );

      const hasGitignore = files.some((f) => f.name === ".gitignore");

      if (hasLocalMemory && hasGitignore) {
        const gitignoreFile = files.find((f) => f.name === ".gitignore");
        if (gitignoreFile && !gitignoreFile.content.includes("CLAUDE.local.md")) {
          diagnostics.push({
            severity: "warning",
            category: "memory",
            rule: this.id,
            file: ".gitignore",
            message:
              "CLAUDE.local.md (local/personal memory) is not in .gitignore. This file should stay private and not be committed.",
            fix: "Add CLAUDE.local.md to .gitignore to prevent accidental commits of personal context.",
          });
        }
      }

      // Check if agent recommends using .claude/rules/ for modular memory
      const hasRulesDir = files.some((f) => f.name.includes(".claude/rules/"));
      const hasVeryLongClaudeMd = files.some(
        (f) =>
          (f.name === "CLAUDE.md" || f.name === "AGENTS.md") &&
          f.lines.length > 200
      );

      if (hasVeryLongClaudeMd && !hasRulesDir) {
        diagnostics.push({
          severity: "info",
          category: "memory",
          rule: this.id,
          file: "(workspace)",
          message:
            "Main config file exceeds 200 lines but no .claude/rules/ directory found. Consider modular rules.",
          fix:
            "Create .claude/rules/ with path-specific rules to reduce main file length:\n" +
            "  .claude/rules/typescript.md (paths: ['**/*.ts'])\n" +
            "  .claude/rules/testing.md (paths: ['tests/**'])",
        });
      }

      return diagnostics;
    },
  },
];

/** Helper: detect repomix skill structure by checking for references/ subdirectory pattern */
function hasRepomixSkills(files: { name: string; content: string }[]): boolean {
  const skillDirs = new Set<string>();
  for (const f of files) {
    if (f.name.includes("skills/") && f.name.endsWith("SKILL.md")) {
      const parts = f.name.split("/");
      const skillIdx = parts.indexOf("skills");
      if (skillIdx >= 0 && parts[skillIdx + 1]) {
        skillDirs.add(parts.slice(0, skillIdx + 2).join("/"));
      }
    }
  }
  for (const skillDir of skillDirs) {
    const hasReferences = files.some((f) =>
      f.name.startsWith(skillDir + "/references/")
    );
    if (hasReferences) return true;
  }
  return false;
}
