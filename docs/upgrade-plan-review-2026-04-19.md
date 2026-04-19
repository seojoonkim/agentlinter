# UPGRADE_PLAN_v1.0.0.md 재점검 (2026-04-19)

> 2/25에 작성된 v1.0.0 플랜을 기준으로, 현재 v2.3.0 상태에서 달성도를 평가하고 v2.4.0+ 로드맵에 흡수할 잔존 항목을 정리.

## 1. 원본 플랜 요약 (v0.9.0 → v1.0.0)

v1.0.0의 목표: **Claude Code 심층 통합**
- 신규 Rule 파일 6개
- Context Window Budget Estimator
- `.claude/` 재귀 스캔 (2-depth)
- CHANGELOG 도입

**제안 Rule 6개:**
1. `instruction-count` — 지시 개수 카운팅 + 임계값
2. `relevance-trap` — context-specific 지시 → `.claude/rules/` 분리 권고
3. `progressive-disclosure` — 긴 CLAUDE.md + rules/ 미사용 감지
4. `hooks-structure` — `.claude/hooks/` 유효성 검사
5. `skills-vs-commands` — deprecated commands/ → skills/ 마이그레이션
6. `agent-focus` — 서브에이전트 역할 과다 감지

---

## 2. 현재 상태 대비표 (v2.3.0 기준)

| 목표 (v1.0.0 플랜) | 상태 | 파일 / 근거 | 비고 |
|---|---|---|---|
| `instructionCount.ts` | ✅ Done | `packages/cli/src/engine/rules/instructionCount.ts` | MEMORY.md/HEARTBEAT.md 제외 개선 (v2.3.0) |
| `relevanceTrap.ts` | ✅ Done | `rules/relevanceTrap.ts` | v1.0.0 릴리즈 시 포함 |
| `progressiveDisclosure.ts` | ✅ Done | `rules/progressiveDisclosure.ts` | |
| `hooksStructure.ts` | ✅ Done | `rules/hooksStructure.ts` | |
| `skillsVsCommands.ts` | ✅ Done | `rules/skillsVsCommands.ts` | |
| `agentFocus.ts` | ✅ Done | `rules/agentFocus.ts` | |
| `budget.ts` (Context Window Budget) | ✅ Done | `packages/cli/src/engine/budget.ts` | v2.3.0 skills budget separation 추가 |
| `.claude/` 재귀 스캔 | ✅ Done | parser.ts | |
| `CHANGELOG.md` | ✅ Done | CHANGELOG.md (v1.0 → v2.3.0) | 단, v2.3.0 섹션은 본 리뷰에서 추가 작성 |

**v1.0.0 플랜 달성률: 9/9 = 100%**

---

## 3. v1.0.0 이후 실제 진행 경로 (v1.1 → v2.3)

| 버전 | 날짜 | 주요 성과 | v1.0 플랜 대비 |
|---|---|---|---|
| v1.1.0 | 2026-03-01 | Position Risk, Token Efficiency, Enhanced Security | 플랜 외 추가 |
| v1.2.0 | 2026-03-03 | Token Budget Estimator, `.claudeignore` | 플랜 확장 |
| v2.0.0 | 2026-03-04 | v2 Analysis Engine (5 modules), Clarity Score, Badge API, Korean 토큰 보정 | **플랜 초월** — 완전 새 아키텍처 |
| v2.1.0 | 2026-03-05 | +13 rules (duplicate content, obvious statements, dead/circular import, Cursor/Copilot 지원) | 플랜 외 — Multi-framework 확장 |
| v2.2.0 | 2026-03-09 | Token Budget+, Prompt Injection Defense, Cognitive Blueprint, Multi-export | 플랜 외 — 보안/블루프린트 |
| v2.3.0 | 2026-03-22 | Freshness Linter, Korean workspace fairness, Report Page Redesign (tabs) | 플랜 외 — UX/정확도 |

**총 rules 수:** v0.9 ~40 → v2.3.0 ~60+ (추정)  
**총 카테고리:** 9 → 11 (blueprint, freshness 추가)

---

## 4. 원본 플랜의 Obsolete / 재해석 항목

| 항목 | 판정 | 사유 |
|---|---|---|
| 제안했던 BudgetReport 150 hardcode | 🔄 Evolved | v2.3.0에서 skills budget 분리 + Korean 보정 도입 → 더 정교 |
| 모든 rules가 기존 카테고리 재사용 | 🚫 Obsolete | 실제 v2.x에서 `blueprint`, `freshness` 등 새 카테고리 추가 |
| `structure/dead-import`, `circular-import`는 v2.1에서 별도 `importValidator.ts`로 구현 | ✅ 재해석 완료 | |
| Claude Code v1.0 시대 CLI 가이드 (deprecated `commands/`) | 🔄 Updated | v2.2.0 Multi-Framework Export로 일반화 (cursor/copilot/gemini) |

---

## 5. v2.4.0에 흡수할 잔존/새 방향

v1.0 플랜 원본에 **없었지만**, 현재 v2.3.0 구조가 완성된 후 자연스럽게 떠오르는 다음 단계:

### 🔴 High Priority (v2.4.0 후보)
1. **AI Agent Security Linting 확장**
   - 현재 security 카테고리: 25 pattern → 50+ pattern으로 확장
   - HiveFence (`сlawdhub.com/skills/hivefence`) 패턴 정식 병합 제안 (5남매 에이전트 집단면역 네트워크 기반)
2. **Runtime Profiling Hook 지원**
   - 스킬 실행 시간, 토큰 소비 런타임 데이터를 린터에 feed
   - 정적 분석 → 동적 분석 확장
3. **Multi-Agent Workflow Linting**
   - 5남매 (Zeon/Sion/Mion/Sano/Raon) 구조 같은 orchestration 설정 린팅
   - sub-agent spawn 패턴 검증 (streamTo="parent" 규칙 등)

### 🟡 Medium Priority (v2.4.0 또는 v2.5.0)
4. **Git Hook / Pre-commit Integration**
   - `npx agentlinter install-hook` 명령
   - husky / lint-staged 플러그인
5. **ACP (Agent Communication Protocol) Compatibility**
   - ACP harness 설정 파일 린팅

### 🟢 Low Priority (v3.0 이후)
6. **Visual / Report Enhancements** — Sparklines, timeline of scores
7. **IDE Integrations** — VSCode extension, JetBrains plugin

---

## 6. 결론

**v1.0.0 플랜은 완전히 달성됨 (100%).**

v1.1 ~ v2.3 기간 동안 플랜 원본이 예상하지 못했던 방향으로 확장:
- 다중 프레임워크 (Cursor/Copilot/Gemini) 지원
- Korean workspace fairness
- 에디토리얼 리포트 페이지 리디자인
- Prompt Injection Defense 카테고리

**v2.4.0은 "정확도와 확장성"** — 현재 달성된 기능의 폭을 더 깊게 파는 방향 권장 (security pattern 확장, runtime integration).

**잔존 플랜 항목: 0개** — v1.0 플랜의 모든 목표는 이미 구현 완료 상태.

---

*Reviewer: Zeon (sub-agent, 2026-04-19)*  
*v2.4.0 기획 상세: `docs/v2.4.0-plan.md`*
