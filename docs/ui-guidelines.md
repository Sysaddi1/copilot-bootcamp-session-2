# UI Guidelines – ToDo App

## Purpose
This document defines the UI guidelines for the ToDo application to ensure a consistent and user-friendly interface.

## Visual Style
- Use a light blue background with a soft cloud theme.
- Use gray styling for all buttons.
- Use black text color as default for UI text.
- Use `Arial` as the default font family.
- Keep spacing, typography, and component sizes consistent across screens.

## Tables and Date Format
- Table content must be left-aligned.
- Dates must be displayed in European format (for example `DD.MM.YYYY`).

## Layout
- Provide a clear top-level navigation for task overviews.
- Include separate views/tabs for:
  - Active tasks
  - Done tasks
- Keep the task overview readable and scannable.

## Task Overview UI
- Display key task information in the list:
  - Title
  - Due date
  - Status
  - Priority (if enabled)
- Allow clicking a task row/card to open task details for editing.
- Support direct status change in the overview where applicable.

## Task Form UI
- Task form includes fields for:
  - Title (required)
  - Description
  - Due date
  - Notes
- Clearly indicate required fields and validation errors.
- Use clear primary/secondary actions (e.g., Save, Cancel).

## Sorting, Search, and Filter
- Provide consistent sorting controls on overview pages.
- Sorting options should include:
  - Alphabetical by title
  - Creation date
  - Due date
- If enabled, search/filter controls should be easy to discover and use.

## States and Feedback
- Show empty-state messages for both Active and Done views.
- Show success/error feedback for key actions (create, update, status change, delete).
- Ensure loading and disabled states are visually clear.

## Accessibility
- Ensure keyboard navigability for all interactive elements.
- Use sufficient contrast for text and controls.
- Provide meaningful labels for form controls and actions.

## Consistency Rules
- Reuse UI patterns for lists, forms, and action buttons.
- Keep wording of labels and status values consistent (`active`, `done`).
- Avoid introducing one-off component styles unless required.

## Additional Recommended Style Guidelines
- Use a consistent 8px spacing system for margins and paddings.
- Use one consistent border radius across UI elements (for example inputs, cards, buttons).
- Keep icon style and size consistent in all views.
- Define one standard for button hierarchy (Primary, Secondary, Tertiary) and use it consistently.
- Keep form labels above fields and align form actions in the same position on all forms.
- Limit line length in text-heavy areas for readability (avoid very wide text blocks).
