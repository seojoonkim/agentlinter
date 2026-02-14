/* ─── Best Practices Rules (from Claude Code research) ─── */

import { Rule, Diagnostic } from "../types";

export const bestPracticesRules: Rule[] = [
  {
    id: "best-practices/instruction-counter",
    category: "clarity",
    severity: "warning",
    description: "Count imperative instructions — 100+ triggers warning, 150+ triggers error",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const IMPERATIVE_PATTERNS = [
        /^[-*]\s*(Always|Never|Do|Don't|Must|Should|Ensure|Make sure|Remember|Check|Avoid|Use|Read|Write|Create|Delete|Update|Send|Post|Deploy|Run|Execute|Verify|Validate|Track|Log|Monitor|Review|Ask|Notify|Scan|Fix|Handle|Process|Parse|Build|Test|Compile|Install|Configure|Set|Get|Fetch|Load|Save|Export|Import|Filter|Sort|Group|Count|Sum|Calculate|Compare|Start|Stop|Resume|Pause|Cancel|Retry|Skip|Include|Exclude|Enable|Disable|Lock|Unlock|Open|Close|Show|Hide|Add|Remove|Append|Prepend|Insert|Replace|Merge|Split|Join|Connect|Disconnect|Link|Unlink|Attach|Detach)\b/i,
        /^[-*]\s*\b(Call|Invoke|Trigger|Fire|Emit|Broadcast|Publish|Subscribe|Listen|Watch|Observe|Wait|Sleep|Delay|Defer|Schedule|Queue|Prioritize|Escalate|Delegate|Forward|Redirect|Rewrite|Transform|Convert|Translate|Encode|Decode|Encrypt|Decrypt|Hash|Sign|Verify|Authenticate|Authorize|Grant|Revoke|Permit|Deny|Allow|Block|Reject|Accept|Approve|Refuse|Warn|Error|Fail|Abort|Exit|Return|Yield|Throw|Catch|Finally|Raise|Signal|Alert|Report|Announce)\b/i,
      ];

      const mainFile = files.find(
        (f) => f.name === "CLAUDE.md" || f.name === "AGENTS.md"
      );
      if (!mainFile) return [];

      let instructionCount = 0;
      const instructionLines: number[] = [];

      for (let i = 0; i < mainFile.lines.length; i++) {
        const line = mainFile.lines[i].trim();
        if (IMPERATIVE_PATTERNS.some(p => p.test(line))) {
          instructionCount++;
          instructionLines.push(i + 1);
        }
      }

      if (instructionCount >= 150) {
        diagnostics.push({
          severity: "error",
          category: "clarity",
          rule: this.id,
          file: mainFile.name,
          message: `${instructionCount} imperative instructions found (CRITICAL). This causes instruction dilution and context bloat.`,
          fix: "Split into modular files: SOUL.md (identity), skills/*.md (domain rules), .claude/rules/ (path-scoped rules). Target: <100 instructions per file.",
        });
      } else if (instructionCount >= 100) {
        diagnostics.push({
          severity: "warning",
          category: "clarity",
          rule: this.id,
          file: mainFile.name,
          message: `${instructionCount} imperative instructions found (HIGH). Prioritize and split to avoid dilution.`,
          fix: "Use Progressive Disclosure: Group by priority (Critical/Standard/Optional), move non-core rules to separate files.",
        });
      }

      return diagnostics;
    },
  },

  {
    id: "best-practices/context-bloat-detector",
    category: "structure",
    severity: "warning",
    description: "Detect context bloat — 300+ lines or excessive repetition",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      
      const mainFile = files.find(
        (f) => f.name === "CLAUDE.md" || f.name === "AGENTS.md"
      );
      if (!mainFile) return [];

      // Check total line count
      if (mainFile.lines.length > 300) {
        diagnostics.push({
          severity: "error",
          category: "structure",
          rule: this.id,
          file: mainFile.name,
          message: `${mainFile.lines.length} lines detected (BLOAT). Context bloat degrades agent performance exponentially.`,
          fix: "Aggressive split required: core identity (50-100 lines) + modular files for each domain/tool/workflow.",
        });
      }

      // Check for repetitive patterns (same instruction repeated multiple times)
      const lineFrequency = new Map<string, number[]>();
      for (let i = 0; i < mainFile.lines.length; i++) {
        const normalized = mainFile.lines[i].trim().toLowerCase().replace(/[^\w\s]/g, "");
        if (normalized.length < 20) continue;
        if (!lineFrequency.has(normalized)) {
          lineFrequency.set(normalized, []);
        }
        lineFrequency.get(normalized)!.push(i + 1);
      }

      for (const [text, lines] of lineFrequency) {
        if (lines.length >= 3) {
          diagnostics.push({
            severity: "warning",
            category: "structure",
            rule: this.id,
            file: mainFile.name,
            line: lines[0],
            message: `Repeated instruction detected ${lines.length} times (lines: ${lines.join(", ")}). Consolidate to reduce bloat.`,
            fix: "Deduplicate: create a single canonical version, remove duplicates.",
          });
        }
      }

      return diagnostics;
    },
  },

  {
    id: "best-practices/progressive-disclosure",
    category: "structure",
    severity: "info",
    description: "Check for progressive disclosure structure (priority grouping)",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const PRIORITY_MARKERS = /critical|must|required|priority|important|⚠️|🔴|optional|nice.?to.?have|may|can/i;
      
      const mainFile = files.find(
        (f) => f.name === "CLAUDE.md" || f.name === "AGENTS.md"
      );
      if (!mainFile) return [];

      const bullets = mainFile.lines.filter(l => /^\s*[-*]\s/.test(l));
      if (bullets.length < 20) return []; // Too short to need progressive disclosure

      const hasPriorityStructure = mainFile.sections.some(s => 
        PRIORITY_MARKERS.test(s.heading)
      );

      if (!hasPriorityStructure && bullets.length >= 20) {
        diagnostics.push({
          severity: "info",
          category: "structure",
          rule: this.id,
          file: mainFile.name,
          message: `${bullets.length} instructions without priority grouping. Progressive disclosure improves agent compliance.`,
          fix: "Group by priority: ## ⚠️ Critical Rules, ## Standard Operating Procedure, ## Optional / Nice-to-Have",
        });
      }

      return diagnostics;
    },
  },

  {
    id: "best-practices/anti-patterns",
    category: "clarity",
    severity: "warning",
    description: "Detect anti-patterns (code style in CLAUDE.md, embedded credentials, etc.)",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      
      const mainFile = files.find(
        (f) => f.name === "CLAUDE.md" || f.name === "AGENTS.md"
      );
      if (!mainFile) return [];

      // Anti-pattern 1: Code style rules in CLAUDE.md (should be in .claude/rules/code-style.md)
      const CODE_STYLE_KEYWORDS = /\b(indent|spacing|semicolon|bracket|quote|naming convention|camelCase|snake_case|PascalCase|line length|import order|comment style|format|prettier|eslint|linter)\b/i;
      let hasCodeStyle = false;
      let codeStyleLine = -1;

      for (let i = 0; i < mainFile.lines.length; i++) {
        if (CODE_STYLE_KEYWORDS.test(mainFile.lines[i])) {
          hasCodeStyle = true;
          codeStyleLine = i + 1;
          break;
        }
      }

      if (hasCodeStyle) {
        diagnostics.push({
          severity: "warning",
          category: "clarity",
          rule: this.id,
          file: mainFile.name,
          line: codeStyleLine,
          message: "Code style rules detected in main file. These should be in .claude/rules/code-style.md for path-scoped activation.",
          fix: "Create .claude/rules/code-style.md and move all code formatting/style rules there.",
        });
      }

      // Anti-pattern 2: Embedded credentials (even placeholders can leak patterns)
      const CREDENTIAL_PATTERNS = [
        /api.?key\s*[:=]\s*['"]\w{20,}['"]/i,
        /token\s*[:=]\s*['"]\w{30,}['"]/i,
        /password\s*[:=]\s*['"]\S{8,}['"]/i,
        /secret\s*[:=]\s*['"]\w{20,}['"]/i,
      ];

      for (let i = 0; i < mainFile.lines.length; i++) {
        const line = mainFile.lines[i];
        for (const pattern of CREDENTIAL_PATTERNS) {
          if (pattern.test(line)) {
            diagnostics.push({
              severity: "error",
              category: "clarity",
              rule: this.id,
              file: mainFile.name,
              line: i + 1,
              message: "Potential credential detected in config file. Use environment variables (process.env.API_KEY).",
              fix: "Replace with placeholder: 'API_KEY: process.env.API_KEY' or '${API_KEY}'",
            });
            break;
          }
        }
      }

      // Anti-pattern 3: "Act as" roleplay (ineffective according to research)
      const ROLEPLAY_PATTERN = /\b(act as|you are a|pretend to be|roleplay|imagine you are)\b/i;
      for (let i = 0; i < mainFile.lines.length; i++) {
        if (ROLEPLAY_PATTERN.test(mainFile.lines[i])) {
          diagnostics.push({
            severity: "warning",
            category: "clarity",
            rule: this.id,
            file: mainFile.name,
            line: i + 1,
            message: "Roleplay instruction detected. Direct identity works better: '## Identity: You are X' instead of 'Act as X'.",
            fix: "Use declarative identity: ## Identity section with factual statements, not roleplay prompts.",
          });
          break;
        }
      }

      return diagnostics;
    },
  },
];
