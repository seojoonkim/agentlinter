# AgentLinter Release Notes

> **ESLint for AI Agents** — From MVP to Production-Grade Quality Gatekeeper

**작성일:** 2026-02-15  
**초기 출시:** 2026-02-05  
**최신 버전:** v0.7.0 (2026-02-14)

---

## 🎯 왜 AgentLinter가 필요한가?

AI 에이전트는 설정 파일만큼만 똑똑하다. 모호한 `CLAUDE.md`는 모호한 결과를, 노출된 API 키는 보안 사고를, 파일 간 모순은 예측 불가능한 동작을 낳는다.

AgentLinter는 **에이전트 설정을 코드처럼 취급**한다. 소스 코드에 ESLint를 적용하듯, 에이전트 워크스페이스를 스캔·채점·수정한다.

### 해결하는 핵심 문제들

| 문제 | 영향 | AgentLinter의 해법 |
|------|------|-------------------|
| 🔇 **침묵하는 실패** | "be helpful" 같은 모호한 지시는 아무 도움도 주지 않는다 | 모호함 탐지, 구체적 대안 제시 |
| 🔑 **평문 시크릿** | API 키가 레포에 커밋됨 | 20+ 패턴 스캔, 자동 마스킹 |
| 🔀 **파일 간 표류** | SOUL.md와 CLAUDE.md가 서로 모순 | 교차 파일 일관성 체크 |
| 📉 **기준선 부재** | 개선을 측정할 방법이 없음 | 8개 차원, 0-100점 평가 |
| 🏗️ **필수 요소 누락** | 에러 복구 전략도, 경계선도 없음 | 완전성 체크리스트, 자동 수정 |
| ⚙️ **불안전한 런타임** | Gateway가 네트워크에 노출됨 | 런타임 설정 보안 검사 |
| 🛠️ **위험한 스킬** | `curl | bash` 같은 패턴 | Skill 안전성 스캐닝 |
| 🌐 **비효율적 언어** | Non-English로 토큰 2.5배 낭비 | 언어 혼용 탐지, 번역 제안 |

---

## 📈 버전별 진화 스토리

### v0.1.0 (2026-02-05) — 시작: 품질 게이트키퍼

**핵심 아이디어:** "에이전트 설정 파일을 린팅할 수 있다면?"

#### 출시 기능
- **8개 차원 스코어링:** Structure, Clarity, Completeness, Security, Consistency, Memory, Runtime Config, Skill Safety
- **웹 인터페이스:** agentlinter.vercel.app에서 즉시 채점
- **CLI 지원:** `npx agentlinter` — 설치 없이 실행
- **GitHub 통합:** 퍼블릭 레포 직접 분석
- **Share 기능:** 고유 리포트 URL 생성

#### 해결한 문제
- **측정 불가능 → 측정 가능:** "내 에이전트 설정이 좋은가?"라는 질문에 숫자로 답함
- **수동 리뷰 → 자동 검증:** CLAUDE.md 작성 후 즉시 피드백 받음

#### 설계 철학
- **Local-first:** 파일 내용은 절대 서버로 전송 안 함
- **Zero-config:** `.agentlinterrc` 없이도 바로 동작
- **Free & Open Source:** 페이월 없음, 영원히 무료

---

### v0.2.0 (2026-02-11) — 기준 확립: Claude Code Best Practice

**배경:** Anthropic의 공식 [CLAUDE.md 모범 사례](https://code.claude.com/docs/en/memory)를 발견. shanraisshan의 [claude-code-best-practice](https://github.com/shanraisshan/claude-code-best-practice) 레포에서 실전 패턴 확인.

#### 추가된 룰
- **150줄 제한 (경고):** CLAUDE.md/AGENTS.md가 150줄 초과 시 경고
  - **근거:** 컨텍스트 비만(context bloat)은 에이전트 성능 저하
  - **해법:** `.claude/rules/` 모듈화 권장

- **500줄 제한 (오류):** 500줄 초과 시 즉시 분할 필요
  - **근거:** 500줄 넘으면 에이전트가 초반 제약 잊어버림 (working memory failure)
  - **해법:** 도메인별 파일 분리

#### 해결한 문제
- **"왜 에이전트가 지시를 잊지?"** → 파일이 너무 김. 150줄 이하로 유지 권장.
- **"어떻게 모듈화?"** → `.claude/rules/git.md`, `.claude/rules/deploy.md` 패턴 제시

#### 영향
- Claude Code 사용자들에게 즉시 유용성 입증
- "Best practice를 강제하는 도구"로 포지셔닝 확립

---

### v0.3.0-v0.3.3 (2026-02-06~08) — 커뮤니티 피드백 반영

**배경:** 초기 사용자들의 피드백 + Ki Young Ju의 제안

#### v0.3.0: 자동 모드 탐지
- **문제:** Claude Code(프로젝트 모드)와 OpenClaw/Moltbot(에이전트 모드)는 다른 규칙이 필요
  - Claude Code: `CLAUDE.md`만 있음, memory strategy 불필요
  - OpenClaw: `AGENTS.md`, `USER.md`, `memory/` 등 필수

- **해법:** 파일 존재 여부로 자동 탐지
  ```
  CLAUDE.md만 존재 → Project Mode (memory 룰 스킵)
  AGENTS.md 또는 openclaw.json 존재 → Agent Mode (전체 룰 적용)
  ```

- **영향:** Claude Code 사용자가 불필요한 경고 받지 않게 됨

#### v0.3.1-v0.3.3: UX 개선
- **SHIELD.md 체크 추가:** HiveFence 패턴 (Prompt injection 방어 전략)
- **Grade Scale 세분화:**
  - 기존: S/A+/A/B+/B (5단계)
  - 개선: C/C-/D+/D/D-/F 추가 (저점수 구간 세분화)
  - **근거:** "50점짜리나 20점짜리나 똑같이 F"는 불공평

- **CTA 강화 (Ki Young Ju 피드백):**
  ```
  "AI 에이전트한테 고쳐달라고 하세요!"
  → Claude에게 리포트 복사 붙여넣기만 하면 자동 수정
  ```

- **Privacy 명확화:** "무엇이 로컬이고 무엇이 공유되는가" 섹션 추가

#### 해결한 문제
- **프레임워크별 맞춤:** 각 사용 사례에 정확한 규칙 적용
- **실용성 강화:** 사람이 고치는 게 아니라 AI에게 고치라고 시킴 (meta!)
- **신뢰 확보:** Privacy 정책 투명화

---

### v0.5.0 (2026-02-10) — 보안 강화: Skill Security Scanner

**배경:** Moltbook 커뮤니티에서 eudaemon_0의 포스트 (4894 upvotes):
> "286개 skill 중 credential stealer 발견. Skill.md는 서명 없는 바이너리나 다름없다."

#### 추가된 기능
- **`--audit-skill` 플래그:** MoltX 스타일 트로이목마 탐지
- **Dangerous Pattern 스캔:**
  - `curl ... | bash` (악의적 스크립트 실행)
  - `rm -rf /` (시스템 파괴)
  - `~/.ssh`, `~/.config`, `~/.aws` (민감 경로 접근)
  - `process.env.*API_KEY` (환경변수 키 노출)
  - `webhook.site`, `requestbin` (데이터 외부 전송)

- **기본 실행에 통합:** `npx agentlinter` 실행 시 자동으로 스킬 스캔

#### 해결한 문제
- **"Skill을 어떻게 믿나?"** → 위험 패턴 자동 탐지, 수동 검토 필요 플래그
- **"어떤 스킬이 안전한가?"** → AgentLinter Score에 "Skill Safety" 차원 포함

#### 영향
- Moltbook 커뮤니티 최대 관심사 직접 해결
- "Skill 안전성의 필수 도구"로 포지셔닝

---

### v0.6.0 (2026-02-11) — 효율성 강화: Token Economy

**배경:** 연구 기반 발견:
- EleutherAI "The Pile" (2021): LLM 학습 데이터의 95%가 영어
- Hugging Face 벤치마크: 한국어는 영어 대비 **2.4-3.8배** 토큰 사용
- MMLU: 영어가 아닌 언어는 10-20% 정확도 하락
- mT5 (NAACL 2021): 영어를 "pivot language"로 사용 시 5-15% 성능 향상

#### 추가된 룰
- **`clarity/english-config-files`:** 핵심 설정 파일에서 non-English content 탐지
  - **대상 파일:** CLAUDE.md, AGENTS.md, SOUL.md, README.md, .cursorrules
  - **Severity:**
    - 30% 이상 non-English → `warning`
    - 30% 미만 → `info`

#### 해결한 문제
- **"왜 같은 내용인데 토큰이 2배?"** → Non-English content 때문. 영어 권장.
- **"번역하면 의미 손실?"** → 맞음. 하지만 LLM은 영어로 학습됨. Trade-off 명시적으로 보여줌.

#### 영향
- Token 비용 절감 (특히 대규모 에이전트)
- 성능 향상 (영어 입력 시 더 정확한 해석)

#### 논란 가능성
- "한국어 쓰지 말라는 건가?" → **No.** 사용자 대화는 한국어 OK. **설정 파일**만 영어 권장.
- 선택은 사용자 몫. AgentLinter는 트레이드오프만 보여줌.

---

### v0.6.1 (2026-02-13) — Bug Fix: RFC 2119 & Cross-file

**배경:** 사용자 리포트에서 false positive 다수 발견

#### 수정 사항
- **RFC 2119 keywords 오탐:** `MUST`, `SHOULD` 탐지 개선
- **File reference 체크 버그:** 존재하는 파일을 "없음"으로 잘못 보고
- **Security skill context:** Skill 파일에서 보안 규칙 해석 오류

#### 해결한 문제
- **신뢰성 강화:** 오탐률 감소 → 사용자가 경고를 신뢰
- **Developer Experience:** 버그 빠르게 수정, 피드백 루프 단축

---

### v0.7.0 (2026-02-14) — 현재: Best Practice 심화

**배경:** 
- shanraisshan/claude-code-best-practice 심층 연구
- vibecoded, golden-CLAUDE.md, claudemd-architect 등 경쟁 도구 분석
- Song et al. "Large Language Model Reasoning Failures" (TMLR 2026) 학술 논문 반영

#### **25+ 새로운 룰 추가**

##### A. Advanced Inspection (고급 검사)

1. **`instruction-counter`** — 지시 개수 카운팅
   - **문제:** 지시가 많을수록 각 지시의 준수 압력 감소 (attention budget)
   - **해법:**
     - 100+ 지시 → 경고
     - 150+ 지시 → 오류
   - **근거:** golden-CLAUDE.md "각 줄이 다른 줄의 준수 압력 증가"

2. **`context-bloat-detector`** — 컨텍스트 비만 탐지
   - **문제:** 300+ 줄 파일에서 에이전트가 초반 규칙 잊음
   - **해법:**
     - 줄 수 분석 (300+ = 오류)
     - 반복 탐지 (같은 지시 3회 이상)
     - 공격적 분할 제안
   - **근거:** Working memory failure (Song et al.)

3. **`progressive-disclosure`** — 우선순위 그룹화 체크
   - **문제:** 20+ 지시가 평평하게 나열되면 뭐가 중요한지 모름
   - **해법:** Critical/Standard/Optional 마커 권장
   - **근거:** Progressive disclosure pattern (LLM prompt engineering)

4. **`anti-patterns`** — 포괄적 안티패턴 탐지
   - **패턴:**
     - Code style rules in CLAUDE.md → `.claude/rules/`로 이동
     - Embedded credentials (even placeholders) → 즉시 삭제
     - "act as senior engineer" 같은 roleplay → 무의미 (behavioral waste)
   - **근거:** golden-CLAUDE.md "Would Claude make mistakes if I remove this? → No = 삭제"

##### B. Auto-fix Suggestions (자동 수정 제안)

5. **`extract-instructions`** — 섹션 추출 권장
   - **문제:** 하나의 파일에 git, deploy, testing, security 모두 섞임
   - **해법:**
     - 도메인별 섹션 탐지
     - 최적 경로 제안 (`skills/`, `.claude/rules/`)
     - 15줄 초과 섹션에서 트리거
   - **근거:** Modular rules pattern (Claude Code 공식 문서)

6. **`convert-code-snippets`** — 코드 참조 최적화
   - **문제:** 20+ 줄 코드 블록을 CLAUDE.md에 직접 삽입 → 컨텍스트 낭비
   - **해법:**
     - 파일로 추출
     - 줄 번호 참조 (`see src/config.ts:12-34`)
   - **근거:** Token optimization best practice

7. **`structure-optimizer`** — WHY/WHAT/HOW 프레임워크
   - **문제:** "Do X" 형태 지시만 있고 이유/맥락 없음
   - **해법:**
     - 섹션에 rationale 있는지 검증
     - 의도별 분리 제안
   - **근거:** Agent comprehension 향상 (claudemd-architect)

8. **`consolidate-duplicates`** — 중복 탐지 (Jaccard similarity)
   - **문제:** 같은 내용을 다르게 표현해서 반복
   - **해법:**
     - 80% 이상 유사한 지시 탐지
     - 단일 표준 버전으로 통합 제안
   - **근거:** Consistency 강화

##### C. Integration Validation (통합 검증)

9. **`mcp-server-validator`** — MCP 설정 전체 검증
   - **문제:** JSON 문법 오류, 스키마 불일치로 MCP 서버 실패
   - **해법:**
     - JSON syntax 체크
     - Schema 검증 (`mcpServers`, `command`, `url`)
     - 흔한 실수 탐지 (npx에 `-y` 누락, 빈 command)
   - **근거:** Model Context Protocol spec

10. **`skills-linter`** — SKILL.md 포괄적 체크
    - **문제:** Skill 파일이 표준을 안 따르면 에이전트가 못 읽음
    - **해법:**
      - 필수 섹션 검증 (What/When/How)
      - 보안 패턴 탐지 (위험 명령어)
      - Hook 파일 존재 확인
    - **근거:** Agent Skills 오픈 스탠다드

11. **`hooks-checker`** — 실행 가능 hook 안전성
    - **문제:** Hook 스크립트가 shebang 없거나 unsafe variable 사용
    - **해법:**
      - Shebang 검증
      - Best practice 체크 (`set -e`, `set -u`)
      - Unsafe expansion 탐지 (`$var` without quotes)
    - **근거:** Shell scripting safety

12. **`cross-file-references`** — 깨진 참조 탐지
    - **문제:** `@import`, `@include`, `@see`, `@ref`가 존재하지 않는 파일 가리킴
    - **해법:** 모든 참조 경로 검증
    - **근거:** Consistency 차원 강화

13. **`skill-workspace-sync`** — 문서화 완전성
    - **문제:** `skills/` 디렉토리는 있는데 메인 파일에 언급 없음
    - **해법:** 모든 skill이 문서화됐는지 확인
    - **근거:** Discoverability (에이전트가 스킬 찾을 수 있어야 함)

#### 해결한 문제

| 문제 유형 | v0.6.1까지 | v0.7.0에서 |
|----------|-----------|-----------|
| **Context Bloat** | 파일 크기만 체크 | 지시 개수, 반복, 우선순위 모두 체크 |
| **Anti-patterns** | 일부 탐지 | 포괄적 탐지 (roleplay, code style 등) |
| **Modularity** | 권장만 함 | 자동 추출 제안 (섹션별 경로) |
| **Code Snippets** | 미지원 | 파일 참조로 변환 제안 |
| **MCP Integration** | 미지원 | 전체 검증 (syntax, schema, common errors) |
| **Skill Quality** | Security만 | 표준 준수, 문서화 모두 체크 |
| **Cross-file Refs** | 파일 존재만 | 모든 참조 유형 (@import, @see 등) |

#### 학술 연구 기반 설계

**Song et al. (TMLR 2026) "Large Language Model Reasoning Failures"의 6가지 실패 유형:**

| 실패 유형 | v0.7.0 대응 룰 |
|-----------|---------------|
| **Working Memory** (500줄 후 잊음) | `context-bloat-detector` |
| **Confirmation Bias** (첫 접근법 고집) | ADR 스타일 권장 (거절된 대안 포함) |
| **Proactive Initiative** (요청 안 한 기능 추가) | `anti-patterns` (MUST NOT 검증) |
| **Compositional Reasoning** (단계 누락) | `structure-optimizer` (구체적 예시 요구) |
| **Inverse Inference** ("컴파일됨" ≠ "맞음") | Exit criteria + 네거티브 테스트 제안 |
| **Robustness** (Edge case 무시) | Common Pitfalls 섹션 필수화 |

#### 영향
- **실전 에이전트 품질 비약적 향상:** 80점대 → 90점대 도약 가능
- **학술-실무 브릿지:** 최신 연구를 즉시 린팅 룰로 변환
- **경쟁 우위 확립:** claude-md-checker, vibecoded 대비 포괄성 월등

---

## 🧭 발전 방향: 지속적으로 더 똑똑하게

### 1. 문제 발견 → 해결 사이클 단축

| 버전 | 문제 발견 | 해결까지 |
|------|----------|---------|
| v0.1.0 | 출시 전 리서치 | 3주 |
| v0.5.0 | Moltbook 포스트 (eudaemon_0) | 4일 |
| v0.6.0 | 학술 논문 발견 | 1일 |
| v0.7.0 | 경쟁 분석 + 논문 | 3일 |

→ **커뮤니티 피드백 루프가 점점 빨라짐**

### 2. 단순 → 정교 진화

| 차원 | v0.1.0 | v0.7.0 |
|------|--------|--------|
| **파일 크기** | 바이트 수만 체크 | 줄 수 + 지시 개수 + 반복 탐지 |
| **명확성** | "be helpful" 같은 vague term | Naked conditionals, compound instructions, ambiguous pronouns 등 세분화 |
| **보안** | Secret 패턴 스캔 | Secret + Skill trojan + Runtime config + Cross-file reference |
| **통합** | 미지원 | MCP, Skills, Hooks 전체 검증 |

### 3. 리액티브 → 프로액티브

| 타입 | v0.1.0-v0.6.0 | v0.7.0 |
|------|--------------|--------|
| **탐지** | "이거 문제예요" | "이거 문제고, 이렇게 고치세요" |
| **예방** | 사후 탐지 | 사전 방지 (anti-patterns, best practices) |
| **교육** | 오류 메시지만 | 근거 설명 + 학술 출처 제공 |

### 4. 로컬 → 글로벌 지식

- **v0.1.0:** 하드코딩된 룰
- **v0.5.0:** Moltbook 커뮤니티 인사이트 반영
- **v0.6.0:** 학술 연구 기반 룰
- **v0.7.0:** 경쟁 도구 분석 + 최신 논문
- **미래:** Self-evolving rules (사용자 행동 학습)

---

## 🎯 실제 임팩트: 누가 무엇을 얻는가?

### For Solo Developers

**Before AgentLinter:**
```
"내 CLAUDE.md 괜찮은 것 같은데... 확신은 없음"
→ 에이전트가 가끔 이상하게 동작
→ 뭐가 문제인지 모름
```

**After AgentLinter:**
```
npx agentlinter
→ Score: 68/100 (C+)
→ "150줄 초과 (context bloat)"
→ "api_key 노출 (TOOLS.md:14)"
→ --fix로 자동 수정
→ Score: 89/100 (B+)
→ 에이전트 품질 즉시 개선
```

### For Teams

**Before:**
- 각자 다른 스타일로 CLAUDE.md 작성
- 코드 리뷰는 하는데 설정 파일 리뷰는 안 함
- 신입이 뭘 써야 할지 모름

**After:**
```yaml
# CI/CD에 AgentLinter 추가
- run: npx agentlinter --format github

# PR 자동 코멘트:
# "AgentLinter Score: 72 → 85 (+13)"
# "3 critical issues fixed"
# "Memory strategy section added"
```

→ **설정 파일도 코드처럼 품질 관리**

### For Framework Maintainers

**Claude Code, OpenClaw, Moltbot 등:**

- AgentLinter = "우리 프레임워크 Best Practice의 자동 검증기"
- 공식 문서에 "AgentLinter로 체크하세요" 링크 가능
- 커뮤니티가 스스로 품질 유지

### For Security Teams

**Before:**
- Skill 파일 수동 검토 (시간 소모)
- API 키 누출 사고 사후 발견

**After:**
```bash
npx agentlinter --audit-skill
→ "skills/deploy.sh: curl|bash 패턴 발견"
→ "TOOLS.md:14: API key 노출"
→ 배포 전 자동 차단
```

---

## 🔮 다음 단계: 2026년 로드맵

### Phase 1: 더 똑똑한 탐지 (Q1 2026)

- [ ] **AI-powered suggestions:** GPT-4를 사용해 수정안 생성 (단순 패턴 매칭 넘어)
- [ ] **Template Gallery:** awesome-cursorrules 통합 (200+ 템플릿)
- [ ] **Health Score 시스템:** claude-md-checker 스타일 (0-100, 카테고리별)

### Phase 2: 실시간 통합 (Q2 2026)

- [ ] **VS Code Extension:** 타이핑하면서 실시간 린팅
- [ ] **GitHub Action Marketplace:** 원클릭 CI/CD 통합
- [ ] **Browser Extension:** Repomix 스타일 (GitHub 페이지에서 바로 채점)

### Phase 3: 커뮤니티 기반 진화 (Q3 2026)

- [ ] **User-submitted rules:** 커뮤니티가 룰 제안
- [ ] **Leaderboard:** 프로젝트별/프레임워크별 순위
- [ ] **"AgentLinter Verified" 뱃지:** 90점 이상 프로젝트 인증

### Phase 4: 자가 진화 (Q4 2026)

- [ ] **Self-evolving rules:** 사용자가 어떤 경고를 무시/수정하는지 학습
- [ ] **A/B testing:** 새 룰의 acceptance rate 측정
- [ ] **Pattern mining:** Top 10% 에이전트들의 공통 패턴 자동 추출

---

## 💡 핵심 통찰: 왜 AgentLinter가 작동하는가?

### 1. "Config as Code" 패러다임

**발견:** 에이전트 설정 파일은 코드다.
- CLAUDE.md = 에이전트의 "실행 로직"
- Vague instruction = 버그
- Secret exposure = 보안 취약점
- Contradiction = Race condition

→ **ESLint가 JavaScript에 하는 것을 AgentLinter가 AI 설정에 한다.**

### 2. "Attention Budget" 개념

**발견:** 지시가 많을수록 각 지시의 영향력 감소.

```
10개 지시 → 각 지시에 10% attention
100개 지시 → 각 지시에 1% attention
```

→ **적을수록 강력하다.** AgentLinter가 bloat를 강제로 줄이게 함.

### 3. "Working Memory Failure" 이해

**발견:** LLM은 500줄 후 초반 규칙 잊음 (Song et al. 2026)

**해법:**
- Context bloat detector → 300줄에서 경고
- Progressive disclosure → 우선순위로 구조화
- Quick Reference 섹션 → 한눈에 보는 요약

### 4. "Token Economy" 최적화

**발견:** Non-English content는 2.5배 토큰 사용 + 10-20% 정확도 하락

**철학:**
- 사용자 대화는 어떤 언어든 OK
- **설정 파일은 에이전트의 "두뇌 구조"** → 영어 권장

### 5. "Security by Default"

**발견:** 에이전트는 설득당하기 쉽다 (CircuitDreamer, Moltbook)

**해법:**
- Secret 노출 → Critical (즉시 차단)
- Skill trojan → Critical (수동 검토)
- Runtime config → Critical (네트워크 노출 방지)

→ **보안을 "나중에" 하면 이미 늦음. 처음부터 강제.**

### 6. "Community-Driven Evolution"

**발견:** 최고의 룰은 실전에서 나온다.

**사이클:**
```
Moltbook 포스트 발견 (eudaemon_0)
    ↓
4일 만에 Skill Security Scanner 구현
    ↓
v0.5.0 출시
    ↓
커뮤니티 피드백
    ↓
다음 룰 개선
```

→ **AgentLinter는 커뮤니티의 집단 지성을 코드로 변환하는 엔진.**

---

## 🎓 기여한 연구 & 출처

### 학술 논문
- **Song et al. (TMLR 2026):** "Large Language Model Reasoning Failures"
  - 6가지 실패 유형 → AgentLinter 룰 설계 기반

- **EleutherAI "The Pile" (2021):** LLM 학습 데이터 95% 영어
  - → `english-config-files` 룰 근거

- **mT5 (NAACL 2021):** 영어 pivot language로 5-15% 성능 향상
  - → Token efficiency 권장 근거

### 커뮤니티 & 오픈 소스
- **Moltbook:** eudaemon_0 (Skill 보안), XiaoZhuang (Memory), Delamain (TDD)
  - → 실전 문제 발견의 주요 출처

- **shanraisshan/claude-code-best-practice:** 150줄 제한, RPI 워크플로우
  - → v0.2.0 핵심 근거

- **golden-CLAUDE.md (Z-M-Huang):** Attention budget, Behavioral-first
  - → v0.7.0 instruction counter 설계

- **claudemd-architect (keskinonur):** LLM failure mitigation, ADR
  - → v0.7.0 advanced inspection 룰

- **Repomix (yamadashy):** MCP 통합, Multi-format
  - → MCP validator 설계 참고

### 공식 문서
- **Anthropic CLAUDE.md Best Practices:** "Be specific: 'Use 2-space indentation' > 'Format code properly'"
  - → Clarity 차원 설계 기반

- **Agent Skills 오픈 스탠다드:** SKILL.md frontmatter
  - → Skills linter 구현 근거

---

## 📊 통계로 보는 진화

| 지표 | v0.1.0 | v0.7.0 | 변화 |
|------|--------|--------|------|
| **Total Rules** | ~30개 | **70+개** | +133% |
| **Rule Categories** | 8개 | **13개** (subcategories) | +63% |
| **Supported Frameworks** | 3개 | **6개** | +100% |
| **Secret Patterns** | 10개 | **20+개** | +100% |
| **Auto-fix Coverage** | 30% | **60%** | +100% |
| **Academic References** | 0개 | **3개** | New |
| **Community Issues Addressed** | 0개 | **5+개** | New |
| **Release Cycle** | N/A | **3-5일** | Fast |

---

## 🙏 감사의 말

### 초기 피드백을 준 분들
- **Ki Young Ju:** "AI 에이전트한테 고쳐달라고 하세요" CTA 제안
- **eudaemon_0 (Moltbook):** Skill 보안 문제 제기 → v0.5.0 촉발
- **XiaoZhuang (Moltbook):** Memory 전략 고민 공유 → Memory 차원 강화

### 영감을 준 프로젝트들
- **Anthropic Claude Code:** CLAUDE.md 표준 확립
- **shanraisshan:** 150줄 제한 Best Practice
- **yamadashy/repomix:** MCP 통합 패턴
- **PatrickJS/awesome-cursorrules:** 템플릿 생태계

### 학술 연구자들
- **Song et al.:** LLM Reasoning Failures 연구 → AgentLinter 설계 기반
- **EleutherAI, Hugging Face, Google Research:** 언어별 토큰 효율 연구

---

## 🎯 결론: AgentLinter의 미션

> **"모든 AI 에이전트가 품질 기준선을 갖도록"**

### 해결한 문제
- ✅ 측정 불가능 → 측정 가능 (0-100 점수)
- ✅ 수동 리뷰 → 자동 검증 (초 단위)
- ✅ 모호한 기준 → 구체적 룰 (70+개)
- ✅ 사후 발견 → 사전 예방 (CI/CD 통합)
- ✅ 단절된 지식 → 집단 지성 (커뮤니티 피드백)

### 발전 방향
1. **더 똑똑하게:** 단순 패턴 매칭 → AI-powered 제안
2. **더 빠르게:** 사후 린팅 → 실시간 린팅 (VS Code)
3. **더 함께:** 단독 도구 → 커뮤니티 플랫폼
4. **더 스스로:** 정적 룰 → 자가 진화 룰

### 핵심 가치
- **Free & Open Source:** 영원히 무료, 코드 공개
- **Local-first:** 파일 내용 절대 서버 전송 안 함
- **Evidence-based:** 모든 룰은 연구 또는 실전 근거 있음
- **Community-driven:** 커뮤니티가 방향을 결정

---

**AgentLinter는 단순한 린터가 아닙니다.**

**에이전트 품질의 표준을 세우고,**  
**커뮤니티의 지혜를 모으며,**  
**AI 에이전트 생태계를 더 안전하고 효율적으로 만드는 운동입니다.**

```bash
npx agentlinter
```

**당신의 에이전트는 몇 점인가요?**

---

*Last updated: 2026-02-15*  
*Website: [agentlinter.vercel.app](https://agentlinter.vercel.app)*  
*GitHub: [seojoonkim/agentlinter](https://github.com/seojoonkim/agentlinter)*  
*Twitter: [@simonkim_nft](https://twitter.com/simonkim_nft)*
