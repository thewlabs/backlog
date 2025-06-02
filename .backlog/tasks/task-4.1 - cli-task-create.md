---
id: task-4.1
title: "CLI: Task Creation Commands"
status: "To Do"
assignee: ""
reporter: "@MrLesk"
created_date: 2025-06-04
labels: ["cli", "command"]
milestone: "M1 - CLI"
dependencies: ["task-3"]
---

## Description

Implement commands for creating tasks, drafts, and subtasks:

- `backlog task create` to add active tasks.
- `backlog draft create` to create tasks in draft mode.
- `backlog task create --parent <task-id>` to create a subtask under an existing task.

## Acceptance Criteria

- [ ] Commands create Markdown files in the correct directories.
- [ ] Required metadata is captured from flags or prompts.
- [ ] Subtasks are saved using decimal IDs under `.backlog/tasks/`.
- [ ] Changes are committed with a descriptive message.
