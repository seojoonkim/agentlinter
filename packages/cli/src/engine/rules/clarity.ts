/* ─── Clarity Rules (25%) ─── */

import { Rule, Diagnostic } from "../types";

const VAGUE_PATTERNS = [
  { pattern: /\bbe helpful\b/i, suggestion: "Specify HOW to be helpful (e.g., 'provide code examples', 'explain step by step')" },
  { pattern: /\bbe nice\b/i, suggestion: "Define the specific tone (e.g., 'use casual but professional tone')" },
  { pattern: /\bbe smart\b/i, suggestion: "Specify what 'smart' means in context (e.g., 'prioritize accuracy over speed')" },
  { pattern: /\bbe concise\b/i, suggestion: "Set specific limits (e.g., 'keep responses under 3 paragraphs unless asked for more')" },
  { pattern: /\bdo your best\b/i, suggestion: "Define what success looks like specifically" },
  { pattern: /\btry to\b/i, suggestion: "Use direct instructions instead of 'try to' (e.g., 'do X' not 'try to do X')" },
  { pattern: /\bif possible\b/i, suggestion: "Specify the conditions or constraints explicitly" },
  { pattern: /\bas needed\b/i, suggestion: "Define when it's needed with specific triggers" },
  { pattern: /\bwhen appropriate\b/i, suggestion: "Define what 'appropriate' means in your context" },
  { pattern: /\buse common sense\b/i, suggestion: "AI doesn't have 'common sense' — spell out the specific rules" },
  { pattern: /\buse good judgment\b/i, suggestion: "Define the criteria for judgment (e.g., 'prefer X over Y when Z')" },
  { pattern: /\betc\.?\b/i, suggestion: "List all items explicitly — 'etc' leaves AI guessing" },
  { pattern: /\band so on\b/i, suggestion: "Be exhaustive — list all relevant items" },
  { pattern: /\bthings like\b/i, suggestion: "List specific items instead of 'things like'" },
];

const PASSIVE_PATTERNS = [
  { pattern: /\bshould be done\b/i, suggestion: "Use active voice: 'Do X' instead of 'X should be done'" },
  { pattern: /\bit is expected\b/i, suggestion: "Use direct instructions: 'Always do X' instead of 'it is expected'" },
  { pattern: /\bcan be used\b/i, suggestion: "Be direct: 'Use X for Y' instead of 'X can be used'" },
];

export const clarityRules: Rule[] = [
  {
    id: "clarity/no-vague-instructions",
    category: "clarity",
    severity: "warning",
    description: "Instructions should be specific and actionable, not vague",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      // Only check core agent files for vague instructions
      const coreFiles = files.filter(
        (f) =>
          !f.name.startsWith("compound/") &&
          !f.name.startsWith("memory/") &&
          f.name.endsWith(".md")
      );
      for (const file of coreFiles) {
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];
          for (const { pattern, suggestion } of VAGUE_PATTERNS) {
            if (pattern.test(line)) {
              diagnostics.push({
                severity: "warning",
                category: "clarity",
                rule: this.id,
                file: file.name,
                line: i + 1,
                message: `Vague instruction: "${line.trim().substring(0, 80)}..."`,
                fix: suggestion,
              });
              break; // one diagnostic per line
            }
          }
        }
      }
      return diagnostics;
    },
  },

  {
    id: "clarity/actionable-instructions",
    category: "clarity",
    severity: "info",
    description: "Prefer active voice and direct instructions",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      for (const file of files) {
        if (!file.name.endsWith(".md")) continue;
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];
          for (const { pattern, suggestion } of PASSIVE_PATTERNS) {
            if (pattern.test(line)) {
              diagnostics.push({
                severity: "info",
                category: "clarity",
                rule: this.id,
                file: file.name,
                line: i + 1,
                message: `Passive instruction: "${line.trim().substring(0, 80)}"`,
                fix: suggestion,
              });
              break;
            }
          }
        }
      }
      return diagnostics;
    },
  },

  {
    id: "clarity/has-examples",
    category: "clarity",
    severity: "info",
    description: "Including examples helps the agent understand expected behavior",
    check(files) {
      const mainFile = files.find(
        (f) => f.name === "CLAUDE.md" || f.name === "AGENTS.md"
      );
      if (!mainFile) return [];

      const hasCodeBlock = mainFile.content.includes("```");
      const hasExample =
        /example|e\.g\.|for instance|like this|such as/i.test(mainFile.content);

      if (!hasCodeBlock && !hasExample && mainFile.lines.length > 30) {
        return [
          {
            severity: "info",
            category: "clarity",
            rule: this.id,
            file: mainFile.name,
            message:
              "No examples found. Adding examples (code blocks, sample outputs) helps the agent understand expectations.",
            fix: "Add a ## Examples section or include inline examples with ``` code blocks",
          },
        ];
      }
      return [];
    },
  },

  {
    id: "clarity/no-contradictions",
    category: "clarity",
    severity: "error",
    description: "Instructions within a file should not contradict each other",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      for (const file of files) {
        if (!file.name.endsWith(".md")) continue;

        // Check for "always X" and "never X" contradictions
        const alwaysMatches: { text: string; line: number }[] = [];
        const neverMatches: { text: string; line: number }[] = [];

        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i].toLowerCase();
          const alwaysMatch = line.match(/always\s+(\w+(?:\s+\w+){0,3})/);
          const neverMatch = line.match(/never\s+(\w+(?:\s+\w+){0,3})/);
          if (alwaysMatch) alwaysMatches.push({ text: alwaysMatch[1], line: i + 1 });
          if (neverMatch) neverMatches.push({ text: neverMatch[1], line: i + 1 });
        }

        // Simple contradiction: "always do X" vs "never do X"
        for (const a of alwaysMatches) {
          for (const n of neverMatches) {
            if (a.text === n.text) {
              diagnostics.push({
                severity: "error",
                category: "clarity",
                rule: this.id,
                file: file.name,
                line: n.line,
                message: `Contradiction: "always ${a.text}" (line ${a.line}) vs "never ${n.text}" (line ${n.line})`,
                fix: "Resolve the contradiction — pick one or add conditional logic",
              });
            }
          }
        }
      }
      return diagnostics;
    },
  },

  {
    id: "clarity/instruction-density",
    category: "clarity",
    severity: "info",
    description: "Files with too many instructions may cause confusion",
    check(files) {
      const mainFile = files.find(
        (f) => f.name === "CLAUDE.md" || f.name === "AGENTS.md"
      );
      if (!mainFile) return [];

      // Count imperative sentences (rough heuristic)
      const imperatives = mainFile.lines.filter((l) =>
        /^[-*]\s*(Always|Never|Do|Don't|Must|Should|Ensure|Make sure|Remember|Check)/i.test(
          l.trim()
        )
      ).length;

      if (imperatives > 30) {
        return [
          {
            severity: "info",
            category: "clarity",
            rule: this.id,
            file: mainFile.name,
            message: `${imperatives} imperative instructions found. Consider prioritizing — too many rules can dilute important ones.`,
            fix: "Group instructions by priority. Put critical rules first, nice-to-haves later.",
          },
        ];
      }
      return [];
    },
  },

  // ─── New rules from 4-LLM research (2026-02-05) ───

  {
    id: "clarity/naked-conditional",
    category: "clarity",
    severity: "error",
    description: "Conditionals should have specific, measurable triggers",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const VAGUE_CONDITIONALS = [
        /\bif\b.+\b(too many|too few|too long|too short|too much|too little|enough|large|small|a lot)\b/i,
        /\bwhen\b.+\b(appropriate|necessary|needed|relevant|possible|feasible)\b/i,
        /\bunless\b.+\b(otherwise|necessary|needed)\b/i,
        /\bif\b.+\b(something goes wrong|things? (?:go|get) (?:wrong|bad))\b/i,
      ];
      const coreFiles = files.filter(
        (f) => !f.name.startsWith("compound/") && !f.name.startsWith("memory/") && f.name.endsWith(".md")
      );
      for (const file of coreFiles) {
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];
          if (line.trim().startsWith("//") || line.trim().startsWith("```")) continue;
          for (const pattern of VAGUE_CONDITIONALS) {
            if (pattern.test(line)) {
              diagnostics.push({
                severity: "error",
                category: "clarity",
                rule: this.id,
                file: file.name,
                line: i + 1,
                message: `Vague conditional: "${line.trim().substring(0, 80)}". Specify exact threshold or trigger.`,
                fix: "Replace vague qualifiers with specific numbers or conditions (e.g., 'if > 2000 chars' instead of 'if too long')",
              });
              break;
            }
          }
        }
      }
      return diagnostics;
    },
  },

  {
    id: "clarity/compound-instruction",
    category: "clarity",
    severity: "warning",
    description: "Each bullet point should contain one action, not multiple",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const coreFiles = files.filter(
        (f) => !f.name.startsWith("compound/") && !f.name.startsWith("memory/") && f.name.endsWith(".md")
      );
      for (const file of coreFiles) {
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i].trim();
          if (!line.startsWith("-") && !line.startsWith("*")) continue;
          const body = line.replace(/^[-*]\s*/, "");
          // Count imperative verbs (simple heuristic)
          const verbs = body.match(/\b(read|write|check|send|create|delete|update|run|deploy|notify|log|scan|fix|add|remove|validate|verify|ensure|process|handle|parse|open|close|start|stop|build|push|pull|test|review|approve|reject)\b/gi);
          if (verbs && verbs.length >= 3 && body.length > 60) {
            diagnostics.push({
              severity: "warning",
              category: "clarity",
              rule: this.id,
              file: file.name,
              line: i + 1,
              message: `Compound instruction with ${verbs.length} actions in one bullet. Split into separate items.`,
              fix: "Break into one action per bullet point for higher compliance.",
            });
          }
        }
      }
      return diagnostics;
    },
  },

  {
    id: "clarity/escape-hatch-missing",
    category: "clarity",
    severity: "warning",
    description: "Absolute rules should have an exception/escalation path",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const ABSOLUTE_PATTERNS = /\b(never|always|must|under no circumstances|absolutely|without exception)\b/i;
      const ESCAPE_PATTERNS = /\b(unless|except|in emergency|escalate|ask the user|if unavoidable|override|exception)\b/i;
      const SECURITY_TERMS = /\b(api.?key|token|secret|password|credential|private.?key|leak|expose)\b/i;
      const coreFiles = files.filter(
        (f) => !f.name.startsWith("compound/") && !f.name.startsWith("memory/") && f.name.endsWith(".md")
      );
      for (const file of coreFiles) {
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];
          if (!ABSOLUTE_PATTERNS.test(line)) continue;
          // Skip security rules — absolute is correct there
          if (SECURITY_TERMS.test(line)) continue;
          // Check 3-line window for escape hatch
          const window = file.lines.slice(i, i + 4).join(" ");
          if (!ESCAPE_PATTERNS.test(window)) {
            diagnostics.push({
              severity: "warning",
              category: "clarity",
              rule: this.id,
              file: file.name,
              line: i + 1,
              message: `Absolute rule without escape hatch: "${line.trim().substring(0, 70)}"`,
              fix: "Add an exception path (e.g., 'unless the user explicitly requests it') or escalation ('ask the user for confirmation').",
            });
          }
        }
      }
      return diagnostics;
    },
  },

  {
    id: "clarity/ambiguous-pronoun",
    category: "clarity",
    severity: "warning",
    description: "Pronouns in instructions should have clear referents",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const PRONOUN_PATTERN = /\b(it|this|that|they|them|these|those)\b/gi;
      const SAFE_PHRASES = /\b(this file|this directory|this project|this section|this workspace|that case|this means|that is|this way|if this|it is|it's)\b/i;
      const coreFiles = files.filter(
        (f) => !f.name.startsWith("compound/") && !f.name.startsWith("memory/") && f.name.endsWith(".md")
      );
      for (const file of coreFiles) {
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i].trim();
          if (!line.startsWith("-") && !line.startsWith("*")) continue;
          if (SAFE_PHRASES.test(line)) continue;
          const body = line.replace(/^[-*]\s*/, "");
          // Check if line starts with a pronoun reference
          if (/^(it|this|that|they|them)\s/i.test(body) && body.length > 20) {
            diagnostics.push({
              severity: "warning",
              category: "clarity",
              rule: this.id,
              file: file.name,
              line: i + 1,
              message: `Instruction starts with ambiguous pronoun: "${body.substring(0, 60)}"`,
              fix: "Replace the pronoun with the specific noun it refers to.",
            });
          }
        }
      }
      return diagnostics;
    },
  },

  {
    id: "clarity/action-without-context",
    category: "clarity",
    severity: "info",
    description: "Instructions should specify when/why, not just what",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const TRIGGER_WORDS = /\b(when|after|before|on|during|every|if|upon|at|while|once)\b/i;
      const mainFile = files.find((f) => f.name === "CLAUDE.md" || f.name === "AGENTS.md");
      if (!mainFile) return [];
      let inGenericSection = false;
      for (let i = 0; i < mainFile.lines.length; i++) {
        const line = mainFile.lines[i].trim();
        // Track section headers for context
        if (/^##?\s/.test(line)) {
          inGenericSection = /rule|general|misc|other|note/i.test(line);
          continue;
        }
        if (!inGenericSection) continue;
        if (!line.startsWith("-") && !line.startsWith("*")) continue;
        const body = line.replace(/^[-*]\s*/, "");
        if (body.length < 15) continue;
        // Check 2-line window for triggers
        const prevLine = i > 0 ? mainFile.lines[i - 1] : "";
        if (!TRIGGER_WORDS.test(body) && !TRIGGER_WORDS.test(prevLine)) {
          // Only flag short imperatives without context
          if (/^[A-Z][a-z]+\s/.test(body) && body.split(/\s+/).length < 8) {
            diagnostics.push({
              severity: "info",
              category: "clarity",
              rule: this.id,
              file: mainFile.name,
              line: i + 1,
              message: `Action without trigger context: "${body.substring(0, 50)}". When should this happen?`,
              fix: "Add a trigger: 'Before committing, ...' or 'When the user asks, ...'",
            });
          }
        }
      }
      return diagnostics;
    },
  },

  {
    id: "clarity/sentence-complexity",
    category: "clarity",
    severity: "info",
    description: "Instructions should be short and simple, not nested prose",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const SUBORDINATORS = /\b(which|although|because|since|while|whereas|whereby|wherein|wherever|whenever)\b/gi;
      const coreFiles = files.filter(
        (f) => !f.name.startsWith("compound/") && !f.name.startsWith("memory/") && f.name.endsWith(".md")
      );
      for (const file of coreFiles) {
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i].trim();
          if (line.startsWith("```") || line.startsWith("|") || line.startsWith("<!--")) continue;
          const words = line.split(/\s+/).length;
          if (words > 40) {
            diagnostics.push({
              severity: "info",
              category: "clarity",
              rule: this.id,
              file: file.name,
              line: i + 1,
              message: `Overly complex sentence (${words} words). Break into shorter instructions.`,
              fix: "Split into multiple lines. Config files should read like command lists, not paragraphs.",
            });
            continue;
          }
          const subCount = (line.match(SUBORDINATORS) || []).length;
          if (subCount >= 3) {
            diagnostics.push({
              severity: "info",
              category: "clarity",
              rule: this.id,
              file: file.name,
              line: i + 1,
              message: `Deeply nested sentence (${subCount} subordinate clauses). Simplify.`,
              fix: "Flatten nested clauses into separate bullet points or numbered steps.",
            });
          }
        }
      }
      return diagnostics;
    },
  },

  {
    id: "clarity/priority-signal-missing",
    category: "clarity",
    severity: "warning",
    description: "Files with many rules need explicit priority signals",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const PRIORITY_MARKERS = /\b(critical|important|must|required|optional|nice.?to.?have|priority|P[0-3]|⚠️|🔴|MUST|SHOULD|MAY)\b/;
      const coreFiles = files.filter(
        (f) => !f.name.startsWith("compound/") && !f.name.startsWith("memory/") && f.name.endsWith(".md")
      );
      for (const file of coreFiles) {
        const bullets = file.lines.filter((l) => /^\s*[-*]\s/.test(l));
        if (bullets.length < 10) continue;
        const hasPriority = file.lines.some((l) => PRIORITY_MARKERS.test(l));
        if (!hasPriority) {
          diagnostics.push({
            severity: "warning",
            category: "clarity",
            rule: this.id,
            file: file.name,
            message: `${bullets.length} instruction items with no priority signals. The agent can't distinguish critical from optional.`,
            fix: "Add priority markers: group by ⚠️ Critical / Standard / Nice to Have, or use MUST/SHOULD/MAY.",
          });
        }
      }
      return diagnostics;
    },
  },

  {
    id: "clarity/undefined-term",
    category: "clarity",
    severity: "info",
    description: "Acronyms and jargon should be defined on first use",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const COMMON_ACRONYMS = new Set([
        "API", "URL", "HTML", "CSS", "JSON", "SQL", "CLI", "UI", "UX", "SDK",
        "NPM", "CI", "CD", "PR", "MR", "QA", "ETH", "BTC", "DM", "FAQ", "FYI",
        "TL", "DR", "TODO", "CRUD", "REST", "HTTP", "HTTPS", "SSH", "TLS", "SSL",
        "JWT", "OAuth", "DNS", "CDN", "AWS", "GCP", "CTA", "SEO", "LLM", "AI",
        "ML", "NLP", "GPT", "PDF", "CSV", "YAML", "XML", "SVG", "PNG", "JPG",
        "GIF", "MD", "JS", "TS", "TSX", "JSX", "ENV", "IDE", "VSC", "OS", "RAM",
        "CPU", "GPU", "SSD", "UUID", "CORS", "SMTP", "PII", "GDPR", "RFC", "OG",
        // File name patterns — not acronyms
        "SOUL", "USER", "TOOLS", "AGENTS", "CLAUDE", "IDENTITY", "SECURITY",
        "FORMATTING", "HEARTBEAT", "MEMORY", "BOOTSTRAP", "SKILL", "README",
        // Date/time patterns
        "YYYY", "MM", "DD", "HH", "GMT", "UTC", "KST", "EST", "PST",
        // Common tech terms
        "CEO", "CTO", "CFO", "COO", "VP", "PM", "EM", "IC", "HR", "TF",
        "ID", "OK", "NO", "VS", "FE", "BE", "DB", "QR", "NFT", "DAO",
        "DAN", "SYS", "INST", "EOF", "TTY", "PTY", "PID", "UID", "GID",
        "HVL", "CAPS", "CAST", "MAX", "MIN", "SRC", "DST", "TMP",
        "ZEON", "REPO", "DIR", "DEV", "OPS", "SLA", "KPI", "ROI",
        // RFC 2119 keywords (requirement levels) — NOT acronyms
        "MUST", "SHALL", "SHOULD", "MAY", "REQUIRED", "RECOMMENDED",
        "OPTIONAL", "NOT", "NEVER", "ALWAYS", "ALL", "ANY", "ONLY",
      ]);
      const coreFiles = files.filter(
        (f) => !f.name.startsWith("compound/") && !f.name.startsWith("memory/") && f.name.endsWith(".md")
      );
      for (const file of coreFiles) {
        const found = new Set<string>();
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];
          const acronyms = line.match(/\b[A-Z]{2,5}\b/g);
          if (!acronyms) continue;
          for (const acr of acronyms) {
            if (COMMON_ACRONYMS.has(acr)) continue;
            if (found.has(acr)) continue;
            found.add(acr);
            // Check if defined nearby
            const window = file.lines.slice(Math.max(0, i - 1), i + 3).join(" ");
            const isDefined = new RegExp(`${acr}\\s*[:(]|\\(${acr}\\)`, "i").test(window);
            if (!isDefined) {
              diagnostics.push({
                severity: "info",
                category: "clarity",
                rule: this.id,
                file: file.name,
                line: i + 1,
                message: `Undefined acronym "${acr}" — define on first use or add to glossary.`,
                fix: `Write it as "**${acr} (Full Name Here)**" on first mention.`,
              });
            }
          }
        }
      }
      return diagnostics;
    },
  },

  {
    id: "clarity/english-config-files",
    category: "clarity",
    severity: "warning",
    description: "Core config files should be written in English for better token efficiency and interpretation accuracy",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      // Korean/CJK character detection
      const NON_ENGLISH_PATTERN = /[\u3131-\u3163\uac00-\ud7a3\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/;
      // Files that should be in English
      const CONFIG_FILES = ["CLAUDE.md", "AGENTS.md", "SOUL.md", "README.md", ".cursorrules"];
      
      for (const file of files) {
        const isConfigFile = CONFIG_FILES.some(name => file.name === name || file.name.endsWith(`/${name}`));
        if (!isConfigFile) continue;
        
        let nonEnglishLines = 0;
        let firstNonEnglishLine = -1;
        
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];
          if (line.trim().startsWith("```") || line.trim().startsWith("<!--")) continue;
          
          if (NON_ENGLISH_PATTERN.test(line)) {
            nonEnglishLines++;
            if (firstNonEnglishLine === -1) firstNonEnglishLine = i + 1;
          }
        }
        
        if (nonEnglishLines > 0) {
          const percentage = Math.round((nonEnglishLines / file.lines.length) * 100);
          const severity = percentage >= 30 ? "warning" : "info";
          diagnostics.push({
            severity,
            category: "clarity",
            rule: this.id,
            file: file.name,
            line: firstNonEnglishLine,
            message: `${file.name} contains ${nonEnglishLines} non-English lines (${percentage}%). Config files in English save ~60% tokens and reduce interpretation ambiguity.`,
            fix: "Translate system instructions to English. Keep domain-specific terms (names, trigger keywords) in original language if needed.",
          });
        }
      }
      return diagnostics;
    },
  },
];
