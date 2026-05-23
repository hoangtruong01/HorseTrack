---
name: frontend-quality
description: Improve UI consistency, accessibility, responsive behavior, maintainability, and readable frontend implementation. Use for React/Next/Vue/Nuxt UI quality checks.
---

# Frontend Quality

## Goal

Keep frontend code maintainable, accessible, consistent, and user-safe.

## Quality Bar

- Reuse existing design system/components/tokens
- Keep component API small
- Separate UI, state, data fetching, and formatting when repo patterns support it
- Prefer readable code over clever abstractions
- Ensure loading/error/empty states
- Check mobile/responsive layout
- Avoid hardcoded config/text if repo has i18n/config patterns
- Avoid dependency additions unless justified

## React/Vue Guardrails

- Avoid derived state in effects/watchers when computed value is enough
- Avoid broad global state for local UI state
- Avoid premature memoization
- Keep side effects explicit and minimal

## Output

- Highest impact improvements first
- Minimal-diff implementation notes
- Verification checklist
