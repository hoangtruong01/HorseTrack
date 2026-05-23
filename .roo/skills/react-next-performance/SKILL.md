---
name: react-next-performance
description: Analyze React and Next.js performance risks: rerenders, effects, memoization, bundle size, images, fonts, server/client boundaries, data fetching, and caching.
---

# React / Next Performance

## Goal

Improve performance without premature abstraction.

## Check

- Unnecessary `useEffect` or derived state
- Expensive computations in render
- Unstable props causing rerenders
- Oversized client components in Next.js
- Wrong server/client boundary
- Large bundle or dependency sprawl
- Image/font loading issues
- Waterfall data fetching
- Missing pagination/cache/invalidation strategy

## Fix Strategy

1. Measure or infer bottleneck from code path.
2. Prefer structural fix before memoization.
3. Use `useMemo` / `useCallback` only with clear benefit.
4. Split code only when bundle/runtime gain is plausible.
5. Preserve behavior.

## Output

- Risk list
- Minimal recommended changes
- Checks to run
