/* ─── Cursor Framework Rules ─── */

import { Rule, Diagnostic } from "../types";

export const cursorRules: Rule[] = [
  // cursor/rules-format: .cursorrules structure validation
  {
    id: "cursor/rules-format",
    category: "structure",
    severity: "warning",
    applicableContexts: ["cursor", "universal"],
    description: "Validates .cursorrules file structure and format",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      const cursorFile = files.find(
        (f) => f.name === ".cursorrules" || f.name.endsWith(".cursorrules")
      );
      if (!cursorFile) return diagnostics;

      // Check minimum content
      if (cursorFile.lines.length < 3) {
        diagnostics.push({
          severity: "warning",
          category: "structure",
          rule: this.id,
          file: cursorFile.name,
          message: ".cursorrules is too short (< 3 lines). Add meaningful instructions.",
          fix: "Add project-specific coding rules, style guidelines, and context for Cursor AI.",
        });
      }

      // Check for heading structure
      const hasHeadings = cursorFile.sections.length > 0;
      if (!hasHeadings && cursorFile.lines.length > 20) {
        diagnostics.push({
          severity: "info",
          category: "structure",
          rule: this.id,
          file: cursorFile.name,
          message: ".cursorrules has no section headings. Use markdown headers to organize rules.",
          fix: "Add ## headings to organize rules by topic (e.g., ## Code Style, ## Testing).",
        });
      }

      return diagnostics;
    },
  },

  // cursor/no-conflicting-claude: detect conflicts between .cursorrules and CLAUDE.md
  {
    id: "cursor/no-conflicting-claude",
    category: "consistency",
    severity: "warning",
    applicableContexts: ["cursor", "claude-code", "universal"],
    description: "Detects potential conflicts between .cursorrules and CLAUDE.md instructions",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      const cursorFile = files.find(
        (f) => f.name === ".cursorrules" || f.name.endsWith(".cursorrules")
      );
      const claudeFile = files.find((f) => f.name === "CLAUDE.md");

      if (!cursorFile || !claudeFile) return diagnostics;

      // Check for contradicting instructions (simple keyword overlap check)
      const conflictPatterns = [
        { pattern: /(?:use|prefer)\s+(tabs|spaces)/gi, desc: "indentation style" },
        { pattern: /(?:use|prefer)\s+(single|double)\s+quotes/gi, desc: "quote style" },
        { pattern: /(?:use|prefer)\s+(semicolons?|no semicolons?)/gi, desc: "semicolons" },
        { pattern: /(?:use|prefer)\s+(typescript|javascript)/gi, desc: "language preference" },
      ];

      for (const { pattern, desc } of conflictPatterns) {
        const cursorMatches: string[] = [];
        const claudeMatches: string[] = [];

        pattern.lastIndex = 0;
        let m;
        while ((m = pattern.exec(cursorFile.content)) !== null) {
          cursorMatches.push(m[1].toLowerCase());
        }
        pattern.lastIndex = 0;
        while ((m = pattern.exec(claudeFile.content)) !== null) {
          claudeMatches.push(m[1].toLowerCase());
        }

        if (cursorMatches.length > 0 && claudeMatches.length > 0) {
          const conflict = cursorMatches.some((cm) =>
            claudeMatches.some((clm) => cm !== clm)
          );
          if (conflict) {
            diagnostics.push({
              severity: "warning",
              category: "consistency",
              rule: this.id,
              file: cursorFile.name,
              message: `Potential conflict with CLAUDE.md on ${desc}: .cursorrules says "${cursorMatches[0]}", CLAUDE.md says "${claudeMatches[0]}".`,
              fix: "Align instructions across .cursorrules and CLAUDE.md to avoid confusion when switching between agents.",
            });
          }
        }
      }

      return diagnostics;
    },
  },
];
