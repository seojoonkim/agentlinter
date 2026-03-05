# AgentLinter Changelog

---

## v2.1.0 — 2026-03-XX 🚀

### 🆕 New: 13 Rules Added (17 → 30 total)

#### 📊 Token Bloat Score 강화 (+3 rules)
- **`clarity/duplicate-content`** — 파일 내/파일 간 중복 섹션 탐지 (3-gram Jaccard similarity ≥ 0.6)
- **`clarity/obvious-statements`** — LLM에게 불필요한 "당연한 말" 감지 ("be accurate", "follow instructions" 등)
- **`clarity/token-budget-range`** — 실제 토큰 수 추정 기반 그레이딩 (English: 4 chars/token, Korean: 1.5 chars/token)

#### 🕐 Freshness / Staleness Detector (+3 rules, NEW)
- **`consistency/stale-file-reference`** — Markdown 내 파일 경로가 실제로 존재하는지 검증
- **`consistency/stale-date`** — 90일+ 이전 날짜 경고, 180일+ error
- **`consistency/stale-package-reference`** — 참조된 패키지가 package.json에 있는지 크로스체크

#### 📎 @ Import Validator (+2 rules, NEW)
- **`structure/dead-import`** — `@file.md` 스타일 import가 실제 파일을 가리키는지 검증
- **`structure/circular-import`** — import 그래프에서 순환 참조 탐지

#### 🔀 Multi-Framework Support (+4 rules, NEW)
- **Cursor** (.cursorrules) 스캔 지원 + 형식 검증
  - `cursor/rules-format` — .cursorrules 구조 검증
  - `cursor/no-conflicting-claude` — CLAUDE.md와 충돌 감지
- **GitHub Copilot** (.github/copilot-instructions.md) 스캔 지원
  - `copilot/instructions-format` — 형식 검증
  - `copilot/no-conflicting-claude` — CLAUDE.md와 충돌 감지

#### ✍️ Describe vs Command 분류기 (+1 rule)
- **`claude-code/descriptive-ratio`** — 서술문 vs 명령문 비율 분석, descriptive > 60%이면 경고

### 🔬 Enhanced
- Token Efficiency Score: line-based → token-estimated grading (Korean 보정 포함)
- Parser: .cursorrules, .github/ 디렉토리 스캔 추가
- LintContext type 확장: `cursor`, `copilot` context 추가

### 📚 Research-backed
- 웹사이트에 "Research-backed linting" 배너 추가
- Gloaguen et al. (2026) 레퍼런스

---

## v2.0.0 — 2026-03-04 🚀

### Major: v2 Analysis Engine

#### 🧠 v2 Analyzers (5 modules)
- **Cognitive Load** — measures instruction density and mental overhead
- **Token Heatmap** — visualizes token distribution across file sections
- **Modularity** — evaluates separation of concerns and file organization
- **Role Complexity** — detects over-complex role/persona definitions
- **Security Scan** — deep security analysis with 25 patterns (up from 15)

#### 🎯 Clarity Score
- 17 ambiguous pattern detections (Korean + English)
- Weighted scoring with rewrite suggestions
- Korean token correction for accurate estimation

#### 💡 Actionable Suggestions
- Every issue tagged with priority: HIGH / MED / LOW
- Fix hints with concrete rewrite examples

#### 🏷️ Badge API
- `/api/badge?score=N` endpoint — embed SVG score badge in README

#### 🔐 Security Patterns Expanded
- 25 patterns total (AWS, JWT, injection, role-hijacking, etc.)

#### 🌏 Korean Token Correction
- Accurate token estimation for Korean agent files

#### 🖥️ Token Map UI
- Budget gauge visualization
- .claudeignore card display
- v2 analyzer integration in web UI

---

## v1.2.0 — 2026-03-03

### New Features
- 📦 Token Budget Estimator — per-file token usage calculation with budget gauge
- 🚫 .claudeignore Rules — exclude files from context window analysis

---

## v1.1.0 — 2026-03-01

### New Features
- 🎯 Position Risk Warning (`structure/position-risk-warning`)
- 📊 Token Efficiency Score (`clarity/token-efficiency-score`)
- 🔐 Enhanced Security Check — prompt injection + API key exposure detection

---

## v1.0.0 — 2026-02-25 🎉

> ESLint for AI Agents — first stable release

### Features
- 17 lint rules across 9 categories
- Claude Code + OpenClaw runtime support
- CLI (`agentlinter .`) + Web UI
- Instruction count, relevance trap, context budget estimator
- `.claude/` full directory scan
- Skills safety audit

---

## Pre-1.0

- v0.9.0 — Token Budget Checker, Instruction Scope, Skills Security+, Hooks Advisor
- v0.8.2 — 4 new rules + Remote-Ready Score category
- v0.8.1 — False positive bug fixes (5)
- v0.8.0 — 7 new rules + Claude Code latest spec
- v0.7.1 — Runtime scoring improvement (55→80) + tone detection fix
- v0.7.0 — Comprehensive best practices upgrade
- v0.6.1 — RFC 2119, file reference, security skill context fixes
- v0.6.0 — Stricter english-config-files threshold, clarity rule
