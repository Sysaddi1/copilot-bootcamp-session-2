# Functional Requirements – ToDo App

## Scope
This document defines the functional requirements for the ToDo application.

## Functional Requirements

- **FR-001: Task data model**
  - Each task must include the following editable fields:
    - title
    - description
    - due date
    - notes

- **FR-002: Create task (single at a time)**
  - The user can create exactly one task per create action.
  - Task creation is available in a dedicated `Create` tab/page.

- **FR-003: Default task state**
  - Every newly created task must have the default status `active`.

- **FR-004: Add or update due date**
  - The user can set or change a due date when creating or updating a task.

- **FR-005: Overview navigation structure**
  - The application provides dedicated top-level tabs/pages for:
    - `Create`
    - `Active`
    - `Done`

- **FR-006: Active tasks overview**
  - The application provides an overview tab/page listing all tasks with status `active`.

- **FR-007: Open task from overview**
  - The user can click a task in the overview and open it for editing.

- **FR-008: Edit task data**
  - The user can edit task title, description, due date, and notes.

- **FR-009: Status change in overview**
  - The user can change a task status from `active` to `done` directly in the overview area.

- **FR-010: Done tasks overview**
  - The application provides an additional overview tab/page listing all tasks with status `done`.

- **FR-011: Task sorting with directional toggle**
  - The task list supports sorting by:
    - title (alphabetical)
    - creation date
    - due date
  - Sorting controls are shown as arrows for each sortable dimension.
  - Clicking a sorting arrow toggles the respective dimension between ascending and descending order.

- **FR-012: Creation date visibility in overviews**
  - Every task overview must display the task creation date.
  - At minimum, the displayed creation date includes the day value.

## Additional Obvious but Missing Features

The following features are not part of the original list but are typically required for a usable ToDo app:

- **AF-001: Input validation**
  - A task title is required.
  - The app prevents saving a task with an empty title.

- **AF-002: Data persistence**
  - Tasks remain available after page reload (for example via backend storage or browser storage).

- **AF-003: Mark done back to active**
  - The user can change status from `done` back to `active`.

- **AF-004: Task priority**
  - The user can assign a priority to each task (for example: `low`, `medium`, `high`).

- **AF-005: Search and filter**
  - The user can search tasks by task title.
  - The user can filter tasks by status, due date, and priority.

- **AF-006: Bulk actions**
  - The user can select multiple tasks and apply bulk actions:
    - set status to `done`
    - set status to `active`
    - delete

- **AF-007: Archive completed tasks**
  - Completed tasks can be archived instead of being permanently deleted.
  - Archived tasks remain accessible for later lookup.

- **AF-008: Delete task**
  - The user can delete a task from task details and/or overview.

- **AF-009: Empty states**
  - The app shows clear empty-state messages when no `active` or no `done` tasks exist.

- **AF-010: Recurring tasks**
  - The user can configure recurring tasks for routines (for example: daily, weekly, monthly).

- **AF-011: Due date reminders**
  - The app supports reminders/notifications before the task due date.

## Notes
- Sorting options must be consistently available where task overviews are displayed.
- Status values used in this document are: `active` and `done`.
- UI design and style rules are documented in `docs/ui-guidelines.md`.
