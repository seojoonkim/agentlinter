/* ─── GitHub Copilot Framework Rules ─── */

import { Rule, Diagnostic } from "../types";

export const copilotRules: Rule[] = [
  // copilot/instructions-format: copilot-instructions.md format validation
  {
    id: "copilot/instructions-format",
    category: "structure",
    severity: "warning",
    applicableContexts: ["copilot", "universal"],
    description: "Validates .github/copilot-instructions.md structure and format",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      const copilotFile = files.find(
        (f) =>
          f.name === ".github/copilot-instructions.md" ||
          f.name.endsWith("copilot-instructions.md")
      );
      if (!copilotFile) return diagnostics;

      // Check minimum content
      if (copilotFile.lines.length < 3) {
        diagnostics.push({
          severity: "warning",
          category: "structure",
          rule: this.id,
          file: copilotFile.name,
          message: "copilot-instructions.md is too short (< 3 lines). Add meaningful instructions.",
          fix: "Add project-specific instructions for GitHub Copilot. Include coding style, patterns, and project context.",
        });
      }

      // Check for heading structure
      const hasHeadings = copilotFile.sections.length > 0;
      if (!hasHeadings && copilotFile.lines.length > 20) {
        diagnostics.push({
          severity: "info",
          category: "structure",
          rule: this.id,
          file: copilotFile.name,
          message: "copilot-instructions.md has no section headings. Use markdown headers to organize.",
          fix: "Add ## headings to structure your instructions (e.g., ## General, ## Code Style).",
        });
      }

      // GitHub Copilot instructions file size check (recommended < 500 lines)
      if (copilotFile.lines.length > 500) {
        diagnostics.push({
          severity: "warning",
          category: "structure",
          rule: this.id,
          file: copilotFile.name,
          message: `copilot-instructions.md is ${copilotFile.lines.length} lines. GitHub Copilot works best with concise instructions.`,
          fix: "Trim to essential instructions. Move detailed docs to separate files.",
        });
      }

      return diagnostics;
    },
  },

  // copilot/no-conflicting-claude: detect conflicts between copilot-instructions and CLAUDE.md
  {
    id: "copilot/no-conflicting-claude",
    category: "consistency",
    severity: "warning",
    applicableContexts: ["copilot", "claude-code", "universal"],
    description: "Detects potential conflicts between copilot-instructions.md and CLAUDE.md",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      const copilotFile = files.find(
        (f) =>
          f.name === ".github/copilot-instructions.md" ||
          f.name.endsWith("copilot-instructions.md")
      );
      const claudeFile = files.find((f) => f.name === "CLAUDE.md");

      if (!copilotFile || !claudeFile) return diagnostics;

      // Check for contradicting instructions
      const conflictPatterns = [
        { pattern: /(?:use|prefer)\s+(tabs|spaces)/gi, desc: "indentation style" },
        { pattern: /(?:use|prefer)\s+(single|double)\s+quotes/gi, desc: "quote style" },
        { pattern: /(?:use|prefer)\s+(semicolons?|no semicolons?)/gi, desc: "semicolons" },
        { pattern: /(?:use|prefer)\s+(typescript|javascript)/gi, desc: "language preference" },
      ];

      for (const { pattern, desc } of conflictPatterns) {
        const copilotMatches: string[] = [];
        const claudeMatches: string[] = [];

        pattern.lastIndex = 0;
        let m;
        while ((m = pattern.exec(copilotFile.content)) !== null) {
          copilotMatches.push(m[1].toLowerCase());
        }
        pattern.lastIndex = 0;
        while ((m = pattern.exec(claudeFile.content)) !== null) {
          claudeMatches.push(m[1].toLowerCase());
        }

        if (copilotMatches.length > 0 && claudeMatches.length > 0) {
          const conflict = copilotMatches.some((cp) =>
            claudeMatches.some((cl) => cp !== cl)
          );
          if (conflict) {
            diagnostics.push({
              severity: "warning",
              category: "consistency",
              rule: this.id,
              file: copilotFile.name,
              message: `Potential conflict with CLAUDE.md on ${desc}: copilot-instructions says "${copilotMatches[0]}", CLAUDE.md says "${claudeMatches[0]}".`,
              fix: "Align instructions across copilot-instructions.md and CLAUDE.md to maintain consistency.",
            });
          }
        }
      }

      return diagnostics;
    },
  },
];
