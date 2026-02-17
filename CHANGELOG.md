# Changelog

All notable changes to AgentLinter will be documented in this file.

## [0.8.0] - 2026-02-17

### 🔬 Claude Code 최신 스펙 반영 + 신규 린팅 룰 7개

이번 릴리스는 Claude Code 공식 최신 스펙(2026-02-17) 및 Repomix 연계 힌트를 반영합니다.

### Added - 신규 린팅 룰 (7개)

#### Security (보안)
- **`security/no-bypass-permissions`** ⛔ CRITICAL
  - `allowedTools`에 Bash 무제한 허용 패턴 및 `bypassPermissions` 모드 탐지
  - 무제한 셸 실행 권한 부여 경고

- **`security/critical-rules-enforce-hooks`** ⚠️ WARNING (HIGH)
  - CLAUDE.md/AGENTS.md의 MUST NOT / NEVER 규칙이 Hooks로 강제되는지 확인
  - "CLAUDE.md는 확률적, Hooks는 결정적" 패러다임 반영

#### Skill Safety (스킬 안전성)
- **`skill-safety/skill-description-required`** ⚠️ WARNING (HIGH)
  - Skills SKILL.md frontmatter에 `description` 필수 확인
  - Claude 자동 invocation 결정 기준 필드 검증

- **`skill-safety/sideeffect-skill-manual`** ⚠️ WARNING (MEDIUM)
  - deploy/commit/publish/delete 포함 skill에 `disable-model-invocation: true` 권장
  - 사이드이펙트 있는 스킬의 자동 실행 방지

- **`skill-safety/skill-line-limit`** ℹ️ WARNING/INFO (MEDIUM)
  - SKILL.md 500줄 초과 경고, 300줄에서 사전 경고
  - Claude Code 공식 권장 기준

#### Claude Code Spec (최신 스펙)
- **`claude-code/agent-description-required`** 🔴 ERROR (HIGH)
  - `.claude/agents/*.md` frontmatter에 `description` 및 `name` 필수
  - 위임 결정 핵심 필드 검증

- **`claude-code/validate-plugin-manifest`** ⚠️ WARNING (MEDIUM)
  - `.claude-plugin/plugin.json` 필수 필드(name, version) 및 semver 형식 검증
  - Plugin Marketplace 배포를 위한 스펙 준수

### Added - Claude Code 최신 스펙 반영

- **`claude-code/auto-memory-line-limit`**: Auto Memory MEMORY.md 200줄 초과 경고
  - Claude Code는 첫 200줄만 자동 로드 — 초과 내용은 topic files로 분리 권장

- **`claude-code/import-depth-limit`**: `@import` 구문 5단계 재귀 제한 체크
  - 5단계 초과 시 silent fail 가능성 경고

- **`claude-code/validate-rules-path`**: `.claude/rules/` path-specific 룰 검증
  - paths frontmatter glob 패턴 유효성 및 누락 여부 확인

- **`claude-code/memory-hierarchy-awareness`**: Memory 계층 6단계 지원
  - Managed → Project → Rules → User → Local → Auto Memory 구조 반영
  - `CLAUDE.local.md` gitignore 체크, `.claude/rules/` 모듈화 권장

### Added - Repomix 연계 힌트

- **`claude-code/repomix-skill-hint`**: Repomix로 생성된 skill 감지 시 검증 힌트 제공
  - `references/` 구조 또는 Repomix 시그니처 패턴 탐지
  - AgentLinter 검증 워크플로우 가이드

---

## [0.7.0] - 2026-02-14

### 🚀 Major Feature Release - Comprehensive Best Practices Integration

This release adds **25+ new linting rules** based on extensive Claude Code research and agent workspace best practices.

### Added - Best Practices Rules

**A. Advanced Inspection:**

- **`best-practices/instruction-counter`**: Count imperative instructions with smart severity:
  - ⚠️ **Warning** at 100+ instructions
  - 🔴 **Error** at 150+ instructions
  - Prevents instruction dilution and cognitive overload

- **`best-practices/context-bloat-detector`**: Multi-level bloat detection:
  - Line count analysis (300+ lines = error)
  - Repetition detection (same instruction 3+ times)
  - Suggests aggressive splitting for bloated files

- **`best-practices/progressive-disclosure`**: Checks for priority grouping structure
  - Detects missing priority markers (Critical/Standard/Optional)
  - Triggers when 20+ instructions lack organization

- **`best-practices/anti-patterns`**: Comprehensive anti-pattern detection:
  - Code style rules in CLAUDE.md (should be in `.claude/rules/`)
  - Embedded credentials (even placeholders)
  - Ineffective "act as" roleplay instructions

**B. Auto-fix Suggestions:**

- **`autofix/extract-instructions`**: Smart section extraction recommender
  - Detects domain-specific sections (git, deploy, testing, security, etc.)
  - Suggests optimal target paths (`skills/`, `.claude/rules/`)
  - Triggers when sections exceed 15 lines

- **`autofix/convert-code-snippets`**: Reference optimization
  - Detects embedded code blocks >20 lines
  - Suggests extracting to files with line references
  - Reduces context bloat from large snippets

- **`autofix/structure-optimizer`**: WHY/WHAT/HOW framework checker
  - Validates sections have rationale/context
  - Suggests splitting instructions by intent
  - Improves agent comprehension

- **`autofix/consolidate-duplicates`**: Duplicate detection with Jaccard similarity
  - Finds similar instructions (>80% similarity)
  - Suggests consolidation to single canonical version

**C. Integration Validation:**

- **`integration/mcp-server-validator`**: Complete MCP config validation
  - JSON syntax checking
  - Schema validation (`mcpServers`, `command`, `url`)
  - Common issue detection (missing `-y` in npx, empty commands)

- **`integration/skills-linter`**: SKILL.md comprehensive checker
  - Required sections validation (What/When/How)
  - Security pattern detection (dangerous commands)
  - Hook file existence verification

- **`integration/hooks-checker`**: Executable hook safety
  - Shebang validation
  - Best practices checking (`set -e`, `set -u`)
  - Unsafe variable expansion detection

- **`integration/cross-file-references`**: Broken reference detector
  - Validates `@import`, `@include`, `@see`, `@ref` paths
  - Reports missing files

- **`integration/skill-workspace-sync`**: Documentation completeness
  - Checks if skills/ directories are documented in main file
  - Ensures discoverability

### Changed

- Updated rule registry to include new rule categories
- Enhanced type system to support auto-fix suggestions
- Improved diagnostic messages with actionable fixes

### Performance

- All new rules optimized for minimal performance impact
- Smart pattern matching reduces false positives
- Batch processing for cross-file validations

### Migration Guide

No breaking changes. New rules are automatically enabled.

To disable specific rules, add to your `.agentlinter.json`:
```json
{
  "rules": {
    "best-practices/instruction-counter": "off",
    "autofix/extract-instructions": "off"
  }
}
```

### References

- Claude Code Best Practices: https://github.com/shanraisshan/claude-code-best-practice
- Progressive Disclosure Pattern: LLM prompt engineering research
- MCP Protocol Spec: Model Context Protocol documentation

---

## [0.6.0] - 2026-02-11

### Added - English Config Files Rule

New rule `clarity/english-config-files` detects non-English content in core configuration files.

**Why this matters:**
- **Token efficiency**: Non-English text uses 2.5x more tokens than English
- **Interpretation accuracy**: LLMs are trained on 95% English data, leading to better performance with English instructions
- **Translation Tax**: Non-English inputs go through internal translation, losing fidelity

**Target files:**
- CLAUDE.md, AGENTS.md, SOUL.md, README.md, .cursorrules

**Severity:**
- 30%+ non-English content → `warning`
- Below 30% → `info`

**Research basis:**
- EleutherAI "The Pile" (2021): 95% of LLM training data is English
- Hugging Face benchmarks: Korean uses 2.4-3.8x more tokens
- MMLU benchmark: 10-20% accuracy gap between English and non-English prompts
- mT5 (NAACL 2021): English as optimal "pivot language" for 5-15% performance gains

---

## [0.2.0] - 2026-02-11

### Added - Claude Code Best Practice Rules

Based on [claude-code-best-practice](https://github.com/shanraisshan/claude-code-best-practice):

- **150-line limit warning**: CLAUDE.md/AGENTS.md files exceeding 150 lines now trigger a warning. Context bloat hurts agent performance.
- **500-line limit error**: Files over 500 lines are now flagged as errors requiring immediate splitting.
- **`.claude/rules/` folder recommendation**: Suggests using modular rule files for better organization.

### Changed

- `structure/file-size` rule now has tiered severity (warning at 150+, error at 500+)

### References

- [Claude Code Memory Docs](https://code.claude.com/docs/en/memory)
- [Modular Rules with .claude/rules/](https://code.claude.com/docs/en/memory#modular-rules-with-clauderules)

---

## [0.1.0] - 2026-02-05

### Initial Release

- Core linting engine with 8 rule categories
- Web interface at agentlinter.com
- CLI support via `npx agentlinter`
- GitHub integration for public repos
- Share functionality with unique report URLs
