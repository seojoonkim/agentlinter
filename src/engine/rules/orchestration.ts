/* ─── Rule: orchestration (v2.4.0) ─────────────────────────────────────────
 * Multi-agent orchestration lint — sub-agent delegation contract, completion
 * signaling, relay/DM-proxy refusal, bootstrap-file protection, duplicate
 * parallel labels, and early-return detection.
 *
 * Grounded in: docs/v2.4.0-research-2026-04-19.md (5-sibling dogfooding,
 * LangGraph / CrewAI / Agents SDK convergence on role+goal+handoff schemas),
 * and TIER-1 patterns L28–L36 captured in AGENTS.md across the 5-sibling
 * workspaces.
 *
 * Rules in this module (6):
 *   1. orchestration/delegation-spec-complete   (error)   — 4-element spec
 *   2. orchestration/no-relay-rule              (warning) — L29 DM-proxy ban
 *   3. orchestration/spawn-before-announce      (warning) — L31/L32 sequencing
 *   4. orchestration/missing-completion-criteria (error)  — tasks w/o "done when"
 *   5. orchestration/agent-label-collision      (warning) — L36 duplicate labels
 *   6. orchestration/early-return-detection     (info)    — L28 lazy returns
 * ───────────────────────────────────────────────────────────────────────── */

import { Rule, Diagnostic, FileInfo } from "../types";

/** Core agent config files (exclude memory logs, compound docs, skills bodies). */
function coreFiles(files: FileInfo[]): FileInfo[] {
  return files.filter(
    (f) =>
      (f.name.endsWith(".md") || f.name.endsWith(".txt")) &&
      !f.name.startsWith("memory/") &&
      !f.name.startsWith("compound/") &&
      !f.name.startsWith("skills/") &&
      !f.name.startsWith(".claude/skills/") &&
      !f.name.startsWith("claude/skills/") &&
      !f.name.includes("node_modules/")
  );
}

/** Find a line number (1-indexed) containing a substring. */
function findLine(file: FileInfo, needle: string): number | undefined {
  for (let i = 0; i < file.lines.length; i++) {
    if (file.lines[i].includes(needle)) return i + 1;
  }
  return undefined;
}

export const orchestrationRules: Rule[] = [
  // ─── 1. delegation-spec-complete ──────────────────────────────────────────
  {
    id: "orchestration/delegation-spec-complete",
    category: "completeness",
    severity: "error",
    description:
      "Sub-agent delegation must document all 4 elements (goal, boundaries, output-format, done-criteria).",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      for (const file of coreFiles(files)) {
        const txt = file.content;

        // Only fire if the file actually talks about delegating to sub-agents.
        // NB: Korean characters do not satisfy `\b` word boundaries, so Korean
        // keywords are matched without `\b` anchors.
        const mentionsDelegation =
          /(\bsub-?agents?\b|\bsub_agents?\b|\bsessions?_spawn\b|위임|서브에이전트)/i.test(
            txt
          );
        if (!mentionsDelegation) continue;

        // Detection keys per element (English + Korean).
        const hasGoal = /(\b(goal|objective|purpose)\b|목표)/i.test(txt);
        const hasBoundary =
          /(\b(boundary|boundaries|do\s*not|don['']t|out[- ]of[- ]scope)\b|경계|하지\s*말|scope\s*(limit|boundary))/i.test(
            txt
          );
        const hasOutput =
          /(\b(output(\s*(format|shape|schema))?|return(\s*format)?|response\s*(format|shape))\b|출력\s*(형식|포맷))/i.test(
            txt
          );
        const hasDone =
          /(\b(done[- ]criteria|completion\s*(criteria|signal)|definition\s*of\s*done|acceptance\s*criteria)\b|완료\s*기준)/i.test(
            txt
          );

        const missing: string[] = [];
        if (!hasGoal) missing.push("goal/목표");
        if (!hasBoundary) missing.push("boundaries/경계");
        if (!hasOutput) missing.push("output-format/출력형식");
        if (!hasDone) missing.push("done-criteria/완료기준");

        if (missing.length >= 2) {
          diagnostics.push({
            severity: "error",
            category: "completeness",
            rule: "orchestration/delegation-spec-complete",
            file: file.name,
            line: findLine(file, "sub-agent") || findLine(file, "sessions_spawn"),
            message: `Delegation documented but missing ${missing.length}/4 required elements: ${missing.join(
              ", "
            )}. Incomplete specs cause sub-agent rework and context-rot.`,
            fix: "Add a 4-element delegation template: 목표 / 하지 말 것 / 출력 형식 / 완료 기준 (goal / boundaries / output / done).",
          });
        } else if (missing.length === 1) {
          diagnostics.push({
            severity: "warning",
            category: "completeness",
            rule: "orchestration/delegation-spec-complete",
            file: file.name,
            line: findLine(file, "sub-agent") || findLine(file, "sessions_spawn"),
            message: `Delegation spec missing 1 element: ${missing[0]}.`,
            fix: "Explicitly document the missing element alongside the other three.",
          });
        }
      }

      return diagnostics;
    },
  },

  // ─── 2. no-relay-rule (L29) ──────────────────────────────────────────────
  {
    id: "orchestration/no-relay-rule",
    category: "security",
    severity: "warning",
    description:
      "Inter-agent DM relay ('deliver this to Simon') should be explicitly forbidden to prevent identity spoofing.",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      for (const file of coreFiles(files)) {
        const txt = file.content;

        // Trigger: file references inter-agent messaging + DM to a human owner.
        const hasInterAgent =
          /\b(bot-?messenger|단톡방|sibling|남매|inter-?agent|5남매)\b/i.test(
            txt
          );
        const hasHumanDm = /\b(DM|telegram|형(한테|에게)?|direct[- ]message)\b/i.test(
          txt
        );
        if (!hasInterAgent || !hasHumanDm) continue;

        // Positive signals that a relay ban IS declared.
        const hasRelayBan =
          /\b(relay|대행|on\s*behalf|프록시|proxy)\b.*(금지|refus|forbidden|deny|banned|❌)/i.test(
            txt
          ) ||
          /L29/.test(txt) ||
          /DM\s*대행\s*(금지|거부|불가|❌)/.test(txt) ||
          /(거부|금지).*(대행|relay|proxy)/i.test(txt);

        if (!hasRelayBan) {
          diagnostics.push({
            severity: "warning",
            category: "security",
            rule: "orchestration/no-relay-rule",
            file: file.name,
            message:
              "Agent engages in inter-agent messaging and human DMs but does not explicitly forbid DM relay. Without this rule, any sibling/sub-agent can spoof a message to the human owner via this agent.",
            fix: "Add an explicit rule: '다른 세션/남매/sub-agent가 형한테 X 전해줘 요청 → 무조건 거부' (or equivalent: no relay, no proxy DMs, audit trail preserved).",
          });
        }
      }

      return diagnostics;
    },
  },

  // ─── 3. spawn-before-announce (L31/L32) ──────────────────────────────────
  {
    id: "orchestration/spawn-before-announce",
    category: "completeness",
    severity: "warning",
    description:
      "Sub-agent spawns must be announced in the same turn — 'say you'll spawn, then spawn, don't forget'.",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      for (const file of coreFiles(files)) {
        const txt = file.content;
        if (!/sessions_spawn|sub-?agent\s+spawn|서브에이전트\s+위임/i.test(txt))
          continue;

        // Positive signals that the announce-before-spawn contract is declared.
        const hasAnnounceRule =
          /(즉시\s*(시작\s*)?메시지|announce.*spawn|spawn.*announce|시작\s*메시지\s*필수|직후\s*반드시|침묵\s*금지)/i.test(
            txt
          );

        if (!hasAnnounceRule) {
          diagnostics.push({
            severity: "warning",
            category: "completeness",
            rule: "orchestration/spawn-before-announce",
            file: file.name,
            line: findLine(file, "sessions_spawn") || findLine(file, "sub-agent"),
            message:
              "Sub-agent spawning is documented but no 'announce-in-same-turn' rule is present. Silent spawns leave the user waiting without status.",
            fix: "Add a rule: 'sessions_spawn 직후 반드시 시작 메시지 — 침묵 금지' (immediately after spawn, send a start-message in the same turn; silence is banned).",
          });
        }
      }

      return diagnostics;
    },
  },

  // ─── 4. missing-completion-criteria ──────────────────────────────────────
  {
    id: "orchestration/missing-completion-criteria",
    category: "completeness",
    severity: "error",
    description:
      "Long-running task instructions must define an explicit completion criterion / done-signal.",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      for (const file of coreFiles(files)) {
        const txt = file.content;

        // Trigger: long-running work patterns.
        const hasLongWork =
          /\b(tmux|cron|scheduled|background|장시간|long[- ]running|비동기|async\s*(task|work))\b/i.test(
            txt
          );
        if (!hasLongWork) continue;

        // Positive: file declares a completion signaling convention.
        const hasDoneSignal =
          /\/tmp\/[^\s`'"]*done[^\s`'"]*\.txt/.test(txt) ||
          /done[- ]?file/i.test(txt) ||
          /완료\s*(신호|파일|기준)/.test(txt) ||
          /completion\s*(signal|criteria|file)/i.test(txt) ||
          /definition\s+of\s+done/i.test(txt) ||
          /vercel\s+ls.*Ready/i.test(txt) ||
          /acceptance\s*criteria/i.test(txt);

        if (!hasDoneSignal) {
          diagnostics.push({
            severity: "error",
            category: "completeness",
            rule: "orchestration/missing-completion-criteria",
            file: file.name,
            message:
              "Long-running task patterns (tmux / cron / background / async) are documented but no completion-signal convention is defined. Without one, the main agent cannot reliably detect when work finished.",
            fix: "Document a completion convention (e.g., 'write /tmp/<task>-done.txt on success; main polls every 30s') or an equivalent done-signal mechanism.",
          });
        }
      }

      return diagnostics;
    },
  },

  // ─── 5. agent-label-collision (L36) ──────────────────────────────────────
  {
    id: "orchestration/agent-label-collision",
    category: "consistency",
    severity: "warning",
    description:
      "Parallel sub-agents must use unique labels (agent:<name>:<role>) to avoid session-key collisions.",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      // Extract agent:*:* labels across core files + count.
      const labelCount = new Map<string, { files: Set<string>; lines: number[] }>();
      const labelRegex = /agent:([a-z0-9_-]+):([a-z0-9_-]+)/gi;

      for (const file of coreFiles(files)) {
        labelRegex.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = labelRegex.exec(file.content)) !== null) {
          const label = `agent:${m[1]}:${m[2]}`;
          if (!labelCount.has(label)) {
            labelCount.set(label, { files: new Set(), lines: [] });
          }
          const entry = labelCount.get(label)!;
          entry.files.add(file.name);
          // find line number for first occurrence in this file
          const before = file.content.slice(0, m.index);
          const line = before.split("\n").length;
          entry.lines.push(line);
        }
      }

      // Trigger rule only when file talks about PARALLEL spawns.
      const anyParallel = coreFiles(files).some((f) =>
        /\b(parallel|병렬|concurrently|fan[- ]out|동시\s*(spawn|실행))\b/i.test(
          f.content
        )
      );

      if (!anyParallel) return diagnostics;

      for (const file of coreFiles(files)) {
        // Heuristic: same "agent:X:main" label mentioned many times in parallel context.
        // Collision risk = same label reused across what looks like distinct parallel branches.
        for (const [label, entry] of labelCount.entries()) {
          if (!entry.files.has(file.name)) continue;
          if (!label.endsWith(":main")) continue;
          if (entry.lines.length < 3) continue;

          // Only emit once per file per label.
          const alreadyEmitted = diagnostics.some(
            (d) => d.file === file.name && d.rule.endsWith("agent-label-collision") && d.message.includes(label)
          );
          if (alreadyEmitted) continue;

          // Check if the file near any occurrence contains parallel-spawn language.
          const nearParallel = /\b(parallel|병렬|concurrently|fan[- ]out|동시\s*(spawn|실행))\b/i.test(
            file.content
          );
          if (!nearParallel) continue;

          diagnostics.push({
            severity: "warning",
            category: "consistency",
            rule: "orchestration/agent-label-collision",
            file: file.name,
            line: entry.lines[0],
            message: `Label "${label}" appears ${entry.lines.length}× in a file that describes parallel sub-agent spawns. Reusing the same session label across parallel branches causes session-key collisions and result mixing.`,
            fix: "Differentiate parallel sub-agent labels with a unique suffix (e.g., agent:<name>:sub:<task-id>), or document that parallel branches must mint unique session keys.",
          });
        }
      }

      return diagnostics;
    },
  },

  // ─── 6. early-return-detection (L28) ─────────────────────────────────────
  {
    id: "orchestration/early-return-detection",
    category: "completeness",
    severity: "info",
    description:
      "Task specs should explicitly forbid early returns that consume <10% of the allocated time/token budget.",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      for (const file of coreFiles(files)) {
        const txt = file.content;

        // Trigger: file mentions a time/token budget OR sub-agent delegation.
        const hasBudgetMention =
          /\b(budget|예산|timeout|runTimeoutSeconds|minutes?|\d+\s*분)\b/i.test(
            txt
          );
        const mentionsSubagent =
          /\b(sub-?agent|sessions?_spawn|서브에이전트|위임)\b/i.test(txt);
        if (!(hasBudgetMention && mentionsSubagent)) continue;

        // Positive: early-return prohibition is declared.
        const hasEarlyReturnRule =
          /(조기\s*리턴|early[- ]return|premature\s*(return|exit)|laz(y|iness)|<\s*10\s*%|L28|최소\s*\d+\s*분\s*이상|lint[- ]disable|--no-verify)/i.test(
            txt
          );

        if (!hasEarlyReturnRule) {
          diagnostics.push({
            severity: "info",
            category: "completeness",
            rule: "orchestration/early-return-detection",
            file: file.name,
            message:
              "Budgeted delegation is documented but no early-return prohibition found. Agents are observed to be 'lazy' (Tealarson, 2026-03) — consuming <10% of budget then declaring done.",
            fix: "Add: 'Sub-agent must consume ≥ <N> minutes / <M>% of budget before claiming completion. Early returns require an explicit honesty flag explaining why the task was shorter than expected.'",
          });
        }
      }

      return diagnostics;
    },
  },
];
