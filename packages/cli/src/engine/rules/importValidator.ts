/* ─── @ Import Validator ─── */
// v2.1: dead-import, circular-import

import { Rule, Diagnostic } from "../types";
import * as fs from "fs";
import * as path from "path";

// Pattern to match @file references (Claude Code import syntax)
const IMPORT_PATTERN = /@([a-zA-Z0-9_\-./]+\.md)/g;

export const importValidatorRules: Rule[] = [
  // dead-import: @file.md references that don't exist
  {
    id: "structure/dead-import",
    category: "structure",
    severity: "warning",
    description: "Validates that @file.md import references point to existing files",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      for (const file of files) {
        const workspaceDir = file.path ? path.dirname(file.path) : process.cwd();

        let codeBlock = false;
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];
          if (line.trim().startsWith("```")) {
            codeBlock = !codeBlock;
            continue;
          }
          if (codeBlock) continue;

          IMPORT_PATTERN.lastIndex = 0;
          let match;
          while ((match = IMPORT_PATTERN.exec(line)) !== null) {
            const importPath = match[1];

            // Check relative to file directory, then workspace root
            const resolved = path.resolve(workspaceDir, importPath);
            const resolvedFromParent = path.resolve(workspaceDir, "..", importPath);

            if (!fs.existsSync(resolved) && !fs.existsSync(resolvedFromParent)) {
              diagnostics.push({
                severity: "warning",
                category: "structure",
                rule: this.id,
                file: file.name,
                line: i + 1,
                message: `Import @${importPath} references a file that does not exist.`,
                fix: "Update the import path or create the referenced file.",
              });
            }
          }
        }
      }

      return diagnostics;
    },
  },

  // circular-import: DFS cycle detection in @import graph
  {
    id: "structure/circular-import",
    category: "structure",
    severity: "error",
    description: "Detects circular references in @file.md import chains using DFS",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      // Build import graph: filename -> set of imported filenames
      const graph = new Map<string, Set<string>>();

      for (const file of files) {
        const imports = new Set<string>();
        let codeBlock = false;

        for (const line of file.lines) {
          if (line.trim().startsWith("```")) {
            codeBlock = !codeBlock;
            continue;
          }
          if (codeBlock) continue;

          IMPORT_PATTERN.lastIndex = 0;
          let match;
          while ((match = IMPORT_PATTERN.exec(line)) !== null) {
            imports.add(match[1]);
          }
        }

        if (imports.size > 0) {
          graph.set(file.name, imports);
        }
      }

      // DFS cycle detection
      const visited = new Set<string>();
      const inStack = new Set<string>();
      const reportedCycles = new Set<string>();

      function dfs(node: string, pathStack: string[]): void {
        if (inStack.has(node)) {
          // Found a cycle
          const cycleStart = pathStack.indexOf(node);
          const cycle = [...pathStack.slice(cycleStart), node];
          const cycleKey = cycle.sort().join(" -> ");
          if (!reportedCycles.has(cycleKey)) {
            reportedCycles.add(cycleKey);
            diagnostics.push({
              severity: "error",
              category: "structure",
              rule: "structure/circular-import",
              file: node,
              message: `Circular import detected: ${cycle.join(" -> ")}`,
              fix: "Break the circular reference by restructuring your imports.",
            });
          }
          return;
        }
        if (visited.has(node)) return;

        visited.add(node);
        inStack.add(node);
        pathStack.push(node);

        const edges = graph.get(node);
        if (edges) {
          for (const next of edges) {
            dfs(next, pathStack);
          }
        }

        pathStack.pop();
        inStack.delete(node);
      }

      for (const node of graph.keys()) {
        dfs(node, []);
      }

      return diagnostics;
    },
  },
];
