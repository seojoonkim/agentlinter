# Changelog

All notable changes to AgentLinter will be documented in this file.

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
