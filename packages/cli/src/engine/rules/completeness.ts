/* ─── Completeness Rules (20%) ─── */

import { Rule, Diagnostic } from "../types";

export const completenessRules: Rule[] = [
  {
    id: "completeness/has-identity",
    category: "completeness",
    severity: "warning",
    description: "Agent should have a defined identity or persona",
    check(files) {
      const hasIdentityFile = files.some(
        (f) =>
          f.name === "SOUL.md" ||
          f.name === "IDENTITY.md" ||
          f.name.toLowerCase().includes("persona")
      );

      const mainFile = files.find(
        (f) => f.name === "CLAUDE.md" || f.name === "AGENTS.md"
      );
      const hasIdentitySection = mainFile?.sections.some((s) =>
        /identity|persona|who you are|character|personality|role/i.test(s.heading)
      );

      if (!hasIdentityFile && !hasIdentitySection) {
        return [
          {
            severity: "warning",
            category: "completeness",
            rule: this.id,
            file: mainFile?.name || "(workspace)",
            message:
              "No identity/persona defined. Without this, the agent has no consistent personality.",
            fix: "Create SOUL.md or add a ## Identity section defining who the agent is, its tone, and behavior principles.",
          },
        ];
      }
      return [];
    },
  },

  {
    id: "completeness/has-tools",
    category: "completeness",
    severity: "warning",
    description: "Agent should have tool documentation",
    check(files) {
      const hasToolsFile = files.some(
        (f) =>
          f.name === "TOOLS.md" || f.name.toLowerCase().includes("tools")
      );

      const mainFile = files.find(
        (f) => f.name === "CLAUDE.md" || f.name === "AGENTS.md"
      );
      const hasToolsSection = mainFile?.sections.some((s) =>
        /tools|commands|capabilities|available tools/i.test(s.heading)
      );

      if (!hasToolsFile && !hasToolsSection) {
        return [
          {
            severity: "warning",
            category: "completeness",
            rule: this.id,
            file: mainFile?.name || "(workspace)",
            message:
              "No tool documentation found. The agent doesn't know what tools are available or how to use them.",
            fix: "Create TOOLS.md or add a ## Tools section documenting available tools, APIs, and usage patterns.",
          },
        ];
      }
      return [];
    },
  },

  {
    id: "completeness/has-boundaries",
    category: "completeness",
    severity: "warning",
    description: "Agent should have defined boundaries and constraints",
    check(files) {
      const allContent = files.map((f) => f.content).join("\n");
      const hasBoundaries =
        /boundar|constraint|limitation|don'?t|never|forbidden|prohibited|off.?limits|not allowed/i.test(
          allContent
        );

      if (!hasBoundaries) {
        const mainFile = files.find(
          (f) => f.name === "CLAUDE.md" || f.name === "AGENTS.md"
        );
        return [
          {
            severity: "warning",
            category: "completeness",
            rule: this.id,
            file: mainFile?.name || "(workspace)",
            message:
              "No boundaries or constraints defined. The agent needs to know what NOT to do.",
            fix: "Add a ## Boundaries section with clear rules about what's off-limits.",
          },
        ];
      }
      return [];
    },
  },

  {
    id: "completeness/has-user-context",
    category: "completeness",
    severity: "info",
    description: "Providing user context helps personalization",
    applicableContexts: ["openclaw-runtime"], // Only for OpenClaw, not Claude Code
    check(files) {
      const hasUserFile = files.some(
        (f) =>
          f.name === "USER.md" || f.name.toLowerCase().includes("user")
      );

      const mainFile = files.find(
        (f) => f.name === "CLAUDE.md" || f.name === "AGENTS.md"
      );
      const hasUserSection = mainFile?.sections.some((s) =>
        /user|human|owner|about.*you/i.test(s.heading)
      );

      if (!hasUserFile && !hasUserSection) {
        return [
          {
            severity: "info",
            category: "completeness",
            rule: this.id,
            file: "(workspace)",
            message:
              "No user context found. Telling the agent about its user (preferences, role, timezone) improves responses.",
            fix: "Create USER.md with user info: name, role, timezone, preferences, communication style.",
          },
        ];
      }
      return [];
    },
  },

  {
    id: "completeness/has-error-handling",
    category: "completeness",
    severity: "info",
    description: "Agent should know how to handle errors and edge cases",
    check(files) {
      const allContent = files.map((f) => f.content).join("\n");
      const hasErrorHandling =
        /error|fail|fallback|edge case|exception|when.*wrong|if.*fail|recover/i.test(
          allContent
        );

      if (!hasErrorHandling) {
        return [
          {
            severity: "info",
            category: "completeness",
            rule: this.id,
            file: "(workspace)",
            message:
              "No error handling guidance found. The agent should know what to do when things go wrong.",
            fix: "Add error handling instructions: retry logic, fallback behavior, when to ask for help.",
          },
        ];
      }
      return [];
    },
  },

  {
    id: "completeness/has-output-format",
    category: "completeness",
    severity: "info",
    description: "Defining expected output format improves consistency",
    check(files) {
      const allContent = files.map((f) => f.content).join("\n");
      const hasFormat =
        /format|output|response.*style|markdown|json|structured|template/i.test(
          allContent
        );

      if (!hasFormat) {
        return [
          {
            severity: "info",
            category: "completeness",
            rule: this.id,
            file: "(workspace)",
            message:
              "No output format guidance found. Defining format expectations (markdown, JSON, length) improves consistency.",
          },
        ];
      }
      return [];
    },
  },

  {
    id: "completeness/has-workflow",
    category: "completeness",
    severity: "info",
    description: "Defining workflows helps the agent handle multi-step tasks",
    check(files) {
      const allContent = files.map((f) => f.content).join("\n");
      const hasWorkflow =
        /workflow|deploy|git.*push|step.*by.*step|procedure|process|pipeline/i.test(
          allContent
        );

      if (!hasWorkflow) {
        return [
          {
            severity: "info",
            category: "completeness",
            rule: this.id,
            file: "(workspace)",
            message:
              "No workflow documentation found. Define common multi-step processes (deploy, review, etc.).",
          },
        ];
      }
      return [];
    },
  },

  {
    id: "completeness/has-priorities",
    category: "completeness",
    severity: "info",
    description: "Prioritization helps agents decide what matters most",
    check(files) {
      const allContent = files.map((f) => f.content).join("\n");
      const hasPriority =
        /priorit|critical|important|must|P0|P1|urgent|first.*then/i.test(
          allContent
        );

      if (!hasPriority) {
        return [
          {
            severity: "info",
            category: "completeness",
            rule: this.id,
            file: "(workspace)",
            message:
              "No priority guidance found. Help the agent know what's most important when instructions conflict.",
          },
        ];
      }
      return [];
    },
  },
];
