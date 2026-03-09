/* ─── Rule: Cognitive Blueprint Validation (v2.2.0) ─── */

import { Rule, Diagnostic } from "../types";

interface BlueprintElement {
  name: string;
  label: string;
  patterns: RegExp[];
}

const BLUEPRINT_ELEMENTS: BlueprintElement[] = [
  {
    name: "identity",
    label: "Identity",
    patterns: [
      /\b(?:you are|your role|your name|agent name|persona|identity|character)\b/i,
      /\b(?:act as|behave as|you're a)\b/i,
      /^#.*(?:identity|role|persona|who you are)/im,
    ],
  },
  {
    name: "goals",
    label: "Goals",
    patterns: [
      /\b(?:your goal|your purpose|your mission|objective|aim to|designed to)\b/i,
      /\b(?:help (?:the )?user|assist with|primary (?:goal|purpose|task))\b/i,
      /^#.*(?:goal|purpose|mission|objective)/im,
    ],
  },
  {
    name: "constraints",
    label: "Constraints",
    patterns: [
      /\b(?:never|forbidden|do not|don'?t|must not|shall not|prohibited|off-limits)\b/i,
      /\b(?:boundary|boundaries|constraint|limitation|restriction)\b/i,
      /^#.*(?:constraint|boundar|restriction|limitation|forbidden|rule)/im,
    ],
  },
  {
    name: "memory",
    label: "Memory",
    patterns: [
      /\b(?:memory|remember|persist|retain|session|context|recall)\b/i,
      /\b(?:save (?:to|in)|write (?:to|in)|store|log|journal)\b/i,
      /^#.*(?:memory|context|session|persist)/im,
    ],
  },
  {
    name: "planning",
    label: "Planning",
    patterns: [
      /\b(?:plan|step|task|phase|workflow|procedure|process|pipeline)\b/i,
      /\b(?:first.*then|step \d|phase \d|before.*after)\b/i,
      /^#.*(?:plan|workflow|process|step|procedure)/im,
    ],
  },
  {
    name: "validation",
    label: "Validation",
    patterns: [
      /\b(?:verify|check|confirm|validate|test|assert|ensure)\b/i,
      /\b(?:review|double.check|quality|QA|approval)\b/i,
      /^#.*(?:valid|verif|check|confirm|test|review)/im,
    ],
  },
];

export const blueprintRules: Rule[] = [
  {
    id: "blueprint/coverage",
    category: "blueprint",
    severity: "warning",
    description: "Agent config should cover 6 cognitive blueprint elements",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const allContent = files.map((f) => f.content).join("\n");

      const found: string[] = [];
      const missing: string[] = [];

      for (const element of BLUEPRINT_ELEMENTS) {
        const hasElement = element.patterns.some((p) => p.test(allContent));
        if (hasElement) {
          found.push(element.name);
        } else {
          missing.push(element.name);
        }
      }

      const coverage = found.length;
      const total = BLUEPRINT_ELEMENTS.length;

      const statusLine = BLUEPRINT_ELEMENTS.map((e) =>
        found.includes(e.name) ? `${e.label} ✅` : `${e.label} ❌`
      ).join(" ");

      if (coverage <= 3) {
        diagnostics.push({
          severity: "error",
          category: "blueprint",
          rule: this.id,
          file: "(workspace)",
          message: `Blueprint Coverage: ${coverage}/${total} (${statusLine}). Critical: only ${coverage} of 6 core elements found.`,
          fix: `Add missing elements: ${missing.join(", ")}. Each element strengthens agent reliability.`,
        });
      } else if (coverage < total) {
        diagnostics.push({
          severity: "warning",
          category: "blueprint",
          rule: this.id,
          file: "(workspace)",
          message: `Blueprint Coverage: ${coverage}/${total} (${statusLine}).`,
          fix: `Add missing elements: ${missing.join(", ")}.`,
        });
      }

      return diagnostics;
    },
  },

  {
    id: "blueprint/identity-defined",
    category: "blueprint",
    severity: "warning",
    description: "Agent should have a clear identity/role definition",
    check(files) {
      const allContent = files.map((f) => f.content).join("\n");
      const identityElement = BLUEPRINT_ELEMENTS.find((e) => e.name === "identity")!;
      const hasIdentity = identityElement.patterns.some((p) => p.test(allContent));

      if (!hasIdentity) {
        return [{
          severity: "warning",
          category: "blueprint",
          rule: this.id,
          file: "(workspace)",
          message: "No agent identity/role definition found. The agent doesn't know who it is.",
          fix: "Add a section defining the agent's role, name, or persona (e.g., 'You are a coding assistant').",
        }];
      }
      return [];
    },
  },

  {
    id: "blueprint/constraints-defined",
    category: "blueprint",
    severity: "warning",
    description: "Agent should have explicit constraints (what NOT to do)",
    check(files) {
      const allContent = files.map((f) => f.content).join("\n");
      const constraintElement = BLUEPRINT_ELEMENTS.find((e) => e.name === "constraints")!;
      const hasConstraints = constraintElement.patterns.some((p) => p.test(allContent));

      if (!hasConstraints) {
        return [{
          severity: "warning",
          category: "blueprint",
          rule: this.id,
          file: "(workspace)",
          message: "No constraints or boundaries found. The agent has no explicit limits on what it should NOT do.",
          fix: "Add NEVER/DO NOT rules to define clear boundaries (e.g., 'Never delete production data').",
        }];
      }
      return [];
    },
  },
];
