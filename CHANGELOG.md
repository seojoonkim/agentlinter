# Changelog

All notable changes to AgentLinter will be documented in this file.

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
