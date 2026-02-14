/* ─── Integration Rules (MCP, Skills, Hooks) ─── */

import { Rule, Diagnostic } from "../types";

export const integrationRules: Rule[] = [
  {
    id: "integration/mcp-server-validator",
    category: "runtime",
    severity: "warning",
    description: "Validate .claude/mcp.json for MCP server configuration",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      
      const mcpFile = files.find(f => f.name === ".claude/mcp.json" || f.name.endsWith("/.claude/mcp.json"));
      if (!mcpFile) return []; // No MCP config is fine

      // Try to parse JSON
      let mcpConfig: any;
      try {
        mcpConfig = JSON.parse(mcpFile.content);
      } catch (e) {
        return [{
          severity: "error",
          category: "runtime",
          rule: this.id,
          file: mcpFile.name,
          message: `Invalid JSON in MCP config: ${(e as Error).message}`,
          fix: "Fix JSON syntax errors. Use a JSON validator or prettier.",
        }];
      }

      // Validate structure
      if (!mcpConfig.mcpServers && !mcpConfig.servers) {
        diagnostics.push({
          severity: "warning",
          category: "runtime",
          rule: this.id,
          file: mcpFile.name,
          message: "MCP config missing 'mcpServers' or 'servers' field.",
          fix: "Add 'mcpServers' object with your server configurations.",
        });
      }

      const servers = mcpConfig.mcpServers || mcpConfig.servers || {};
      
      // Validate each server
      for (const [name, config] of Object.entries(servers)) {
        const serverConfig = config as any;
        
        if (!serverConfig.command && !serverConfig.url) {
          diagnostics.push({
            severity: "error",
            category: "runtime",
            rule: this.id,
            file: mcpFile.name,
            message: `MCP server "${name}" missing 'command' or 'url' field.`,
            fix: "Add 'command' (for local servers) or 'url' (for remote servers).",
          });
        }

        // Check for common issues
        if (serverConfig.command && typeof serverConfig.command === "string") {
          if (serverConfig.command.includes("npx") && !serverConfig.command.includes("-y")) {
            diagnostics.push({
              severity: "warning",
              category: "runtime",
              rule: this.id,
              file: mcpFile.name,
              message: `MCP server "${name}" uses npx without -y flag. May cause interactive prompts.`,
              fix: "Add -y flag: 'npx -y @package/name'",
            });
          }
        }

        // Check for executable flag
        if (serverConfig.command && Array.isArray(serverConfig.command) && serverConfig.command.length === 0) {
          diagnostics.push({
            severity: "error",
            category: "runtime",
            rule: this.id,
            file: mcpFile.name,
            message: `MCP server "${name}" has empty command array.`,
            fix: "Provide command as string or non-empty array.",
          });
        }
      }

      return diagnostics;
    },
  },

  {
    id: "integration/skills-linter",
    category: "skillSafety",
    severity: "warning",
    description: "Validate SKILL.md files in skills/ directory",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      
      const skillFiles = files.filter(f => 
        f.name.startsWith("skills/") && f.name.endsWith("/SKILL.md")
      );

      for (const skillFile of skillFiles) {
        // Check required sections
        const REQUIRED_SECTIONS = ["## What", "## When", "## How"];
        const missingSections = REQUIRED_SECTIONS.filter(heading => 
          !skillFile.sections.some(s => s.heading.toLowerCase() === heading.toLowerCase())
        );

        if (missingSections.length > 0) {
          diagnostics.push({
            severity: "warning",
            category: "skillSafety",
            rule: this.id,
            file: skillFile.name,
            message: `Missing required sections: ${missingSections.join(", ")}`,
            fix: "Skills should document: What (description), When (triggers), How (implementation).",
          });
        }

        // Check for executable hooks
        const hasHook = skillFile.content.includes("```bash") || 
                        skillFile.content.includes("```sh") ||
                        skillFile.content.includes("#!/");

        if (hasHook) {
          // Check if corresponding executable exists
          const skillDir = skillFile.name.replace("/SKILL.md", "");
          const hookFiles = files.filter(f => 
            f.name.startsWith(skillDir + "/") && 
            (f.name.endsWith(".sh") || f.name.endsWith(".bash") || f.name.includes("/hooks/"))
          );

          if (hookFiles.length === 0) {
            diagnostics.push({
              severity: "info",
              category: "skillSafety",
              rule: this.id,
              file: skillFile.name,
              message: "SKILL.md contains script examples but no executable hook files found.",
              fix: "Create hooks/pre-exec or hooks/post-exec for automation, or mark scripts as examples only.",
            });
          }
        }

        // Check for security warnings in skill files
        const DANGEROUS_PATTERNS = [
          { pattern: /rm\s+-rf\s+[/$~]/, message: "Dangerous rm -rf command detected" },
          { pattern: /chmod\s+777/, message: "chmod 777 detected — too permissive" },
          { pattern: /eval\s+\$/, message: "eval usage detected — injection risk" },
          { pattern: />\s*\/dev\/sd[a-z]/, message: "Direct disk write detected" },
        ];

        for (let i = 0; i < skillFile.lines.length; i++) {
          const line = skillFile.lines[i];
          for (const { pattern, message } of DANGEROUS_PATTERNS) {
            if (pattern.test(line)) {
              diagnostics.push({
                severity: "error",
                category: "skillSafety",
                rule: this.id,
                file: skillFile.name,
                line: i + 1,
                message: `Security risk: ${message}`,
                fix: "Review and add safety checks (confirmation prompts, sandboxing, etc.)",
              });
            }
          }
        }
      }

      return diagnostics;
    },
  },

  {
    id: "integration/hooks-checker",
    category: "runtime",
    severity: "info",
    description: "Check if hooks are executable and have proper shebang",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      
      const hookFiles = files.filter(f => 
        f.name.includes("/hooks/") || 
        f.name.endsWith(".sh") || 
        f.name.endsWith(".bash")
      );

      for (const hookFile of hookFiles) {
        // Check for shebang
        if (hookFile.lines.length === 0 || !hookFile.lines[0].startsWith("#!")) {
          diagnostics.push({
            severity: "warning",
            category: "runtime",
            rule: this.id,
            file: hookFile.name,
            line: 1,
            message: "Hook file missing shebang line (#!/bin/bash or #!/usr/bin/env bash).",
            fix: "Add shebang as first line: #!/usr/bin/env bash",
          });
        }

        // Check for common issues
        const hasSetE = hookFile.content.includes("set -e");
        const hasSetU = hookFile.content.includes("set -u");
        
        if (!hasSetE && hookFile.lines.length > 10) {
          diagnostics.push({
            severity: "info",
            category: "runtime",
            rule: this.id,
            file: hookFile.name,
            message: "Hook doesn't use 'set -e' (exit on error). Consider adding for safety.",
            fix: "Add 'set -e' near the top to fail fast on errors.",
          });
        }

        // Check for unsafe variable expansion
        const UNSAFE_EXPANSION = /\$[A-Z_]+(?!\{)/g;
        for (let i = 0; i < hookFile.lines.length; i++) {
          const line = hookFile.lines[i];
          if (line.trim().startsWith("#")) continue; // Skip comments
          
          const matches = line.match(UNSAFE_EXPANSION);
          if (matches && matches.length > 2) {
            diagnostics.push({
              severity: "info",
              category: "runtime",
              rule: this.id,
              file: hookFile.name,
              line: i + 1,
              message: "Unquoted variable expansion detected. Use \"${VAR}\" for safety.",
              fix: "Quote variables: \"${VAR}\" instead of $VAR",
            });
            break; // One warning per file is enough
          }
        }
      }

      return diagnostics;
    },
  },

  {
    id: "integration/cross-file-references",
    category: "consistency",
    severity: "info",
    description: "Validate cross-file references and imports",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      
      // Extract all @import or @include style references
      const REFERENCE_PATTERN = /@(?:import|include|see|ref)\s+([^\s]+)/g;
      
      for (const file of files) {
        if (!file.name.endsWith(".md")) continue;
        
        const matches = [...file.content.matchAll(REFERENCE_PATTERN)];
        for (const match of matches) {
          const referencedPath = match[1];
          const lineNumber = file.content.substring(0, match.index).split("\n").length;
          
          // Check if referenced file exists
          const exists = files.some(f => 
            f.name === referencedPath || 
            f.name.endsWith("/" + referencedPath)
          );
          
          if (!exists) {
            diagnostics.push({
              severity: "warning",
              category: "consistency",
              rule: this.id,
              file: file.name,
              line: lineNumber,
              message: `Broken reference: "${referencedPath}" not found in workspace.`,
              fix: "Fix the path or create the missing file.",
            });
          }
        }
      }

      return diagnostics;
    },
  },

  {
    id: "integration/skill-workspace-sync",
    category: "consistency",
    severity: "info",
    description: "Check if skills are documented in main agent file",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      
      const skillDirs = new Set<string>();
      for (const file of files) {
        if (file.name.startsWith("skills/") && file.name.includes("/")) {
          const skillName = file.name.split("/")[1];
          if (skillName) skillDirs.add(skillName);
        }
      }

      if (skillDirs.size === 0) return []; // No skills folder

      const mainFile = files.find(f => f.name === "CLAUDE.md" || f.name === "AGENTS.md");
      if (!mainFile) return [];

      const undocumentedSkills: string[] = [];
      for (const skillName of skillDirs) {
        const isDocumented = mainFile.content.toLowerCase().includes(skillName.toLowerCase());
        if (!isDocumented) {
          undocumentedSkills.push(skillName);
        }
      }

      if (undocumentedSkills.length > 0) {
        diagnostics.push({
          severity: "info",
          category: "consistency",
          rule: this.id,
          file: mainFile.name,
          message: `${undocumentedSkills.length} skills not mentioned in main file: ${undocumentedSkills.join(", ")}`,
          fix: "Add a ## Skills section documenting available skills and when to use them.",
        });
      }

      return diagnostics;
    },
  },
];
