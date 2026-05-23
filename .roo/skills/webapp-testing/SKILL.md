---
name: webapp-testing
description: Plan and run practical web app checks: lint, typecheck, targeted unit/integration tests, Playwright/Vitest/Jest when available, and smoke testing.
---

# Web App Testing

## Goal

Verify changes with the smallest useful test/check set.

## Process

1. Inspect available scripts and test tools.
2. Prefer safe checks:
   - lint
   - typecheck
   - targeted tests
   - affected Playwright/smoke flow
3. Avoid generating massive tests by default.
4. Add tests only for meaningful behavior or regression risk.
5. Report exact command/results when run.

## Test Priorities

- Changed behavior
- Edge cases
- Error/loading/empty states
- Accessibility-critical flows
- API integration boundaries

## Rules

- Do not invent unavailable tools.
- Do not run destructive commands.
- Ask/confirm before long-running broad suites when costly.
