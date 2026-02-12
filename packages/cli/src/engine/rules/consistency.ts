/* ─── Consistency Rules (15%) ─── */

import { Rule, Diagnostic } from "../types";

export const consistencyRules: Rule[] = [
  {
    id: "consistency/referenced-files-exist",
    category: "consistency",
    severity: "error",
    description: "Files referenced in agent configs should exist",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const fileNames = new Set(files.map((f) => f.name));
      // Also track lowercase versions and base names (without path)
      const fileNamesLower = new Set(files.map((f) => f.name.toLowerCase()));
      const baseNames = new Set(files.map((f) => f.name.split("/").pop() || f.name));
      const baseNamesLower = new Set(files.map((f) => (f.name.split("/").pop() || f.name).toLowerCase()));

      // Generic pattern references to skip (e.g., "Check SKILL.md for each" refers to a pattern, not a specific file)
      // Also includes common agent workspace file names that may exist but not be uploaded
      const PATTERN_REFS = new Set([
        // Generic patterns
        "SKILL.md", "README.md", "CHANGELOG.md", "LICENSE.md",
        // Common agent workspace files (often exist but may not be included in analysis)
        "SECURITY.md", "FORMATTING.md", "HEARTBEAT.md", "SHIELD.md",
        "USER.md", "SOUL.md", "IDENTITY.md", "TOOLS.md", "MEMORY.md",
        "BOOTSTRAP.md", "WORKSPACE.md", "CONFIG.md", "RULES.md",
      ]);

      for (const file of files) {
        // Find references to other .md files
        const refs = file.content.matchAll(
          /(?:see|read|check|refer to|load|include)\s+[`"']?([A-Z][A-Za-z_-]+\.md)(?:#[a-z0-9-]+)?[`"']?/gi
        );

        for (const match of refs) {
          const refName = match[1];
          if (PATTERN_REFS.has(refName)) continue; // skip generic patterns
          // Check all variants: exact, lowercase, basename, basename lowercase
          const exists = fileNames.has(refName) 
            || fileNamesLower.has(refName.toLowerCase())
            || baseNames.has(refName)
            || baseNamesLower.has(refName.toLowerCase());
          if (!exists) {
            diagnostics.push({
              severity: "error",
              category: "consistency",
              rule: this.id,
              file: file.name,
              message: `Referenced file "${refName}" not found in workspace.`,
              fix: `Create ${refName} or remove the reference.`,
            });
          }
        }

        // Also check backtick references like `SOUL.md` or `SOUL.md#section`
        const backtickRefs = file.content.matchAll(
          /`([A-Z][A-Za-z_-]+\.md)(?:#[a-z0-9-]+)?`/g
        );
        for (const match of backtickRefs) {
          const refName = match[1];
          if (PATTERN_REFS.has(refName)) continue; // skip generic patterns
          // Check all variants
          const exists = fileNames.has(refName) 
            || fileNamesLower.has(refName.toLowerCase())
            || baseNames.has(refName)
            || baseNamesLower.has(refName.toLowerCase());
          if (!exists) {
            const alreadyFound = diagnostics.some(
              (d) =>
                d.file === file.name &&
                d.message.includes(`"${refName}"`)
            );
            if (!alreadyFound) {
              diagnostics.push({
                severity: "error",
                category: "consistency",
                rule: this.id,
                file: file.name,
                message: `Referenced file "${refName}" not found in workspace.`,
                fix: `Create ${refName} or remove the reference.`,
              });
            }
          }
        }
      }
      return diagnostics;
    },
  },

  {
    id: "consistency/naming-convention",
    category: "consistency",
    severity: "info",
    description: "File naming should follow a consistent convention",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const mdFiles = files.filter((f) => f.name.endsWith(".md") && !f.name.includes("/"));

      const upperCase = mdFiles.filter((f) => f.name === f.name.toUpperCase().replace(/\.MD$/, ".md"));
      const lowerCase = mdFiles.filter((f) => f.name === f.name.toLowerCase());
      const mixed = mdFiles.filter(
        (f) => !upperCase.includes(f) && !lowerCase.includes(f)
      );

      if (upperCase.length > 0 && lowerCase.length > 0) {
        diagnostics.push({
          severity: "info",
          category: "consistency",
          rule: this.id,
          file: "(workspace)",
          message: `Mixed file naming: ${upperCase.length} UPPERCASE (${upperCase.map((f) => f.name).join(", ")}), ${lowerCase.length} lowercase (${lowerCase.map((f) => f.name).join(", ")}). Pick one convention.`,
          fix: "Use consistent naming — UPPERCASE.md is the common convention for agent files.",
        });
      }

      return diagnostics;
    },
  },

  {
    id: "consistency/no-duplicate-instructions",
    category: "consistency",
    severity: "warning",
    description: "Same instruction should not appear in multiple files",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const seenInstructions = new Map<string, string>(); // normalized instruction → file

      // Only check core files for duplicates
      const coreFiles = files.filter(
        (f) =>
          !f.name.startsWith("compound/") &&
          !f.name.startsWith("memory/") &&
          f.name.endsWith(".md")
      );

      for (const file of coreFiles) {
        if (!file.name.endsWith(".md")) continue;

        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i].trim();
          // Only check substantial lines (bullet points, rules)
          if (line.length < 20) continue;
          if (!line.startsWith("-") && !line.startsWith("*") && !line.startsWith(">"))
            continue;

          const normalized = line
            .replace(/^[-*>]\s*/, "")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();

          if (normalized.length < 20) continue;

          const existingFile = seenInstructions.get(normalized);
          if (existingFile && existingFile !== file.name) {
            diagnostics.push({
              severity: "warning",
              category: "consistency",
              rule: this.id,
              file: file.name,
              line: i + 1,
              message: `Duplicate instruction also in ${existingFile}: "${normalized.substring(0, 60)}..."`,
              fix: "Keep the instruction in one place and reference it from other files.",
            });
          } else {
            seenInstructions.set(normalized, file.name);
          }
        }
      }
      return diagnostics;
    },
  },

  {
    id: "consistency/identity-alignment",
    category: "consistency",
    severity: "warning",
    description: "Agent identity should be consistent across files",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      // Only check core identity files
      const identityFiles = files.filter(
        (f) =>
          f.name === "SOUL.md" ||
          f.name === "IDENTITY.md" ||
          f.name === "CLAUDE.md" ||
          f.name === "AGENTS.md"
      );

      // Extract explicit name declarations
      const names = new Map<string, string[]>();

      for (const file of identityFiles) {
        // Look for explicit name declarations with stricter patterns
        const patterns = [
          /\*\*Name:\*\*\s*(.+)/gi,
          /^-\s*\*\*Name:\*\*\s*(.+)/gim,
          /name\s*[:=]\s*['"]([^'"]+)['"]/gi,
          /^#\s+.*?[-—]\s*(.+)/gm, // "# IDENTITY.md - Who Am I?"
        ];

        for (const pattern of patterns) {
          const matches = file.content.matchAll(pattern);
          for (const match of matches) {
            const name = match[1].trim().split(/\s+/).slice(0, 3).join(" ");
            // Filter out common false positives
            if (
              name.length > 2 &&
              name.length < 25 &&
              !/^(the|a|an|this|that|your|my|it|is|are|was|string|function|class)/i.test(name)
            ) {
              if (!names.has(name)) names.set(name, []);
              names.get(name)!.push(file.name);
            }
          }
        }
      }

      // Only warn if we find genuinely conflicting names
      const uniqueNames = [...names.keys()];
      if (uniqueNames.length > 3) {
        diagnostics.push({
          severity: "warning",
          category: "consistency",
          rule: this.id,
          file: "(workspace)",
          message: `Multiple identity names found: ${uniqueNames.join(", ")}. Ensure they refer to the same entity.`,
          fix: "Use a single consistent name for the agent across all files.",
        });
      }

      return diagnostics;
    },
  },

  // ─── New rules from 4-LLM research (2026-02-05) ───

  {
    id: "consistency/permission-conflict",
    category: "consistency",
    severity: "error",
    description: "Permission levels should not conflict across files",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const ALLOW_PATTERNS = /\b(allow|enable|permit|can|authorized|grant|open|auto[- ]?(?:send|run|exec|approve))\b/i;
      const DENY_PATTERNS = /\b(deny|disable|forbid|cannot|never|restricted|block|require.*approval|require.*confirm)\b/i;

      // Extract permission statements per file
      const permStatements: { file: string; line: number; text: string; type: "allow" | "deny"; topic: string }[] = [];

      for (const file of files) {
        if (!file.name.endsWith(".md")) continue;
        if (file.name.startsWith("compound/") || file.name.startsWith("memory/")) continue;
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i].trim();
          if (line.length < 10) continue;
          const isAllow = ALLOW_PATTERNS.test(line);
          const isDeny = DENY_PATTERNS.test(line);
          if (!isAllow && !isDeny) continue;
          // Extract rough topic (first few meaningful words after the permission verb)
          const topic = line.toLowerCase()
            .replace(/^[-*>\s]+/, "")
            .replace(/\b(always|never|must|should|do not|don't)\b/g, "")
            .trim()
            .substring(0, 40);
          permStatements.push({
            file: file.name,
            line: i + 1,
            text: line,
            type: isDeny ? "deny" : "allow",
            topic,
          });
        }
      }

      // Cross-file check: same topic, different permissions
      for (let a = 0; a < permStatements.length; a++) {
        for (let b = a + 1; b < permStatements.length; b++) {
          const sa = permStatements[a];
          const sb = permStatements[b];
          if (sa.file === sb.file) continue;
          if (sa.type === sb.type) continue;
          // Simple topic similarity: shared keywords
          const wordsA = new Set(sa.topic.split(/\s+/).filter(w => w.length > 3));
          const wordsB = new Set(sb.topic.split(/\s+/).filter(w => w.length > 3));
          const shared = [...wordsA].filter(w => wordsB.has(w));
          if (shared.length >= 2) {
            diagnostics.push({
              severity: "error",
              category: "consistency",
              rule: this.id,
              file: sb.file,
              line: sb.line,
              message: `Permission conflict: ${sa.file} ${sa.type}s "${shared.join(" ")}" but ${sb.file} ${sb.type}s it.`,
              fix: "Align permissions across files. One source of truth for each capability.",
            });
          }
        }
      }
      return diagnostics;
    },
  },

  {
    id: "consistency/tone-voice-alignment",
    category: "consistency",
    severity: "warning",
    description: "Instruction tone should match the defined persona in SOUL.md",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const soulFile = files.find((f) => f.name === "SOUL.md");
      if (!soulFile) return [];

      const soulContent = soulFile.content.toLowerCase();
      const isCasual = /casual|friendly|informal|relaxed|conversational|chill/i.test(soulContent);
      const isFormal = /formal|professional|enterprise|corporate|official/i.test(soulContent);

      if (!isCasual && !isFormal) return [];

      const otherFiles = files.filter(
        (f) => f.name !== "SOUL.md" && !f.name.startsWith("compound/") && !f.name.startsWith("memory/") && f.name.endsWith(".md")
      );

      for (const file of otherFiles) {
        const lines = file.lines;
        let formalCount = 0;
        let casualCount = 0;
        for (const line of lines) {
          if (/\b(shall|hereby|pursuant|henceforth|therefore|moreover|furthermore)\b/i.test(line)) formalCount++;
          if (/\b(lol|lmao|gonna|wanna|kinda|sorta|nah|yep|cool|chill)\b/i.test(line)) casualCount++;
          if (/don'?t|can'?t|won'?t|it'?s|that'?s/.test(line)) casualCount++;
        }
        if (isCasual && formalCount > 3 && formalCount > casualCount) {
          diagnostics.push({
            severity: "warning",
            category: "consistency",
            rule: this.id,
            file: file.name,
            message: `Tone mismatch: SOUL.md defines casual persona but ${file.name} uses formal language (${formalCount} formal markers).`,
            fix: "Match the tone defined in SOUL.md. Use casual language if that's the persona.",
          });
        }
        if (isFormal && casualCount > 3 && casualCount > formalCount) {
          diagnostics.push({
            severity: "warning",
            category: "consistency",
            rule: this.id,
            file: file.name,
            message: `Tone mismatch: SOUL.md defines formal persona but ${file.name} uses casual language (${casualCount} casual markers).`,
            fix: "Match the tone defined in SOUL.md. Use formal language if that's the persona.",
          });
        }
      }
      return diagnostics;
    },
  },

  {
    id: "consistency/language-mixing",
    category: "consistency",
    severity: "info",
    description: "Avoid mixing languages within a single sentence or section",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const CJK_PATTERN = /[\u3000-\u9fff\uac00-\ud7af]/;
      const LATIN_PATTERN = /[a-zA-Z]{4,}/;

      const coreFiles = files.filter(
        (f) => !f.name.startsWith("compound/") && !f.name.startsWith("memory/") && f.name.endsWith(".md")
      );
      for (const file of coreFiles) {
        let mixedCount = 0;
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i].trim();
          if (line.length < 20) continue;
          if (line.startsWith("```") || line.startsWith("|") || line.startsWith("<!--")) continue;
          // Skip lines that are just file paths, URLs, or code
          if (/^https?:\/\/|^\w+\.\w+/.test(line)) continue;
          const hasCJK = CJK_PATTERN.test(line);
          const hasLatin = LATIN_PATTERN.test(line);
          if (hasCJK && hasLatin) {
            // Check ratio — if it's mostly one language with a few tech terms, it's fine
            const cjkChars = (line.match(/[\u3000-\u9fff\uac00-\ud7af]/g) || []).length;
            const latinWords = (line.match(/[a-zA-Z]{4,}/g) || []).length;
            const totalChars = line.length;
            const cjkRatio = cjkChars / totalChars;
            // Flag only when it's a genuine mix (30-70% range)
            if (cjkRatio > 0.2 && cjkRatio < 0.8 && latinWords >= 3) {
              mixedCount++;
            }
          }
        }
        if (mixedCount >= 5) {
          diagnostics.push({
            severity: "info",
            category: "consistency",
            rule: this.id,
            file: file.name,
            message: `${mixedCount} mixed-language lines found. Consider standardizing to one language per section.`,
            fix: "Use one language consistently. Technical terms in another language are fine, but sentences should be in one language.",
          });
        }
      }
      return diagnostics;
    },
  },

  {
    id: "consistency/circular-dependency",
    category: "consistency",
    severity: "warning",
    description: "Files should not have circular references",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      // Build dependency graph
      const deps = new Map<string, Set<string>>();
      const REF_PATTERN = /(?:see|read|check|refer|load|follow|defined in)\s+[`"']?([A-Z][A-Za-z_-]+\.md)[`"']?/gi;

      for (const file of files) {
        if (!deps.has(file.name)) deps.set(file.name, new Set());
        const matches = file.content.matchAll(REF_PATTERN);
        for (const m of matches) {
          const target = m[1];
          if (files.some((f) => f.name === target) && target !== file.name) {
            deps.get(file.name)!.add(target);
          }
        }
      }

      // Detect cycles with DFS
      const visited = new Set<string>();
      const inStack = new Set<string>();

      function dfs(node: string, path: string[]): void {
        if (inStack.has(node)) {
          const cycleStart = path.indexOf(node);
          const cycle = path.slice(cycleStart).concat(node);
          diagnostics.push({
            severity: "warning",
            category: "consistency",
            rule: "consistency/circular-dependency",
            file: node,
            message: `Circular reference: ${cycle.join(" → ")}`,
            fix: "Break the cycle. Define information in one place and reference it one-way.",
          });
          return;
        }
        if (visited.has(node)) return;
        visited.add(node);
        inStack.add(node);
        for (const dep of deps.get(node) || []) {
          dfs(dep, [...path, node]);
        }
        inStack.delete(node);
      }

      for (const file of files) {
        dfs(file.name, []);
      }
      return diagnostics;
    },
  },

  {
    id: "consistency/timezone-locale-drift",
    category: "consistency",
    severity: "warning",
    description: "Timezone references should be consistent across files",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const TZ_PATTERNS = [
        { pattern: /Asia\/Seoul|KST|GMT\+9/gi, tz: "Asia/Seoul" },
        { pattern: /\bUTC\b/gi, tz: "UTC" },
        { pattern: /\bEST\b/gi, tz: "EST" },
        { pattern: /\bPST\b/gi, tz: "PST" },
        { pattern: /America\/New_York/gi, tz: "America/New_York" },
        { pattern: /America\/Los_Angeles/gi, tz: "America/Los_Angeles" },
        { pattern: /Europe\/London/gi, tz: "Europe/London" },
      ];

      const foundTzs = new Map<string, { file: string; line: number }[]>();

      for (const file of files) {
        if (!file.name.endsWith(".md")) continue;
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];
          for (const { pattern, tz } of TZ_PATTERNS) {
            pattern.lastIndex = 0;
            if (pattern.test(line)) {
              if (!foundTzs.has(tz)) foundTzs.set(tz, []);
              foundTzs.get(tz)!.push({ file: file.name, line: i + 1 });
            }
          }
        }
      }

      const uniqueTzs = [...foundTzs.keys()];
      if (uniqueTzs.length > 1) {
        // Check for actual conflicts (UTC and a local TZ together is fine if explicit)
        const localTzs = uniqueTzs.filter((t) => t !== "UTC");
        if (localTzs.length > 1) {
          diagnostics.push({
            severity: "warning",
            category: "consistency",
            rule: this.id,
            file: "(workspace)",
            message: `Multiple timezones referenced: ${uniqueTzs.join(", ")}. Standardize to one.`,
            fix: "Use one timezone consistently (e.g., Asia/Seoul). Convert if needed.",
          });
        }
      }
      return diagnostics;
    },
  },

  {
    id: "consistency/priority-conflict",
    category: "consistency",
    severity: "warning",
    description: "Same topic should not have conflicting priorities across files",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const HIGH_PRIORITY = /\b(critical|highest|most important|P0|top priority|🔴|⚠️|first priority)\b/i;
      const LOW_PRIORITY = /\b(low priority|optional|nice.?to.?have|least important|P3|minor|not important)\b/i;

      const statements: { file: string; line: number; text: string; level: "high" | "low"; keywords: string[] }[] = [];

      for (const file of files) {
        if (!file.name.endsWith(".md") || file.name.startsWith("compound/") || file.name.startsWith("memory/")) continue;
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i].trim();
          const isHigh = HIGH_PRIORITY.test(line);
          const isLow = LOW_PRIORITY.test(line);
          if (!isHigh && !isLow) continue;
          const words = line.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
          statements.push({
            file: file.name,
            line: i + 1,
            text: line,
            level: isHigh ? "high" : "low",
            keywords: words,
          });
        }
      }

      // Cross-check
      for (let a = 0; a < statements.length; a++) {
        for (let b = a + 1; b < statements.length; b++) {
          const sa = statements[a];
          const sb = statements[b];
          if (sa.file === sb.file || sa.level === sb.level) continue;
          const shared = sa.keywords.filter((w) => sb.keywords.includes(w));
          if (shared.length >= 2) {
            diagnostics.push({
              severity: "warning",
              category: "consistency",
              rule: this.id,
              file: sb.file,
              line: sb.line,
              message: `Priority conflict: "${shared.join(" ")}" is ${sa.level} priority in ${sa.file} but ${sb.level} in ${sb.file}.`,
              fix: "Align priority levels across files for the same topic.",
            });
          }
        }
      }
      return diagnostics;
    },
  },

  {
    id: "consistency/outdated-cross-references",
    category: "consistency",
    severity: "error",
    description: "Section references should point to sections that actually exist",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      // Build set of all section headings
      const allSections = new Map<string, Set<string>>();
      for (const file of files) {
        const headings = new Set(file.sections.map((s) => s.heading.toLowerCase()));
        allSections.set(file.name, headings);
      }

      const SECTION_REF = /(?:section|see)\s+['"`]([^'"`]+)['"`]/gi;
      for (const file of files) {
        const matches = file.content.matchAll(SECTION_REF);
        for (const m of matches) {
          const refSection = m[1].toLowerCase();
          // Check if this section exists in any file
          let found = false;
          for (const [, headings] of allSections) {
            if (headings.has(refSection)) {
              found = true;
              break;
            }
          }
          if (!found) {
            diagnostics.push({
              severity: "error",
              category: "consistency",
              rule: this.id,
              file: file.name,
              message: `Referenced section "${m[1]}" not found in any file.`,
              fix: "Update the reference to match an existing section heading.",
            });
          }
        }
      }
      return diagnostics;
    },
  },
];
