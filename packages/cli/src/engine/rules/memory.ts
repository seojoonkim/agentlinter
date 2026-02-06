/* ─── Memory Rules (15%) ─── */
/* 
 * Evaluates how well the agent handles session continuity,
 * context persistence, and knowledge management across sessions.
 * This is uniquely important for AI agents — unlike traditional software,
 * agents lose all context between sessions unless explicitly designed not to.
 */

import { Rule, Diagnostic } from "../types";

export const memoryRules: Rule[] = [
  {
    id: "memory/has-memory-strategy",
    category: "memory",
    severity: "warning",
    description: "Agent should have an explicit memory/continuity strategy",
    applicableContexts: ["openclaw-runtime"], // Only for persistent agents, not project-scoped Claude Code
    check(files) {
      const allContent = files.map((f) => f.content).join("\n");

      const hasMemoryFile = files.some(
        (f) =>
          f.name === "MEMORY.md" ||
          f.name.toLowerCase().includes("memory") ||
          f.name === "HEARTBEAT.md"
      );

      const hasMemorySection = files.some((f) =>
        f.sections.some((s) =>
          /memory|continuity|persistence|handoff|session/i.test(s.heading)
        )
      );

      const hasMemoryKeywords =
        /memory.*system|session.*continuity|persist.*across|between.*sessions|context.*window/i.test(
          allContent
        );

      if (!hasMemoryFile && !hasMemorySection && !hasMemoryKeywords) {
        return [
          {
            severity: "warning",
            category: "memory",
            rule: this.id,
            file: "(workspace)",
            message:
              "No memory strategy defined. The agent will lose all context between sessions.",
            fix: "Add a ## Memory section or create MEMORY.md defining how the agent persists knowledge: file-based notes, database, or structured handoff protocol.",
          },
        ];
      }
      return [];
    },
  },

  {
    id: "memory/has-handoff-protocol",
    category: "memory",
    severity: "warning",
    description: "Agent should know how to hand off context between sessions",
    applicableContexts: ["openclaw-runtime"], // Session handoff is an OpenClaw concept
    check(files) {
      const allContent = files.map((f) => f.content).join("\n");

      const hasHandoff =
        /handoff|hand.?off|session.*start|every.*session|bootstrap|wake.*up|fresh.*session|new.*session/i.test(
          allContent
        );

      const hasProgressFile = files.some(
        (f) =>
          f.name.includes("progress") ||
          f.name.includes("handoff") ||
          f.name.includes("bootstrap")
      );

      if (!hasHandoff && !hasProgressFile) {
        return [
          {
            severity: "warning",
            category: "memory",
            rule: this.id,
            file: "(workspace)",
            message:
              "No session handoff protocol found. The agent doesn't know what to read or do when waking up in a new session.",
            fix: "Add startup instructions: which files to read first, how to restore context, and what to check on session start.",
          },
        ];
      }
      return [];
    },
  },

  {
    id: "memory/has-file-based-notes",
    category: "memory",
    severity: "info",
    description: "File-based memory (daily notes, logs) provides persistence",
    applicableContexts: ["openclaw-runtime"], // File-based memory is an OpenClaw pattern
    check(files) {
      const allContent = files.map((f) => f.content).join("\n");

      const hasFileMemory =
        /daily.*note|daily.*log|YYYY-MM-DD|memory\/|logs?\/|journal|write.*down|record.*decision/i.test(
          allContent
        );

      const hasMemoryDir = files.some(
        (f) => f.name.includes("memory/") || f.name.includes("logs/")
      );

      if (!hasFileMemory && !hasMemoryDir) {
        return [
          {
            severity: "info",
            category: "memory",
            rule: this.id,
            file: "(workspace)",
            message:
              "No file-based memory system (daily notes, logs). Consider structured note-taking for long-term knowledge.",
            fix: "Add a memory/ directory or document a note-taking protocol (e.g., daily logs in memory/YYYY-MM-DD.md).",
          },
        ];
      }
      return [];
    },
  },

  {
    id: "memory/no-mental-notes",
    category: "memory",
    severity: "info",
    description: "Agent should write things down, not rely on 'mental notes'",
    applicableContexts: ["openclaw-runtime"], // Note-taking is an OpenClaw pattern
    check(files) {
      const allContent = files.map((f) => f.content).join("\n");

      const hasWriteItDown =
        /write.*it.*down|don'?t.*rely.*on.*memory|mental.*note.*don'?t|persist|save.*to.*file/i.test(
          allContent
        );

      // Only flag if there IS a memory strategy but no "write it down" principle
      const hasMemoryMention =
        /memory|continuity|handoff|persist/i.test(allContent);

      if (hasMemoryMention && !hasWriteItDown) {
        return [
          {
            severity: "info",
            category: "memory",
            rule: this.id,
            file: "(workspace)",
            message:
              "Memory strategy exists but missing explicit 'write it down' principle. Mental notes don't survive restarts.",
            fix: "Add a clear instruction: 'Write it down. Mental notes don't survive restarts.' to reinforce persistence behavior.",
          },
        ];
      }
      return [];
    },
  },

  {
    id: "memory/has-context-window-awareness",
    category: "memory",
    severity: "info",
    description: "Agent should be aware of context window limitations",
    applicableContexts: ["openclaw-runtime"], // Context window management is for long-running agents
    check(files) {
      const allContent = files.map((f) => f.content).join("\n");

      const hasContextAwareness =
        /context.*window|token.*limit|context.*limit|truncat|summariz.*long|compact|overflow/i.test(
          allContent
        );

      if (!hasContextAwareness) {
        return [
          {
            severity: "info",
            category: "memory",
            rule: this.id,
            file: "(workspace)",
            message:
              "No context window awareness. The agent should know how to handle long conversations and context overflow.",
            fix: "Add guidance for long-context scenarios: when to summarize, how to prioritize recent vs. old context.",
          },
        ];
      }
      return [];
    },
  },

  {
    id: "memory/has-state-tracking",
    category: "memory",
    severity: "info",
    description: "Agent should track current task state for continuity",
    applicableContexts: ["openclaw-runtime"], // State tracking across sessions is an OpenClaw pattern
    check(files) {
      const allContent = files.map((f) => f.content).join("\n");

      const hasStateTracking =
        /progress|current.*task|active.*task|task.*state|work.*queue|todo|task.*track/i.test(
          allContent
        );

      const hasProgressFile = files.some(
        (f) =>
          f.name.includes("progress") ||
          f.name.includes("queue") ||
          f.name.includes("todo") ||
          f.name.includes("tasks")
      );

      if (!hasStateTracking && !hasProgressFile) {
        return [
          {
            severity: "info",
            category: "memory",
            rule: this.id,
            file: "(workspace)",
            message:
              "No task/state tracking mechanism. The agent can't resume work from where it left off.",
            fix: "Add a progress file (e.g., compound/progress.md) or task queue to track active work across sessions.",
          },
        ];
      }
      return [];
    },
  },

  {
    id: "memory/has-learning-loop",
    category: "memory",
    severity: "info",
    description: "Agent should learn from past interactions",
    applicableContexts: ["openclaw-runtime"], // Continual learning is for persistent agents
    check(files) {
      const allContent = files.map((f) => f.content).join("\n");

      const hasLearning =
        /learn|improv|evolv|updat.*based.*on|feedback.*loop|retrospective|distill|curated/i.test(
          allContent
        );

      if (!hasLearning) {
        return [
          {
            severity: "info",
            category: "memory",
            rule: this.id,
            file: "(workspace)",
            message:
              "No learning loop defined. The agent doesn't know how to improve over time from past interactions.",
            fix: "Add a learning mechanism: periodic distillation of daily notes into long-term memory, or decision logging for future reference.",
          },
        ];
      }
      return [];
    },
  },
];
