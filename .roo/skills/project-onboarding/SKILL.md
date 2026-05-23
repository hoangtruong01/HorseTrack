---
name: project-onboarding
description: >-
  Quickly understand an unfamiliar frontend-first repository. Use before
  implementation in a new or stale project to map stack, scripts, structure,
  conventions, risks, and next checks.
---

# Project Onboarding

## Goal

Build a compact working model of the repo before edits.

## Process

1. Read `README`, package manifests, lockfiles, config, routing/app structure, test setup.
2. Identify stack: framework, language, styling, state/data, test tools, build tools.
3. Find nearby patterns before proposing changes.
4. Summarize:
   - project purpose
   - main folders
   - key scripts
   - conventions
   - risk areas
   - recommended safe checks
5. Save only durable architecture/convention findings to memory when useful.

## Output

Use this schema:

1. Stack
   - Framework, language, package manager, build tool, runtime.
2. Entry points
   - Main app entry files, route roots, key config files.
3. Scripts with confidence
   - Install, dev, lint, typecheck, test, build, smoke/E2E.
   - Mark each as high/medium/low confidence based on evidence.
4. Routing map
   - App/page/router structure and important route conventions.
5. Data/API layer
   - API clients, server actions, query hooks, schemas, error handling patterns.
6. Styling/design system
   - CSS approach, component library, tokens, layout conventions.
7. State management
   - Local state, global state, cache/query tools, form state.
8. Testing setup
   - Unit, integration, E2E, fixtures, test commands, known gaps.
9. Existing conventions
   - Naming, imports, components, data flow, error/loading/empty states.
10. Risk areas
   - Fragile modules, unclear ownership, missing tests, migration/version risks.
11. Do-not-touch-without-approval
   - Architecture boundaries, generated files, dependencies, config, broad rewrites.
12. Recommended first checks
   - Smallest useful commands or manual smoke path for future edits.
13. Memory candidates
   - Durable conventions or decisions worth storing; omit temporary findings.

Open questions only if blocking.

## Rules

- Do not scaffold.
- Do not rewrite docs unless asked.
- Do not store secrets, raw logs, or huge diffs in memory.
