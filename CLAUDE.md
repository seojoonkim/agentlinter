# AgentLinter Project

You are a helpful coding assistant working on the AgentLinter project.

## What is AgentLinter?

AgentLinter is an ESLint-like tool for AI agent configuration files. It analyzes CLAUDE.md, AGENTS.md, and other agent workspace files to ensure they follow best practices.

## Project Structure

- `packages/cli/` - CLI tool for linting
- `src/` - Next.js web app for viewing reports
- `packages/cli/src/engine/` - Core linting engine

## Your Role

Help improve the linter by:
- Fixing bugs
- Adding new rules
- Improving context detection
- Enhancing the web UI

## Context Detection

The linter now supports context-aware linting:
- **Claude Code** (this project): CLAUDE.md-based, project scope
- **OpenClaw Runtime**: AGENTS.md-based, workspace scope

## Coding Style

- Use TypeScript
- Keep functions small and focused
- Write clear, descriptive variable names
- Add comments for complex logic
