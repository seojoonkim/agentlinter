/* ─── Auto-fix Suggestions (actionable transformations) ─── */

import { Rule, Diagnostic } from "../types";

// Helper: simple similarity check (Jaccard index on words)
function calculateSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.split(/\s+/));
  const wordsB = new Set(b.split(/\s+/));
  const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
  const union = new Set([...wordsA, ...wordsB]);
  return intersection.size / union.size;
}

export const autofixRules: Rule[] = [
  {
    id: "autofix/extract-instructions",
    category: "structure",
    severity: "info",
    description: "Suggest extracting instructions to skills/ or .claude/rules/",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      
      const mainFile = files.find(
        (f) => f.name === "CLAUDE.md" || f.name === "AGENTS.md"
      );
      if (!mainFile || mainFile.lines.length < 100) return [];

      // Detect domain-specific sections that should be extracted
      const EXTRACTABLE_SECTIONS = [
        { pattern: /##\s*(git|github|version control|commit)/i, target: "skills/git-workflow.md" },
        { pattern: /##\s*(deploy|deployment|ci.?cd|release)/i, target: "skills/deployment.md" },
        { pattern: /##\s*(test|testing|qa|quality)/i, target: ".claude/rules/testing.md" },
        { pattern: /##\s*(security|auth|permission|access)/i, target: "skills/security.md" },
        { pattern: /##\s*(code.?style|format|linting|convention)/i, target: ".claude/rules/code-style.md" },
        { pattern: /##\s*(api|endpoint|route|request)/i, target: "skills/api-design.md" },
        { pattern: /##\s*(database|sql|query|migration)/i, target: "skills/database.md" },
        { pattern: /##\s*(ui|ux|design|component)/i, target: ".claude/rules/ui-patterns.md" },
      ];

      for (const section of mainFile.sections) {
        for (const { pattern, target } of EXTRACTABLE_SECTIONS) {
          if (pattern.test(section.heading)) {
            const sectionLength = section.endLine - section.startLine;
            if (sectionLength > 15) {
              diagnostics.push({
                severity: "info",
                category: "structure",
                rule: this.id,
                file: mainFile.name,
                line: section.startLine + 1,
                message: `Section "${section.heading}" (${sectionLength} lines) can be extracted to ${target}`,
                fix: `Create ${target} and move this section there. It will be auto-loaded and can be path-scoped.`,
              });
            }
          }
        }
      }

      return diagnostics;
    },
  },

  {
    id: "autofix/convert-code-snippets",
    category: "clarity",
    severity: "info",
    description: "Convert embedded code snippets to file references",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      
      for (const file of files) {
        if (!file.name.endsWith(".md")) continue;
        
        let inCodeBlock = false;
        let codeBlockStart = -1;
        let codeBlockLines = 0;

        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i].trim();
          
          if (line.startsWith("```")) {
            if (!inCodeBlock) {
              inCodeBlock = true;
              codeBlockStart = i + 1;
              codeBlockLines = 0;
            } else {
              inCodeBlock = false;
              // Check if code block is too long
              if (codeBlockLines > 20) {
                diagnostics.push({
                  severity: "info",
                  category: "clarity",
                  rule: this.id,
                  file: file.name,
                  line: codeBlockStart,
                  message: `Large code snippet (${codeBlockLines} lines) embedded. Extract to file and reference instead.`,
                  fix: `Extract to a file (e.g., examples/snippet-name.ext) and reference: 'See examples/snippet-name.ext:10-30'`,
                });
              }
            }
          } else if (inCodeBlock) {
            codeBlockLines++;
          }
        }
      }

      return diagnostics;
    },
  },

  {
    id: "autofix/structure-optimizer",
    category: "structure",
    severity: "info",
    description: "Suggest WHY/WHAT/HOW structure for instructions",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      
      const mainFile = files.find(
        (f) => f.name === "CLAUDE.md" || f.name === "AGENTS.md"
      );
      if (!mainFile) return [];

      // Check if file has WHY/WHAT/HOW structure
      const hasWhyWhatHow = mainFile.sections.some(s => 
        /\b(why|what|how|rationale|context|implementation)\b/i.test(s.heading)
      );

      if (!hasWhyWhatHow && mainFile.lines.length > 80) {
        diagnostics.push({
          severity: "info",
          category: "structure",
          rule: this.id,
          file: mainFile.name,
          message: "Consider WHY/WHAT/HOW structure for better agent comprehension.",
          fix: "Organize sections: ## Why (context/rationale) → ## What (goals/requirements) → ## How (implementation/rules)",
        });
      }

      // Check individual sections for missing context
      for (const section of mainFile.sections) {
        if (section.level > 2) continue; // Only check top-level sections
        
        const hasRationale = /\b(because|since|to|for|why|rationale|reason|goal|purpose)\b/i.test(section.content);
        const hasInstructions = /^[-*]\s/m.test(section.content);
        
        if (hasInstructions && !hasRationale && section.content.split("\n").length > 10) {
          diagnostics.push({
            severity: "info",
            category: "structure",
            rule: this.id,
            file: mainFile.name,
            line: section.startLine + 1,
            message: `Section "${section.heading}" has instructions without context/rationale.`,
            fix: "Add a brief WHY paragraph before the instruction list to improve agent understanding.",
          });
        }
      }

      return diagnostics;
    },
  },

  {
    id: "autofix/consolidate-duplicates",
    category: "consistency",
    severity: "warning",
    description: "Detect and suggest consolidating duplicate or similar instructions",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      
      for (const file of files) {
        if (!file.name.endsWith(".md")) continue;
        
        // Extract all bullet points
        const bullets: { text: string; line: number }[] = [];
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i].trim();
          if (/^[-*]\s/.test(line)) {
            bullets.push({
              text: line.replace(/^[-*]\s*/, "").toLowerCase(),
              line: i + 1,
            });
          }
        }

        // Check for similar bullets (simple Levenshtein-like check)
        for (let i = 0; i < bullets.length; i++) {
          for (let j = i + 1; j < bullets.length; j++) {
            const similarity = calculateSimilarity(bullets[i].text, bullets[j].text);
            if (similarity > 0.8) {
              diagnostics.push({
                severity: "warning",
                category: "consistency",
                rule: this.id,
                file: file.name,
                line: bullets[j].line,
                message: `Similar instruction at line ${bullets[i].line}: "${bullets[i].text.substring(0, 50)}..."`,
                fix: "Consolidate similar instructions into one canonical version.",
              });
            }
          }
        }
      }

      return diagnostics;
    },
  },
];
