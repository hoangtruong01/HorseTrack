# AGENTS.md

Behavioral guidelines for Codex and Codex-compatible agents using this `ai-workflows/` repo.

This file is an adapter, not a new source of truth. Merge it with project-specific instructions as needed.

## Source of Truth

- Read `MASTER_GUIDE.md` for the operating model.
- Read `AGENTS.md` for portable agent guidance.
- Read `PORTABILITY.md` for copy strategy across Roo, Codex, Codex, and future projects.
- Treat `shared/skills/` as the canonical skill source.
- Treat `.roomodes` as the Roo mode source.
- Treat `roo/.roo/rules/` as Roo-specific rules.
- Treat `Codex/.Codex/agents/` as Codex stubs, not the primary architecture.

Do not add new modes, skills, scripts, MCP config, backend lanes, extra mobile specialists, or community packs unless explicitly requested.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them; do not pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what is confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No flexibility or configurability that was not requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Do not improve adjacent code, comments, or formatting.
- Do not refactor things that are not broken.
- Match existing style, even if you would do it differently.
- If you notice unrelated dead code, mention it; do not delete it.

When your changes create orphans:

- Remove imports, variables, and functions that your changes made unused.
- Do not remove pre-existing dead code unless asked.

The test: every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" -> "Write tests for invalid inputs, then make them pass."
- "Fix the bug" -> "Write a test that reproduces it, then make it pass."
- "Refactor X" -> "Ensure tests pass before and after."

For multi-step tasks, state a brief plan:

```text
1. [Step] -> verify: [check]
2. [Step] -> verify: [check]
3. [Step] -> verify: [check]
```

Strong success criteria let you loop independently. Weak criteria like "make it work" require clarification.

## 5. Verification

- Run the smallest useful check for the change.
- Prefer lint, typecheck, targeted tests, and focused smoke checks when available.
- Use `docs/verification-matrix.md` to choose checks by change type.
- Report exact commands run and results.
- If checks are skipped, state the reason and residual risk.

## 6. Language Requirement

**Always respond in Vietnamese unless explicitly asked otherwise.**

- Default response language: Vietnamese.
- Keep technical terms and code identifiers in English when appropriate.
- Do not switch to English automatically.
- If the user requests another language, comply only for that response.

These guidelines are working if there are fewer unnecessary diffs, fewer rewrites due to overcomplication, and clarifying questions happen before implementation mistakes.
