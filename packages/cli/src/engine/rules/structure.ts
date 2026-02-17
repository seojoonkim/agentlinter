/* ─── Structure Rules (20%) ─── */

import { Rule, FileInfo, Diagnostic } from "../types";

export const structureRules: Rule[] = [
  {
    id: "structure/has-main-file",
    category: "structure",
    severity: "critical",
    description: "Workspace must have a CLAUDE.md or AGENTS.md file",
    check(files) {
      const hasMain = files.some(
        (f) =>
          f.name === "CLAUDE.md" ||
          f.name === "AGENTS.md" ||
          f.name === ".claude/CLAUDE.md"
      );
      if (!hasMain) {
        return [
          {
            severity: "critical",
            category: "structure",
            rule: this.id,
            file: "(workspace)",
            message:
              "No CLAUDE.md or AGENTS.md found. This is the main entry point for your agent.",
            fix: "Create a CLAUDE.md file with your agent's core instructions.",
          },
        ];
      }
      return [];
    },
  },

  {
    id: "structure/has-sections",
    category: "structure",
    severity: "warning",
    description: "Main file should have organized sections with headings",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const mainFile = files.find(
        (f) => f.name === "CLAUDE.md" || f.name === "AGENTS.md"
      );
      if (mainFile && mainFile.sections.length < 3) {
        diagnostics.push({
          severity: "warning",
          category: "structure",
          rule: this.id,
          file: mainFile.name,
          message: `Only ${mainFile.sections.length} section(s) found. Use ## headings to organize instructions into clear sections (aim for 3+).`,
          fix: "Add sections like ## Identity, ## Tools, ## Boundaries, ## Memory Strategy",
        });
      }
      return diagnostics;
    },
  },

  {
    id: "structure/heading-hierarchy",
    category: "structure",
    severity: "info",
    description: "Headings should follow a logical hierarchy (no skipping levels)",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      for (const file of files) {
        if (!file.name.endsWith(".md")) continue;
        // Skip agent workspace dirs — research/log docs don't need strict heading hierarchy
        if (file.name.startsWith("compound/") || file.name.startsWith("memory/")) continue;
        let prevLevel = 0;
        for (const section of file.sections) {
          if (prevLevel > 0 && section.level > prevLevel + 1) {
            diagnostics.push({
              severity: "info",
              category: "structure",
              rule: this.id,
              file: file.name,
              line: section.startLine + 1,
              message: `Heading level skipped: h${prevLevel} → h${section.level}. Consider using h${prevLevel + 1} instead.`,
            });
          }
          prevLevel = section.level;
        }
      }
      return diagnostics;
    },
  },

  {
    id: "structure/file-size",
    category: "structure",
    severity: "warning",
    description: "Files should not be excessively long (readability)",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      for (const file of files) {
        if (file.name === "CLAUDE.md" || file.name === "AGENTS.md") {
          if (file.lines.length > 500) {
            diagnostics.push({
              severity: "warning",
              category: "structure",
              rule: this.id,
              file: file.name,
              message: `File is ${file.lines.length} lines — consider splitting into separate files (SOUL.md, TOOLS.md, etc.) for maintainability.`,
              fix: "Split into focused files: SOUL.md (identity), TOOLS.md (tool config), SECURITY.md (security rules)",
            });
          }
        }
      }
      return diagnostics;
    },
  },

  {
    id: "structure/modular-files",
    category: "structure",
    severity: "info",
    description: "Using multiple focused files is better than one monolith",
    check(files) {
      const mdFiles = files.filter((f) => f.name.endsWith(".md"));
      if (mdFiles.length === 1 && mdFiles[0].lines.length > 100) {
        return [
          {
            severity: "info",
            category: "structure",
            rule: this.id,
            file: mdFiles[0].name,
            message:
              "Only 1 file found with 100+ lines. Consider splitting into modular files for better organization.",
            fix: "Create separate files: SOUL.md (personality), USER.md (user context), TOOLS.md (tool documentation)",
          },
        ];
      }
      return [];
    },
  },

  {
    id: "structure/no-empty-sections",
    category: "structure",
    severity: "warning",
    description: "Core agent files should not have empty sections",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      // Only check core agent files, not compound/working docs
      const coreFiles = files.filter(
        (f) =>
          !f.name.startsWith("compound/") &&
          !f.name.startsWith("memory/") &&
          f.name.endsWith(".md")
      );
      for (const file of coreFiles) {
        for (let idx = 0; idx < file.sections.length; idx++) {
          const section = file.sections[idx];
          const bodyLines = section.content
            .split("\n")
            .slice(1)
            .filter((l) => l.trim().length > 0);
          // A section is truly empty only if it has no body AND no subsections follow immediately
          const nextSection = file.sections[idx + 1];
          const hasSubsection =
            nextSection && nextSection.level > section.level;
          if (bodyLines.length === 0 && !hasSubsection) {
            diagnostics.push({
              severity: "warning",
              category: "structure",
              rule: this.id,
              file: file.name,
              line: section.startLine + 1,
              message: `Empty section: "${section.heading}". Either add content or remove the heading.`,
            });
          }
        }
      }
      return diagnostics;
    },
  },

  {
    id: "structure/has-file-map",
    category: "structure",
    severity: "info",
    description: "A file map helps agents navigate the workspace",
    check(files) {
      const mainFile = files.find(
        (f) => f.name === "CLAUDE.md" || f.name === "AGENTS.md"
      );
      if (!mainFile) return [];

      const hasFileMap =
        /file.?map|directory|tree|structure/i.test(mainFile.content) &&
        (mainFile.content.includes("├") || mainFile.content.includes("└") || mainFile.content.includes("```"));

      if (!hasFileMap && files.length > 5) {
        return [
          {
            severity: "info",
            category: "structure",
            rule: this.id,
            file: mainFile.name,
            message:
              "No file map found. With 5+ files, a directory tree helps the agent navigate.",
            fix: "Add a ## File Map section with a tree structure showing all agent files.",
          },
        ];
      }
      return [];
    },
  },

  {
    id: "structure/has-version-or-update-date",
    category: "structure",
    severity: "info",
    description: "Files should indicate when they were last updated",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const coreFiles = files.filter(
        (f) =>
          !f.name.startsWith("compound/") &&
          !f.name.startsWith("memory/") &&
          (f.name === "CLAUDE.md" || f.name === "AGENTS.md" || f.name === "TOOLS.md")
      );
      for (const file of coreFiles) {
        const hasDate = /(?:last )?update|version|modified|date|v\d+\.\d+/i.test(file.content);
        if (!hasDate) {
          diagnostics.push({
            severity: "info",
            category: "structure",
            rule: this.id,
            file: file.name,
            message: "No version or update date found. Helps track freshness of instructions.",
            fix: "Add a version comment or 'Last updated: YYYY-MM-DD' at the top or bottom.",
          });
        }
      }
      return diagnostics;
    },
  },
];
