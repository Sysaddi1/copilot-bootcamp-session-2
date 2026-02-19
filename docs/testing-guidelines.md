# Testing Guidelines – ToDo App

## Purpose
This document defines the testing principles for the ToDo application to ensure quality, reliability, and maintainability.

## Core Principles

### Unit Test
- Verify small, isolated units of logic (for example: utility functions, reducers, validation rules).
- Keep tests fast and deterministic.
- Mock external dependencies when isolation is required.

### Integration Testing
- Verify interaction between multiple components/modules (for example: API routes with service logic, form with state handling).
- Focus on realistic collaboration between layers without requiring full end-to-end flows.
- Cover critical integration paths for task creation, update, and status changes.

### End-to-End Test
- Validate complete user journeys across frontend and backend.
- Test key flows from a user perspective, including:
  - Create a task
  - Edit a task
  - Change task status (`active` ↔ `done`)
  - Verify sorting and overview behavior
- Run E2E tests in an environment that is as close as possible to production behavior.

### Blackbox Testing
- Test based on expected behavior and requirements without relying on internal implementation details.
- Derive scenarios from functional requirements and user-visible outcomes.
- Prioritize business-critical paths and acceptance criteria.

### Whitebox Testing
- Test internal logic, branches, and error handling with implementation awareness.
- Ensure meaningful coverage of conditionals, edge cases, and failure scenarios.
- Use whitebox tests to protect complex or high-risk code paths.

## Mandatory Rules
- Every new feature must include tests before being considered complete.
- Feature delivery is only done when relevant unit, integration, and/or end-to-end tests are present.
- Bug fixes must include a regression test that prevents the issue from recurring.

## Maintainability of Tests
- Keep tests readable, focused, and independent.
- Prefer clear test names that describe behavior and expected outcomes.
- Avoid brittle tests that depend on unstable implementation details.
- Reuse shared setup/helpers where useful, but keep test intent explicit.
- Review and refactor tests regularly to keep them aligned with evolving features.

## Test Suite Quality Criteria
- Tests should be deterministic (no flaky behavior).
- Tests should be fast enough for regular local and CI execution.
- Failures should provide actionable feedback.
- Test coverage should prioritize risk and business value over raw percentage targets.
