# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `bun install` - Install dependencies 
- `bun test` - Run tests
- `bun run format` - Format code with Biome
- `bun run lint` - Lint and auto-fix with Biome  
- `bun run check` - Run all Biome checks (format + lint)

### Testing
- `bun test` - Run all tests
- `bun test <filename>` - Run specific test file

## Project Architecture

This is the **Backlog.md** project - a lightweight git + markdown project management tool for human-AI collaboration.

### Core Structure
- **CLI Tool**: Built with Bun and TypeScript as a global npm package (`@backlog.md`)
- **Task Management**: Uses markdown files in `.backlog/` directory structure
- **Workflow**: Git-integrated with task IDs referenced in commits and PRs

### Key Components
- **Task System**: Tasks stored as `task-<id> - <title>.md` files with decimal subtasks (e.g., `task-4.1`)
- **Configuration**: Uses `config.yml` for project settings
- **Status Workflow**: Draft → Active → Archive progression

### AI Agent Integration
- Reference task IDs in commit messages and PR titles when implementing features
- Use `.backlog/tasks/` markdown files to understand implementation requirements  
- Follow decimal numbering for subtasks
- Maintain clean git status before commits
- Use task-descriptive branch names: `<task-id> feature description`

### Code Standards
- **Runtime**: Bun with TypeScript 5
- **Formatting**: Biome with tab indentation and double quotes
- **Linting**: Biome recommended rules
- **Testing**: Bun's built-in test runner

Always run `bun run check` before committing to ensure code quality standards are met.