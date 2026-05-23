---
name: frontend-pr-review
description: Review changed frontend files in React, Next.js, Vue, Nuxt, TypeScript, CSS, or UI code. Use for PR/diff review, component quality, accessibility, performance, and test impact.
---

# Frontend PR Review

## Goal

Produce actionable review for frontend changes with minimal noise.

## Checklist

- Component responsibility clear
- Props/types safe
- Existing patterns reused
- Semantic HTML preferred
- Keyboard/focus behavior acceptable
- ARIA only when needed
- Loading/error/empty states handled
- Responsive behavior considered
- Avoid unnecessary renders/effects
- API/data boundary clean
- Test impact identified

## Severity

- Critical: bug, data loss, security, broken UX, inaccessible path
- Important: maintainability, edge case, performance, flaky test risk
- Nice: polish, naming, small simplification

## Output

1. Summary
2. Findings by severity
3. Suggested minimal fixes
4. Tests/checks to run

## Rules

- Prefer concrete findings over generic advice.
- Do not request broad rewrite unless necessary.
- If no issue, say so briefly.
