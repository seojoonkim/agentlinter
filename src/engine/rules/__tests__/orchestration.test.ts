/* ─── Smoke test: orchestration rules (v2.4.0) ─────────────────────────────
 * Pure-function smoke test, no Jest dependency — run via `npx tsx`.
 *
 *   npx tsx src/engine/rules/__tests__/orchestration.test.ts
 *
 * Verifies each of the 6 rules fires on a crafted-positive input and does NOT
 * fire on a crafted-negative input.
 * ───────────────────────────────────────────────────────────────────────── */

import { orchestrationRules } from "../orchestration";
import { FileInfo } from "../../types";

function makeFile(name: string, content: string): FileInfo {
  return {
    name,
    path: `/test/${name}`,
    content,
    lines: content.split("\n"),
    sections: [],
  };
}

function byId(id: string) {
  const r = orchestrationRules.find((x) => x.id === id);
  if (!r) throw new Error(`rule not registered: ${id}`);
  return r;
}

let pass = 0;
let fail = 0;
function assert(cond: boolean, label: string) {
  if (cond) {
    pass++;
    console.log(`  ✓ ${label}`);
  } else {
    fail++;
    console.log(`  ✗ ${label}`);
  }
}

// ─── 1. delegation-spec-complete ─────────────────────────────────────────
{
  console.log("\nRule: orchestration/delegation-spec-complete");
  const rule = byId("orchestration/delegation-spec-complete");

  // Positive — mentions sub-agent but missing all 4 elements.
  const bad = makeFile(
    "BAD.md",
    "We use sub-agents heavily. Just spawn one and let it figure out what to do."
  );
  const d1 = rule.check([bad]);
  assert(
    d1.some((d) => d.file === "BAD.md"),
    "fires when sub-agent mentioned without goal/boundary/output/done"
  );

  // Negative — all 4 elements present.
  const good = makeFile(
    "GOOD.md",
    `## Sub-agent delegation template
목표: Clear goal. 
Boundaries: do not touch production.
Output format: JSON response.
완료 기준: tests green.
`
  );
  const d2 = rule.check([good]);
  assert(
    !d2.some((d) => d.file === "GOOD.md"),
    "does not fire when all 4 elements are documented"
  );
}

// ─── 2. no-relay-rule ────────────────────────────────────────────────────
{
  console.log("\nRule: orchestration/no-relay-rule");
  const rule = byId("orchestration/no-relay-rule");

  const bad = makeFile(
    "BAD.md",
    "We use bot-messenger for 단톡방 and DM to 형 on Telegram. Siblings can relay messages."
  );
  const d1 = rule.check([bad]);
  assert(
    d1.some((d) => d.file === "BAD.md"),
    "fires when inter-agent + DM exist but no relay ban"
  );

  const good = makeFile(
    "GOOD.md",
    "We use bot-messenger for 단톡방 and DM to 형 on Telegram. L29 — DM 대행 거부 (무조건 금지)."
  );
  const d2 = rule.check([good]);
  assert(
    !d2.some((d) => d.file === "GOOD.md"),
    "does not fire when L29 relay ban is declared"
  );
}

// ─── 3. spawn-before-announce ────────────────────────────────────────────
{
  console.log("\nRule: orchestration/spawn-before-announce");
  const rule = byId("orchestration/spawn-before-announce");

  const bad = makeFile(
    "BAD.md",
    "Call sessions_spawn(task=...) whenever you need a sub-agent. That's it."
  );
  const d1 = rule.check([bad]);
  assert(
    d1.some((d) => d.file === "BAD.md"),
    "fires when spawn documented without announce rule"
  );

  const good = makeFile(
    "GOOD.md",
    "sessions_spawn 직후 반드시 시작 메시지 필수 — 침묵 금지."
  );
  const d2 = rule.check([good]);
  assert(
    !d2.some((d) => d.file === "GOOD.md"),
    "does not fire when announce-after-spawn rule present"
  );
}

// ─── 4. missing-completion-criteria ──────────────────────────────────────
{
  console.log("\nRule: orchestration/missing-completion-criteria");
  const rule = byId("orchestration/missing-completion-criteria");

  const bad = makeFile(
    "BAD.md",
    "Launch tmux session, run cron, work in background. Report when you feel done."
  );
  const d1 = rule.check([bad]);
  assert(
    d1.some((d) => d.file === "BAD.md"),
    "fires when long-running work mentioned without completion signal"
  );

  const good = makeFile(
    "GOOD.md",
    "Launch tmux session and write /tmp/work-done.txt on success. Main agent polls for it."
  );
  const d2 = rule.check([good]);
  assert(
    !d2.some((d) => d.file === "GOOD.md"),
    "does not fire when done-signal convention defined"
  );
}

// ─── 5. agent-label-collision ────────────────────────────────────────────
{
  console.log("\nRule: orchestration/agent-label-collision");
  const rule = byId("orchestration/agent-label-collision");

  const bad = makeFile(
    "BAD.md",
    `Spawn in parallel:
  - agent:zeon:main handles task A
  - agent:zeon:main handles task B
  - agent:zeon:main handles task C
  병렬 처리 — 동시 spawn.`
  );
  const d1 = rule.check([bad]);
  assert(
    d1.some((d) => d.file === "BAD.md"),
    "fires when same :main label reused in parallel context"
  );

  const good = makeFile(
    "GOOD.md",
    `Spawn in parallel with unique keys:
  - agent:zeon:sub:task-a
  - agent:zeon:sub:task-b
  - agent:zeon:sub:task-c
  병렬 처리.`
  );
  const d2 = rule.check([good]);
  assert(
    !d2.some((d) => d.file === "GOOD.md"),
    "does not fire when parallel labels are unique"
  );
}

// ─── 6. early-return-detection ───────────────────────────────────────────
{
  console.log("\nRule: orchestration/early-return-detection");
  const rule = byId("orchestration/early-return-detection");

  const bad = makeFile(
    "BAD.md",
    "Sub-agent 위임 시 runTimeoutSeconds: 300 예산 할당. 빠르게 끝내도 OK."
  );
  const d1 = rule.check([bad]);
  assert(
    d1.some((d) => d.file === "BAD.md"),
    "fires when budget + sub-agent documented without early-return prohibition"
  );

  const good = makeFile(
    "GOOD.md",
    "Sub-agent 위임 시 runTimeoutSeconds: 300. L28 — 최소 30분 이상 소요, 조기 리턴 금지."
  );
  const d2 = rule.check([good]);
  assert(
    !d2.some((d) => d.file === "GOOD.md"),
    "does not fire when early-return ban is declared"
  );
}

console.log(`\n─────────────────────────────`);
console.log(`Passed: ${pass}   Failed: ${fail}`);
process.exit(fail === 0 ? 0 : 1);
