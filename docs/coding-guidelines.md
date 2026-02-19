# Coding Guidelines – ToDo App

## Purpose
These coding guidelines define how we write, review, and maintain code in this project. The goal is consistent style, high readability, and reliable quality across frontend and backend.

## Narrative Summary
This project values clarity over cleverness. Code should be easy to understand for the next developer, easy to test, and safe to change. We prefer small, focused functions and components, explicit naming, and predictable structure. Every change should improve or preserve maintainability. If a solution is hard to read, hard to test, or easy to break, it should be refactored before merging.

## Core Style Principles

### Formatting and Readability
- Follow one consistent formatter/linter setup for the whole repository.
- Keep line length and indentation consistent with the project tooling.
- Use meaningful names for variables, functions, components, and files.
- Prefer explicit, simple control flow over nested or overly compact logic.
- Avoid dead code and commented-out blocks in committed changes.

### Commenting Guidelines
- Write code that is self-explanatory first; comments should add context, not restate obvious code.
- Use comments to explain intent, business rules, edge cases, and non-obvious decisions.
- Keep comments up to date when code changes.
- Remove outdated or misleading comments immediately.

### DRY and Reuse
- Apply DRY (Don’t Repeat Yourself): extract shared logic instead of duplicating it.
- Reuse existing utilities/components before creating new abstractions.
- Do not over-abstract early; extract when repetition becomes clear and meaningful.

### Import Organization
- Group imports in a consistent order (standard library, third-party, internal modules).
- Keep import lists clean and remove unused imports.
- Prefer explicit module boundaries to avoid circular dependencies.

### Linter and Static Quality Gates
- Run lint checks locally before committing.
- Treat linter warnings as actionable quality signals, not noise.
- Use autofix where available, but review changes before committing.
- Keep CI linting green; no merge with unresolved lint errors.

## Additional Best Practices

### Modularity and Single Responsibility
- Functions and components should have one clear responsibility.
- Prefer smaller units that are easy to test and reason about.
- Split large files when they become difficult to navigate.

### Error Handling
- Handle expected failures explicitly (validation errors, network issues, missing data).
- Return helpful error messages and avoid silent failures.
- Do not swallow exceptions without a clear reason.

### Testing Alignment
- New or changed behavior must be covered by tests.
- Keep tests readable and focused on behavior.
- Add regression tests for bug fixes.
- Follow the testing principles in `docs/testing-guidelines.md`.

### API and Data Consistency
- Keep request/response shapes consistent and documented.
- Validate inputs at boundaries (API handlers, form submission, parsing logic).
- Avoid hidden side effects in shared state logic.

### Dependency Hygiene
- Prefer well-maintained dependencies with clear community support.
- Add dependencies only when they provide clear value.
- Keep dependency surface minimal to reduce risk and maintenance overhead.

### Code Review Quality
- Every pull request should be small enough to review effectively.
- Review for readability, correctness, edge cases, and maintainability.
- Prefer constructive, specific review feedback with suggested improvements.

## Definition of Done (Coding Quality)
A change is ready when:
- code is readable and follows project style,
- linting passes without unresolved issues,
- tests relevant to the change are in place and passing,
- comments and docs are updated where needed,
- no obvious duplication or avoidable complexity was introduced.
