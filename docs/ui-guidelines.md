# UI Guidelines – ToDo App

## Purpose
This document defines the UI guidelines for the ToDo application to ensure a consistent and user-friendly interface.

## Visual Style
- Design direction: **minimalist, warm, futuristic, and modern**.
- Prefer clean surfaces, reduced visual noise, and generous whitespace.
- Use a warm neutral base palette (for backgrounds and surfaces) with one modern accent color for interactive focus.
- Keep contrast high enough for readability while avoiding harsh, pure-black-heavy layouts.
- Use a modern sans-serif font stack (clean geometric appearance) and consistent typography scale.
- Keep spacing, typography, and component sizing consistent across all screens.
- Use subtle depth (light borders, soft elevation) instead of heavy shadows or decorative effects.

## Tables and Date Format
- Table content must be left-aligned.
- Dates must be displayed in European format (for example `DD.MM.YYYY`).

## Layout
- Provide a clear top-level navigation for task overviews.
- Include separate views/tabs for:
  - Create task
  - Active tasks
  - Done tasks
- Keep the task overview readable and scannable with clear hierarchy and calm spacing.

## Task Overview UI
- Display key task information in the list:
  - Title
  - Creation date (at least day)
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
- Sorting controls should be displayed as arrows on each sortable dimension.
- Sorting dimensions should include:
  - Title
  - Creation date
  - Due date
- Clicking an arrow toggles sorting direction between ascending and descending.
- If enabled, search/filter controls should be easy to discover and use.

## States and Feedback
- Show empty-state messages for both Active and Done views.
- Show success/error feedback for key actions (create, update, status change, delete).
- Ensure loading and disabled states are visually clear.
- Keep transitions subtle and fast; avoid distracting animations.

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
- Use one consistent, slightly rounded border radius across UI elements (for example inputs, cards, buttons).
- Keep icon style and size consistent in all views.
- Define one standard for button hierarchy (Primary, Secondary, Tertiary) and use it consistently.
- Keep form labels above fields and align form actions in the same position on all forms.
- Limit line length in text-heavy areas for readability (avoid very wide text blocks).
- Keep component chrome minimal: avoid heavy outlines, gradients, and ornamental visuals.
- Use clear focus states and subtle hover/pressed states for a polished, modern interaction feel.
