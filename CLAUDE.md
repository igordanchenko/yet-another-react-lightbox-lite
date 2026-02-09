# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project

Yet Another React Lightbox Lite — a lightweight React lightbox component with
keyboard, mouse, touchpad, and touchscreen navigation, zoom, and responsive
image support. Bundle size should be kept as small as possible. React 18+, Node
18+.

## Commands

- **Build:** `npm run build` (clean → sass → postcss → rollup)
- **Dev server:** `npm run dev` (Vite dev server from `dev/` directory)
- **Test:** `npm run test` (Vitest, 100% coverage required)
- **Test with UI**: `npm run test:ui`
- **Lint:** `npm run lint` (ESLint 9 flat config)
- **Bundle size:** `npm run size` (minified + gzipped JS estimate)
- **Full CI**: `npm run ci` (build + test + lint)

## Architecture

The lightbox renders via a **Portal** (to `document.body`) and uses **React
Context** for state:

- `LightboxContext` — slide data, settings, render props
- `ControllerContext` — navigation (prev/next/close), exit hooks
- `ZoomContext` — zoom state and calculations

**Component tree:** `Lightbox` → `LightboxContext` → `Controller` → `Zoom` →
`Portal` → `{Toolbar, Carousel, Navigation}`

**Key files:**

- `src/Lightbox.tsx` — entry component, assembles the tree
- `src/types.ts` — all TypeScript interfaces
- `src/utils.ts` — shared helpers (context factory, view transitions, slide
  utils)
- `src/components/useSensors.ts` — unified event handling for
  touch/mouse/wheel/keyboard
- `src/components/Carousel.tsx` — slide container with configurable preloading
  (default: 2 slides each direction)
- `src/components/Zoom.tsx` — zoom state management and gesture handling

**Public API exports** (`src/index.ts`): `Lightbox` (default), `useZoom` hook,
all types.

## Build Pipeline

SCSS → CSS (sass) → optimized CSS (postcss + autoprefixer + cssnano) → `dist/`
TypeScript → ESM JS + `.d.ts` (rollup) → `dist/`

React/ReactDOM are external peer dependencies.

## Testing

- Vitest with jsdom environment
- `test/test-utils.tsx` has render helpers, element selectors, and gesture
  simulation utilities
- `vitest.setup.ts` stubs `ResizeObserver`, `resizeTo`, and `HTMLElement`
  dimensions
- Coverage thresholds: 100% on all `src/**` files (excluding `index.ts`,
  `types.ts`, `.d.ts`)

## Code Style

- Conventional commits enforced via commitlint + husky
- `no-console: "error"` — no console statements
- Prettier: 120 char width, 80 for markdown
- Unused vars allowed with `_` prefix
