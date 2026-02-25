# AgentLinter v0.9.0 → v1.0.0 구현 계획

## 1. 신규 파일 생성

### Rule 파일 (6개)
| 파일 | 역할 |
|------|------|
| `src/engine/rules/instructionCount.ts` | 지시 개수 카운팅 + 임계값 경고 |
| `src/engine/rules/relevanceTrap.ts` | context-specific 지시 감지 → rules/ 분리 권고 |
| `src/engine/rules/progressiveDisclosure.ts` | 긴 CLAUDE.md + rules/ 미사용 감지 |
| `src/engine/rules/hooksStructure.ts` | .claude/hooks/ 유효성 검사 |
| `src/engine/rules/skillsVsCommands.ts` | commands/ → skills/ 마이그레이션 권고 |
| `src/engine/rules/agentFocus.ts` | 서브에이전트 역할 과다 정의 감지 |

### 새 기능 모듈
| 파일 | 역할 |
|------|------|
| `src/engine/budget.ts` | Context Window Budget Estimator |

### 문서
| 파일 | 역할 |
|------|------|
| `CHANGELOG.md` | 릴리즈 노트 |

---

## 2. 수정할 기존 파일

| 파일 | 수정 내용 |
|------|-----------|
| `package.json` | version: `"0.9.0"` → `"1.0.0"` |
| `src/engine/types.ts` | Category에 `"claudeCode"` 추가 (새 rules가 기존 category 재사용하므로 대부분 불필요. budget 관련 타입만 추가) |
| `src/engine/rules/index.ts` | 6개 새 rule import + allRules에 spread |
| `src/engine/parser.ts` | `.claude/` 하위 디렉토리 재귀 스캔 확장 (agents/, skills/, rules/, hooks/) |
| `src/engine/scorer.ts` | budget estimator 호출 옵션 추가 |
| `src/engine/reporter.ts` | budget report 포맷 추가 |
| `src/engine/index.ts` | `budget` export 추가 |

---

## 3. 각 Rule 구현 로직

### 3-1. instruction-count (⭐⭐⭐)

```typescript
// src/engine/rules/instructionCount.ts
import { Rule, Diagnostic } from "../types";

/** Count instruction-like lines */
function countInstructions(content: string): number {
  const lines = content.split("\n");
  let count = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    // Bullet points: - , * , + (not headings, not code blocks)
    if (/^[-*+]\s+\S/.test(trimmed)) { count++; continue; }
    // Numbered lists: 1. , 2. etc
    if (/^\d+[.)]\s+\S/.test(trimmed)) { count++; continue; }
    // Imperative sentences (starts with verb-like word, ends with period or no period)
    // Heuristic: line starts with uppercase word that looks like a verb command
    if (/^(Do|Don't|Never|Always|Use|Avoid|Keep|Make|Set|Run|Check|Ensure|Follow|Include|Write|Read|Create|Delete|Add|Remove|Update|Prefer|Remember|Note)\b/i.test(trimmed)) {
      count++; continue;
    }
  }
  return count;
}

export const instructionCountRules: Rule[] = [
  {
    id: "claude-code/instruction-count",
    category: "clarity",  // reuse existing category
    severity: "warning",
    description: "Too many instructions may exceed Claude Code's effective context",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      // Count across all non-memory, non-compound files
      const coreFiles = files.filter(
        f => !f.name.startsWith("memory/") && !f.name.startsWith("compound/") && f.name.endsWith(".md")
      );
      let totalInstructions = 0;
      const perFile: { name: string; count: number }[] = [];

      for (const file of coreFiles) {
        const count = countInstructions(file.content);
        totalInstructions += count;
        perFile.push({ name: file.name, count });
      }

      if (totalInstructions >= 150) {
        diagnostics.push({
          severity: "error",
          category: "clarity",
          rule: "claude-code/instruction-count",
          file: "workspace",
          message: `${totalInstructions} instructions detected. Claude Code reserves ~50 instructions internally, leaving ~100-150 for your config. You are over the reliable limit.`,
          fix: "Split instructions into .claude/rules/*.md files for context-aware loading",
        });
      } else if (totalInstructions >= 100) {
        diagnostics.push({
          severity: "warning",
          category: "clarity",
          rule: "claude-code/instruction-count",
          file: "workspace",
          message: `${totalInstructions} instructions detected. Claude Code reserves ~50 instructions internally. Consider splitting into .claude/rules/*.md`,
          fix: "Move context-specific rules to .claude/rules/{context}.md",
        });
      }
      return diagnostics;
    },
  },
];
```

### 3-2. relevance-trap (⭐⭐⭐)

```typescript
// src/engine/rules/relevanceTrap.ts
import { Rule, Diagnostic } from "../types";

// Patterns that indicate context-specific instructions (likely to be ignored by relevance filter)
const SPECIFIC_PATH_RE = /(?:src\/|lib\/|app\/|pages\/|components\/)[a-zA-Z0-9_/.-]+\.[a-zA-Z]+/;
const SPECIFIC_FILE_RE = /(?:when editing|in file|for file|only in|specific to)\s+[`"]?[a-zA-Z0-9_/.-]+\.[a-zA-Z]+/i;
const CONDITIONAL_CONTEXT_RE = /(?:if working on|when (?:using|modifying|touching|editing)|only for)\s+(?:the\s+)?[a-zA-Z0-9_/.-]+/i;
const FRAMEWORK_SPECIFIC_RE = /(?:in (?:Next\.js|React|Vue|Svelte|Django|Rails|Express)(?:\s+(?:projects?|apps?|code))?)/i;

export const relevanceTrapRules: Rule[] = [
  {
    id: "claude-code/relevance-trap",
    category: "clarity",
    severity: "warning",
    description: "Context-specific instructions in CLAUDE.md may be ignored due to Claude Code's relevance filter",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      // Only check CLAUDE.md and AGENTS.md (root-level files that get system-reminder wrapped)
      const rootFiles = files.filter(f => f.name === "CLAUDE.md" || f.name === "AGENTS.md");

      for (const file of rootFiles) {
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];
          const patterns = [
            { re: SPECIFIC_PATH_RE, reason: "specific file path" },
            { re: SPECIFIC_FILE_RE, reason: "file-conditional instruction" },
            { re: CONDITIONAL_CONTEXT_RE, reason: "context-conditional instruction" },
            { re: FRAMEWORK_SPECIFIC_RE, reason: "framework-specific instruction" },
          ];

          for (const { re, reason } of patterns) {
            if (re.test(line)) {
              diagnostics.push({
                severity: "warning",
                category: "clarity",
                rule: "claude-code/relevance-trap",
                file: file.name,
                line: i + 1,
                message: `Potentially context-specific instruction (${reason}): "${line.trim().substring(0, 80)}". Claude Code wraps CLAUDE.md in a relevance filter — this may be silently ignored.`,
                fix: `Move to .claude/rules/{specific-context}.md where it will only load when relevant`,
              });
              break;
            }
          }
        }
      }
      return diagnostics;
    },
  },
];
```

### 3-3. progressive-disclosure (⭐⭐)

```typescript
// src/engine/rules/progressiveDisclosure.ts
import { Rule, Diagnostic } from "../types";

export const progressiveDisclosureRules: Rule[] = [
  {
    id: "claude-code/progressive-disclosure",
    category: "structure",
    severity: "warning",
    description: "Long CLAUDE.md should be modularized into .claude/rules/",
    check(files) {
      const diagnostics: Diagnostic[] = [];
      const claudeMd = files.find(f => f.name === "CLAUDE.md");
      if (!claudeMd) return diagnostics;

      const lineCount = claudeMd.lines.length;
      const hasRulesDir = files.some(f => f.name.startsWith(".claude/rules/"));

      if (lineCount > 50 && !hasRulesDir) {
        diagnostics.push({
          severity: "warning",
          category: "structure",
          rule: "claude-code/progressive-disclosure",
          file: "CLAUDE.md",
          message: `CLAUDE.md is ${lineCount} lines but no .claude/rules/ directory found. Long monolithic configs reduce signal-to-noise ratio.`,
          fix: "Split into modular .claude/rules/*.md files for better context loading",
        });
      }

      if (lineCount > 200) {
        diagnostics.push({
          severity: "error",
          category: "structure",
          rule: "claude-code/progressive-disclosure",
          file: "CLAUDE.md",
          message: `CLAUDE.md is ${lineCount} lines — extremely long. Claude Code may not process all instructions effectively.`,
          fix: "Keep CLAUDE.md under 150 lines. Move details to .claude/rules/*.md",
        });
      }
      return diagnostics;
    },
  },
];
```

### 3-4. hooks-structure (⭐⭐)

```typescript
// src/engine/rules/hooksStructure.ts
import { Rule, Diagnostic } from "../types";

const VALID_EVENTS = ["PreToolUse", "PostToolUse", "Stop", "SubagentStop", "Notification"];

export const hooksStructureRules: Rule[] = [
  {
    id: "claude-code/hooks-structure",
    category: "runtime",
    severity: "warning",
    description: "Validate .claude/hooks configuration structure",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      // Check for hooks in any file (JSON or YAML-like in MD)
      for (const file of files) {
        if (!file.name.includes("hooks") && !file.name.includes("settings.json")) continue;

        // Check for valid event names
        const eventMatches = file.content.matchAll(/["']?(PreToolUse|PostToolUse|Stop|SubagentStop|Notification|[A-Z][a-zA-Z]+)["']?\s*[:=]/g);
        for (const match of eventMatches) {
          const eventName = match[1];
          if (!VALID_EVENTS.includes(eventName) && /^[A-Z]/.test(eventName)) {
            diagnostics.push({
              severity: "warning",
              category: "runtime",
              rule: "claude-code/hooks-structure",
              file: file.name,
              message: `Unknown hook event "${eventName}". Valid events: ${VALID_EVENTS.join(", ")}`,
              fix: `Use one of: ${VALID_EVENTS.join(", ")}`,
            });
          }
        }

        // Check for command field in hook definitions
        if (file.name.endsWith(".json")) {
          // Simple heuristic: if file mentions hook events but no "command" field
          const hasEvent = VALID_EVENTS.some(e => file.content.includes(e));
          const hasCommand = /["']command["']\s*:/i.test(file.content);
          if (hasEvent && !hasCommand) {
            diagnostics.push({
              severity: "error",
              category: "runtime",
              rule: "claude-code/hooks-structure",
              file: file.name,
              message: `Hook definition found but missing "command" field`,
              fix: `Each hook must have a "command" field specifying the shell command to run`,
            });
          }
        }
      }
      return diagnostics;
    },
  },
];
```

### 3-5. skills-vs-commands (⭐⭐)

```typescript
// src/engine/rules/skillsVsCommands.ts
import { Rule, Diagnostic } from "../types";

export const skillsVsCommandsRules: Rule[] = [
  {
    id: "claude-code/skills-vs-commands",
    category: "runtime",
    severity: "warning",
    description: "Detect deprecated .claude/commands/ usage — migrate to .claude/skills/",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      const hasCommands = files.some(f => f.name.startsWith(".claude/commands/") || f.name.includes("claude/commands/"));
      const hasSkills = files.some(f => f.name.startsWith(".claude/skills/") || f.name.includes("claude/skills/"));

      if (hasCommands) {
        diagnostics.push({
          severity: "warning",
          category: "runtime",
          rule: "claude-code/skills-vs-commands",
          file: ".claude/commands/",
          message: `Deprecated .claude/commands/ detected. Claude Code (Feb 2026+) uses .claude/skills/ instead.`,
          fix: hasSkills
            ? "Remove .claude/commands/ — you already have .claude/skills/"
            : "Rename .claude/commands/ to .claude/skills/ and update SKILL.md format",
        });
      }

      // Also check for references in markdown files
      for (const file of files) {
        if (!file.name.endsWith(".md")) continue;
        for (let i = 0; i < file.lines.length; i++) {
          if (/\.claude\/commands\//i.test(file.lines[i])) {
            diagnostics.push({
              severity: "info",
              category: "runtime",
              rule: "claude-code/skills-vs-commands",
              file: file.name,
              line: i + 1,
              message: `Reference to deprecated .claude/commands/ path`,
              fix: "Update to .claude/skills/",
            });
          }
        }
      }
      return diagnostics;
    },
  },
];
```

### 3-6. agent-focus (⭐⭐)

```typescript
// src/engine/rules/agentFocus.ts
import { Rule, Diagnostic } from "../types";

export const agentFocusRules: Rule[] = [
  {
    id: "claude-code/agent-focus",
    category: "clarity",
    severity: "warning",
    description: "Detect overly broad subagent definitions",
    check(files) {
      const diagnostics: Diagnostic[] = [];

      // Check .claude/agents/ files
      const agentFiles = files.filter(f =>
        f.name.includes("agents/") && f.name.endsWith(".md")
      );

      for (const file of agentFiles) {
        // Count role/responsibility definitions
        const roleLines = file.lines.filter(l =>
          /^[-*+]\s+/i.test(l.trim()) || /^\d+[.)]\s+/i.test(l.trim())
        );

        if (roleLines.length > 30) {
          diagnostics.push({
            severity: "warning",
            category: "clarity",
            rule: "claude-code/agent-focus",
            file: file.name,
            message: `Agent definition has ${roleLines.length} responsibility items. Focused agents (10-15 responsibilities) perform better.`,
            fix: "Split into multiple specialized agents or use skills for specific capabilities",
          });
        }

        // Check for multiple unrelated section topics
        const h2Sections = file.sections.filter(s => s.level === 2);
        if (h2Sections.length > 8) {
          diagnostics.push({
            severity: "info",
            category: "clarity",
            rule: "claude-code/agent-focus",
            file: file.name,
            message: `Agent has ${h2Sections.length} top-level sections — may be trying to do too much`,
            fix: "Consider splitting responsibilities across multiple agents",
          });
        }
      }
      return diagnostics;
    },
  },
];
```

---

## 4. Context Budget Estimator

```typescript
// src/engine/budget.ts
import { FileInfo } from "./types";

export interface BudgetReport {
  systemReserved: number;      // ~50 (fixed)
  claudeMdCount: number;       // instructions in CLAUDE.md
  rulesCount: number;          // instructions in .claude/rules/
  agentsCount: number;         // instructions in .claude/agents/
  totalCount: number;
  limit: number;               // 150
  percentage: number;          // 0-100
  status: "ok" | "warning" | "over";
}

function countInstructions(content: string): number {
  const lines = content.split("\n");
  let count = 0;
  for (const line of lines) {
    const t = line.trim();
    if (/^[-*+]\s+\S/.test(t)) { count++; continue; }
    if (/^\d+[.)]\s+\S/.test(t)) { count++; continue; }
    if (/^(Do|Don't|Never|Always|Use|Avoid|Keep|Make|Set|Run|Check|Ensure|Follow|Include|Write|Read|Create|Delete|Add|Remove|Update|Prefer|Remember|Note)\b/i.test(t)) {
      count++; continue;
    }
  }
  return count;
}

export function estimateBudget(files: FileInfo[]): BudgetReport {
  const SYSTEM_RESERVED = 50;
  const LIMIT = 150;

  const claudeMd = files.filter(f => f.name === "CLAUDE.md" || f.name === "AGENTS.md");
  const rules = files.filter(f => f.name.startsWith(".claude/rules/"));
  const agents = files.filter(f => f.name.startsWith(".claude/agents/"));

  const claudeMdCount = claudeMd.reduce((s, f) => s + countInstructions(f.content), 0);
  const rulesCount = rules.reduce((s, f) => s + countInstructions(f.content), 0);
  const agentsCount = agents.reduce((s, f) => s + countInstructions(f.content), 0);
  const totalCount = SYSTEM_RESERVED + claudeMdCount + rulesCount + agentsCount;
  const percentage = Math.round((totalCount / (SYSTEM_RESERVED + LIMIT)) * 100);

  return {
    systemReserved: SYSTEM_RESERVED,
    claudeMdCount,
    rulesCount,
    agentsCount,
    totalCount,
    limit: LIMIT,
    percentage,
    status: percentage >= 100 ? "over" : percentage >= 80 ? "warning" : "ok",
  };
}

export function formatBudgetReport(report: BudgetReport): string {
  const statusIcon = report.status === "over" ? "🔴" : report.status === "warning" ? "⚠️" : "✅";
  const userTotal = report.claudeMdCount + report.rulesCount + report.agentsCount;
  return [
    `📊 Context Budget`,
    `  Claude Code system:  ~${report.systemReserved} instructions (fixed)`,
    `  Your CLAUDE.md:       ${report.claudeMdCount} instructions`,
    `  Your rules/:          ${report.rulesCount} instructions`,
    `  Your agents/:         ${report.agentsCount} instructions`,
    `  ${"─".repeat(41)}`,
    `  Total: ${userTotal}/${report.limit}  ${statusIcon} ${report.status === "over" ? "Over limit!" : report.status === "warning" ? `Near limit (${report.percentage}%)` : `OK (${report.percentage}%)`}`,
  ].join("\n");
}
```

---

## 5. 기존 코드 통합

### 5-1. `src/engine/rules/index.ts` 수정

```typescript
// 추가할 import들
import { instructionCountRules } from "./instructionCount";
import { relevanceTrapRules } from "./relevanceTrap";
import { progressiveDisclosureRules } from "./progressiveDisclosure";
import { hooksStructureRules } from "./hooksStructure";
import { skillsVsCommandsRules } from "./skillsVsCommands";
import { agentFocusRules } from "./agentFocus";

// allRules 배열에 추가
  ...instructionCountRules,
  ...relevanceTrapRules,
  ...progressiveDisclosureRules,
  ...hooksStructureRules,
  ...skillsVsCommandsRules,
  ...agentFocusRules,
```

### 5-2. `src/engine/parser.ts` 수정

`AGENT_DIRS` 배열에서 `.claude`는 이미 포함됨. 하지만 현재 1-depth만 스캔하므로, `.claude/rules/`, `.claude/agents/`, `.claude/skills/`, `.claude/hooks/` 하위를 재귀 스캔하도록 확장:

```typescript
// 기존 AGENT_DIRS 스캔 로직 교체 — 재귀 2-depth
for (const dir of AGENT_DIRS) {
  const dirPath = path.join(workspacePath, dir);
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    scanDirRecursive(dirPath, files, dir, 0, 2); // max depth 2
  }
}

function scanDirRecursive(dir: string, files: FileInfo[], prefix: string, depth: number, maxDepth: number) {
  if (depth > maxDepth) return;
  try {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      if (entry === "node_modules" || entry.startsWith(".")) continue;
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      const relativeName = `${prefix}/${entry}`;
      if (stat.isDirectory()) {
        scanDirRecursive(fullPath, files, relativeName, depth + 1, maxDepth);
      } else if (entry.endsWith(".md") || entry.endsWith(".txt") || entry.endsWith(".json")) {
        if (!files.some(f => f.path === fullPath)) {
          files.push(parseFile(fullPath, relativeName));
        }
      }
    }
  } catch { /* skip */ }
}
```

### 5-3. `src/engine/index.ts` 수정

```typescript
export { estimateBudget, formatBudgetReport } from "./budget";
```

### 5-4. `src/engine/types.ts` — 변경 불필요

새 rules는 기존 category (`clarity`, `structure`, `runtime`)를 재사용. `BudgetReport`는 budget.ts에 자체 정의.

---

## 6. 테스트 시나리오

### 테스트 1: instruction-count
```markdown
# CLAUDE.md (200+ bullet points)
- Rule 1
- Rule 2
... (200개)
```
→ **Expected:** error "200 instructions detected..."

### 테스트 2: relevance-trap
```markdown
# CLAUDE.md
- When editing src/components/Header.tsx, always use React.memo
- For Next.js API routes, validate with zod
```
→ **Expected:** 2 warnings (specific path, framework-specific)

### 테스트 3: progressive-disclosure
```markdown
# CLAUDE.md (100줄, .claude/rules/ 없음)
```
→ **Expected:** warning "CLAUDE.md is 100 lines but no .claude/rules/"

### 테스트 4: hooks-structure
```json
// .claude/settings.json with "OnToolUse" (invalid event)
{ "hooks": { "OnToolUse": { "command": "echo hi" } } }
```
→ **Expected:** warning "Unknown hook event OnToolUse"

### 테스트 5: skills-vs-commands
디렉토리에 `.claude/commands/deploy.md` 존재
→ **Expected:** warning "Deprecated .claude/commands/"

### 테스트 6: agent-focus
`.claude/agents/helper.md` with 40 bullet points
→ **Expected:** warning "Agent has 40 responsibility items"

### 테스트 7: budget estimator
CLAUDE.md 73개 지시 + rules/ 12개 지시
→ **Expected:** "Total: 85/150 ✅ OK (68%)"

### 테스트 8: 실제 workspace (~/clawd)
→ 전체 통합 테스트

---

## 7. 릴리즈 노트 초안

```markdown
# AgentLinter v1.0.0 🎉

> ESLint for AI Agents — now with Claude Code deep integration

## ✨ New Rules (6)

### 🔴 instruction-count
Counts total instructions across your agent config. Claude Code reserves ~50 instructions internally, leaving 100-150 for your setup. Warns at 100+, errors at 150+.

### 🔴 relevance-trap
Detects context-specific instructions in CLAUDE.md that may be silently ignored. Claude Code wraps CLAUDE.md in a relevance filter (`<system-reminder>IMPORTANT: this context may or may not be relevant...</system-reminder>`), so file-specific or framework-specific rules should live in `.claude/rules/`.

### 🟡 progressive-disclosure
Warns when CLAUDE.md exceeds 50 lines without `.claude/rules/` modularization.

### 🟡 hooks-structure
Validates `.claude/hooks/` configuration — checks event names and required fields.

### 🟡 skills-vs-commands
Detects deprecated `.claude/commands/` and recommends migration to `.claude/skills/` (Claude Code Feb 2026+).

### 🟡 agent-focus
Flags subagent definitions with too many responsibilities (30+ items).

## 📊 Context Window Budget Estimator

New `--budget` flag shows your instruction budget:

```
📊 Context Budget
  Claude Code system:  ~50 instructions (fixed)
  Your CLAUDE.md:       73 instructions
  Your rules/:          12 instructions
  ─────────────────────────────────────────
  Total: 85/150  ✅ OK (68%)
```

## 🔍 Full .claude/ Directory Scanning

Now scans the complete `.claude/` tree:
- `.claude/agents/` — agent definitions
- `.claude/skills/` — skill configurations  
- `.claude/rules/` — modular rule files
- `.claude/hooks/` — hook configurations

## 📦 Breaking Changes
None — all new rules use existing categories. Scores may change due to additional diagnostics.

## Upgrade
Update and rescan your workspace to see the new diagnostics.
```

---

## 8. 구현 순서 (권장)

1. **parser.ts** 재귀 스캔 확장 (다른 모든 rule이 의존)
2. **instructionCount.ts** + **budget.ts** (핵심 기능, 공유 함수)
3. **relevanceTrap.ts** (최우선 rule)
4. **progressiveDisclosure.ts** (간단)
5. **hooksStructure.ts**, **skillsVsCommands.ts**, **agentFocus.ts** (병렬 가능)
6. **rules/index.ts** 통합 + **engine/index.ts** export
7. **reporter.ts** budget 포맷 추가
8. **package.json** 버전 범프
9. **CHANGELOG.md** 작성
10. 테스트 + 빌드 확인
