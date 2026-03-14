# AgentLinter Report Page Redesign Plan

> **Target:** `src/app/r/[id]/ReportClient.tsx` (현재 1321줄, 단일 스크롤)
> **Goal:** 탭 기반 구조, 에디토리얼 타이포그래피, CTA 강화, 가독성 개선

---

## 1. 탭 구조 설계 (5개 탭)

### Tab 1: `Overview` (기본 탭)
> 랜딩 임팩트 — 점수, 등급, 요약 통계, CTA

**구성:**
- **Hero Score Section** — 점수(120px), 등급 뱃지(40px), tier label
- **Quick Stats Bar** — 3칸: criticals | warnings | passed rules (큰 숫자 + 라벨)
- **Category Radar/Bar Chart** — 카테고리별 점수 bar (현재보다 2배 크게, 각 bar 클릭 시 해당 탭 이동)
- **Token Efficiency Card** — 토큰 효율 요약 (있을 때만)
- **Primary CTA: "Fix with AI"** — 풀 width, 64px 높이
- **Secondary CTA: "Share on X"** — 풀 width, outline 스타일
- **Score Distribution Histogram** — 내 위치 표시

### Tab 2: `Diagnostics`
> 모든 이슈 — 필터 + 정렬 기능

**구성:**
- **필터 바** — severity별 토글 (critical / warning / info), 카테고리 드롭다운
- **이슈 카드 리스트** — 현재보다 패딩 2배, severity 아이콘 크게
- **각 카드:** file:line | rule ID | severity badge | message | fix suggestion
- **빈 상태:** "Zero issues — All clear 🎉" 대형 텍스트

### Tab 3: `Categories`
> 카테고리별 딥다이브 — 아코디언 구조

**구성:**
- **카테고리 카드 목록** — 각 카테고리가 하나의 큰 카드
  - 카테고리명(28px) + 점수(48px) + 등급 뱃지 + weight
  - "Why This Matters" 블록
  - Rules Checklist (✅/❌)
  - Flagged Issues (교육 컨텍스트 포함)
- 현재 `Category Deep-Dives` 섹션과 동일하나 더 넓은 레이아웃

### Tab 4: `Methodology`
> 채점 방식 + 파일 목록

**구성:**
- **Scoring Formula** — base score, deductions, bonuses
- **Category Weights** — 시각적 가중치 차트
- **Grade Scale** — 현재 12단계 그리드 (더 크게)
- **Files Scanned** — 파일 목록 + 이슈 카운트
- **Privacy Note**

### Tab 5: `History` (데이터 있을 때만)
> 점수 변화 추적

**구성:**
- **Score Trend Chart** — 날짜별 점수 변화 라인 차트
- **Past Reports** — 링크 리스트
- 데이터 없으면 탭 자체를 숨김 (`data.history?.length > 0`)

---

## 2. Overall(Overview) 탭 와이어프레임

```
┌─────────────────────────────────────────────────────┐
│ NAV: Logo + "Report" + [Share] [GitHub]             │ ← sticky top-0
├─────────────────────────────────────────────────────┤
│ [Overview] [Diagnostics] [Categories] [Methodology] │ ← sticky top-56px
├─────────────────────────────────────────────────────┤
│                                                     │
│            🏆                                       │
│           92                                        │ ← 120px, font-bold
│         A- tier                                     │ ← 40px badge
│       "Great"                                       │ ← 20px, tier color
│                                                     │
│  ┌──────────┬──────────┬──────────┐                │
│  │  0       │  3       │  42      │                │ ← 48px numbers
│  │ criticals│ warnings │ passed   │                │ ← 14px labels
│  └──────────┴──────────┴──────────┘                │
│                                                     │
│  ── Category Scores ──────────────────              │
│                                                     │
│  Clarity          ████████████░░  85  B+  ×25%     │ ← 각 row 48px 높이
│  Structure        ██████████████  95  A   ×20%     │
│  Security         ████████████░░  88  B+  ×20%     │
│  Completeness     ██████████░░░░  78  B-  ×20%     │
│  Memory           ████████░░░░░░  70  C+  ×10%     │
│  ...                                                │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  ⚡ Fix issues with your AI agent           │   │ ← Primary CTA
│  │  Copy this report link → paste to Claude    │   │   h-16, accent bg
│  │                         [Copy Link]         │   │   full-width
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  𝕏  Share your score on X                   │   │ ← Secondary CTA
│  │                         [Post on X]         │   │   h-14, outline
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ── Score Distribution ───────────────────          │
│  [histogram with "You are here" marker]             │
│  Median: 64 | You: 92 | Top 1%: 98+               │
│                                                     │
│  🔒 Results only — files never uploaded             │
│                                                     │
│  ── Footer ───────────────────────────              │
│  AgentLinter v0.1.0          Mar 14, 2026           │
└─────────────────────────────────────────────────────┘
```

---

## 3. 타이포그래피 토큰

| 용도 | 현재 | 변경 | CSS class 제안 |
|------|------|------|----------------|
| **Total Score (숫자)** | `text-[64px] sm:text-[88px]` | `text-[96px] sm:text-[128px]` | `.score-hero` |
| **Grade Badge** | `text-[18px] sm:text-[20px]` | `text-[32px] sm:text-[40px]` | `.grade-badge` |
| **Tier Label** | `text-[13px]` | `text-[18px] sm:text-[20px]` | `.tier-label` |
| **Quick Stats 숫자** | N/A (현재 뱃지 내) | `text-[40px] sm:text-[48px]` | `.stat-number` |
| **Quick Stats 라벨** | N/A | `text-[13px] sm:text-[14px]` | `.stat-label` |
| **카테고리명** | `text-[13px]` (bar 옆) | `text-[16px] sm:text-[18px] font-semibold` | `.cat-name` |
| **카테고리 점수** | `text-[13px] mono` | `text-[24px] sm:text-[28px] mono font-bold` | `.cat-score` |
| **섹션 헤딩 (H2)** | `text-[24px] sm:text-[28px]` | `text-[28px] sm:text-[36px]` | `.section-heading` |
| **카드 헤딩 (H3)** | `text-[15px]` | `text-[18px] sm:text-[20px]` | `.card-heading` |
| **본문 텍스트** | `text-[13px]` | `text-[14px] sm:text-[15px]` leading-relaxed | `.body-text` |
| **코드/mono** | `text-[12px] mono` | `text-[13px] mono` | `.code-text` |
| **탭 텍스트** | N/A | `text-[14px] sm:text-[15px] font-medium` | `.tab-label` |

**Line Height 가이드:**
- Hero 요소: `leading-none` (1.0)
- 헤딩: `leading-tight` (1.25)
- 본문: `leading-relaxed` (1.625)
- 리스트 아이템: `leading-normal` (1.5)

**Spacing 가이드 (현재 → 변경):**
- 카드 패딩: `p-4 sm:p-6` → `p-6 sm:p-8`
- 섹션 간격: `space-y-6` → `space-y-8 sm:space-y-10`
- 리스트 아이템 간격: `py-1.5` → `py-3`
- 아이콘 크기 (severity): `w-3.5 h-3.5` → `w-4 h-4`

---

## 4. CTA 배치 전략

### Primary CTA: "Fix with AI"
- **위치:** Overview 탭 — 카테고리 bars 바로 아래
- **크기:** `w-full h-16` (full-width, 64px 높이)
- **스타일:** `bg-[var(--accent)]` solid, rounded-xl, hover:scale-[1.01]
- **아이콘:** Sparkles (왼쪽) + Copy (오른쪽 버튼 안)
- **텍스트:** 제목 `text-[16px] font-semibold` + 부제 `text-[13px] opacity-70`
- **조건:** diagnostics > 0일 때만 표시

### Secondary CTA: "Share on X"
- **위치:** Overview 탭 — Fix CTA 바로 아래
- **크기:** `w-full h-14`
- **스타일:** outline (`border border-[#1d9bf0]/40`), rounded-xl
- **아이콘:** X 로고 (왼쪽)
- **텍스트:** `text-[15px] font-medium`

### Nav Share Button (항상 보임)
- **위치:** Nav 우측 — 모든 탭에서 접근 가능
- **크기:** `px-3 py-1.5` (현재와 동일)
- **스타일:** tier color 배경

### Bottom Repeat CTA
- **위치:** 각 탭 하단 — 간결한 1줄 CTA 반복
- **스타일:** 카드형, 텍스트 + 버튼

### Diagnostics 탭 CTA
- **위치:** 이슈 목록 상단에 "Fix all with AI" 배너
- **트리거:** criticals > 0이면 강조

---

## 5. Sticky 탭바 구조

```tsx
// 구조
<nav> ← sticky top-0, z-50, h-14 (기존 nav)
<div> ← sticky top-[56px], z-40 (탭바)
  <div className="max-w-[720px] mx-auto px-4 sm:px-6">
    <div className="flex gap-1 border-b border-[var(--border)]">
      {tabs.map(tab => (
        <button
          className={`
            px-4 py-3
            text-[14px] sm:text-[15px] font-medium
            transition-colors
            ${active === tab.id
              ? 'text-white border-b-2 border-[var(--accent)]'
              : 'text-[var(--text-dim)] hover:text-[var(--text-secondary)]'
            }
          `}
        >
          {tab.icon} {tab.label}
          {tab.badge && <span className="ml-1.5 badge">{tab.badge}</span>}
        </button>
      ))}
    </div>
  </div>
</div>
```

**탭바 스펙:**
- 배경: `bg-[var(--bg)]/80 backdrop-blur-xl`
- 높이: `h-12` (48px)
- 위치: `sticky top-[56px]` (nav 14*4=56px 아래)
- 활성 탭: 하단 2px 보더 `border-[var(--accent)]` + `text-white`
- 비활성 탭: `text-[var(--text-dim)]`
- 뱃지: Diagnostics 탭에 이슈 개수 표시 (빨간 dot 또는 숫자)
- History 탭: `data.history?.length > 0`일 때만 렌더

**탭 정의:**
```tsx
const tabs = [
  { id: 'overview', label: 'Overview', icon: <Target />, badge: null },
  { id: 'diagnostics', label: 'Diagnostics', icon: <AlertCircle />, badge: data.diagnostics.length || null },
  { id: 'categories', label: 'Categories', icon: <BookOpen />, badge: null },
  { id: 'methodology', label: 'How It Works', icon: <Zap />, badge: null },
  // conditionally:
  ...(data.history?.length ? [{ id: 'history', label: 'History', icon: <Clock />, badge: null }] : []),
];
```

---

## 6. 컴포넌트 분리 계획

현재 1321줄 단일 파일 → 분리:

```
src/app/r/[id]/
├── ReportClient.tsx          ← 메인 (탭 라우터 + 공유 state), ~200줄
├── components/
│   ├── ReportNav.tsx          ← nav bar (~50줄)
│   ├── TabBar.tsx             ← sticky 탭바 (~60줄)
│   ├── OverviewTab.tsx        ← Overview 탭 내용 (~300줄)
│   ├── DiagnosticsTab.tsx     ← Diagnostics 탭 (~200줄)
│   ├── CategoriesTab.tsx      ← Categories 딥다이브 (~300줄)
│   ├── MethodologyTab.tsx     ← 채점 방식 + 파일 목록 (~200줄)
│   ├── HistoryTab.tsx         ← 히스토리 (optional, ~100줄)
│   ├── ScoreHero.tsx          ← 점수 히어로 섹션 (~80줄)
│   ├── CategoryBar.tsx        ← 카테고리 bar 컴포넌트 (~40줄)
│   ├── CTABlock.tsx           ← Fix/Share CTA 블록 (~60줄)
│   ├── Histogram.tsx          ← 히스토그램 (기존 이동)
│   ├── Collapsible.tsx        ← 접기/펼치기 (기존 이동)
│   └── CodeBlock.tsx          ← 코드 블록 (기존 이동)
├── constants/
│   ├── category-meta.ts       ← CATEGORY_META 객체
│   ├── rule-education.ts      ← RULE_EDUCATION 객체
│   └── scoring.ts             ← SCORING_METHODOLOGY
├── utils/
│   ├── getTier.ts             ← getTier 함수
│   └── share.ts               ← share text 생성
└── types.ts                   ← ReportData 등 타입
```

---

## 7. Codex 구현 지시서

### Phase 1: 파일 분리 + 타입 추출
```
1. src/app/r/[id]/types.ts 생성 — ReportData 인터페이스 이동
2. src/app/r/[id]/utils/getTier.ts 생성 — getTier 함수 이동
3. src/app/r/[id]/utils/share.ts 생성 — shareText 생성 로직
4. src/app/r/[id]/constants/category-meta.ts — CATEGORY_META 이동
5. src/app/r/[id]/constants/rule-education.ts — RULE_EDUCATION 이동
6. src/app/r/[id]/constants/scoring.ts — SCORING_METHODOLOGY 이동
7. src/app/r/[id]/components/Collapsible.tsx — 기존 Collapsible 이동
8. src/app/r/[id]/components/CodeBlock.tsx — 기존 CodeBlock 이동
9. src/app/r/[id]/components/Histogram.tsx — 기존 Histogram 이동
```

### Phase 2: 탭 구조 + Sticky TabBar
```
1. ReportClient.tsx에 useState<string>('overview') 추가
2. TabBar.tsx 생성:
   - sticky top-[56px] z-40 bg-[var(--bg)]/80 backdrop-blur-xl
   - 5개 탭 버튼 (Overview, Diagnostics, Categories, How It Works, History)
   - active tab: border-b-2 border-[var(--accent)] text-white
   - Diagnostics 탭에 이슈 카운트 뱃지
   - History 탭은 data.history?.length > 0일 때만
3. 각 탭 콘텐츠를 조건부 렌더링
```

### Phase 3: Overview 탭 (최중요)
```
OverviewTab.tsx:
1. ScoreHero — 점수 text-[96px] sm:text-[128px], grade badge text-[32px] sm:text-[40px]
2. Quick Stats — 3-column grid, 숫자 text-[40px] sm:text-[48px]
3. Category Bars — 각 row h-12, 카테고리명 text-[16px], 점수 text-[24px]
   - 각 bar 클릭 시 Categories 탭으로 이동 (cursor-pointer)
4. Token Efficiency Card (조건부)
5. Primary CTA "Fix with AI" — w-full, h-16, bg-[var(--accent)], rounded-xl
   - 왼쪽: Sparkles icon + "Fix issues with your AI agent" + 부제
   - 오른쪽: "Copy Link" 버튼
6. Secondary CTA "Share on X" — w-full, h-14, outline border-[#1d9bf0]/40
7. Histogram + Score Distribution
8. Privacy Note
```

### Phase 4: Diagnostics 탭
```
DiagnosticsTab.tsx:
1. 상단 필터 바:
   - Severity 토글 버튼 3개 (critical/warning/info) — 토글 on/off
   - 활성 필터에 severity별 색상 bg
2. 이슈 카드 리스트:
   - 각 카드 padding p-5, severity 아이콘 w-5 h-5
   - message text-[14px] (현재 13px)
   - fix suggestion은 green 배경 블록
   - educational context (RULE_EDUCATION) 접기 가능
3. 상단에 Fix CTA 배너 (criticals > 0)
4. 빈 상태: "All clear" 대형 텍스트 + CheckCircle2 w-12 h-12
```

### Phase 5: Categories / Methodology / History 탭
```
CategoriesTab.tsx:
- 기존 Category Deep-Dives 섹션 이동
- 카테고리명 text-[24px] sm:text-[28px]
- 점수 text-[40px] sm:text-[48px]
- 아코디언 기본 열림: score < 100인 카테고리만

MethodologyTab.tsx:
- Grade Scale (현재 것 + 더 크게)
- Scoring Formula, Deductions, Bonuses
- Files Scanned 목록
- Next Steps 섹션

HistoryTab.tsx (optional):
- data.history 배열로 간단한 리스트 + 점수 변화
```

### Phase 6: 반응형 + 최종 조정
```
1. 모바일(< 640px):
   - 탭바 수평 스크롤 (overflow-x-auto, scrollbar 숨김)
   - Score Hero 점수 text-[80px] (128px 대신)
   - CTA 세로 스택
2. max-w-[720px] → max-w-[760px] (약간 넓히기)
3. 전체 font-size 하한: 12px → 13px (10px 텍스트 제거)
4. 카드 간격: space-y-6 → space-y-8
```

---

## 8. 디자인 원칙 요약

| 원칙 | 구현 |
|------|------|
| **임팩트 퍼스트** | 점수 128px, 등급 40px — 페이지 열자마자 "몇 점인지" 즉시 인지 |
| **정보 계층** | Hero → Stats → Categories → CTA → Distribution 순서 |
| **탭으로 인지 부하 감소** | 1300줄 스크롤 → 5개 탭 각 200-300줄 |
| **CTA 가시성** | 풀 width + 높이 64px + 강한 색상 = 절대 묻히지 않음 |
| **여백 = 가독성** | 패딩 2배, 줄 간격 확대, 최소 13px |
| **점진적 공개** | Overview에서 요약 → 탭 이동으로 상세 |

---

## 9. 구현 우선순위

1. ⭐ Phase 1 (파일 분리) — 30분
2. ⭐ Phase 2 (탭 구조 + TabBar) — 30분
3. ⭐ Phase 3 (Overview 탭) — 45분
4. Phase 4 (Diagnostics 탭) — 30분
5. Phase 5 (Categories/Methodology) — 30분
6. Phase 6 (반응형 + 최종) — 20분

**총 예상 시간:** ~3시간
