# CLAUDE.md

## Project

Yet Another React Lightbox Lite — a lightweight React lightbox component
(keyboard/mouse/touchpad/touchscreen navigation, zoom, responsive images).
Bundle size should be kept as small as possible. React 18+, Node 22+, ESM-only
output.

## Commands

- **Build:** `npm run build` (clean → rollup JS/`.d.ts` → lightningcss CSS)
- **Test:** `npm run test` (Vitest, jsdom)
- **Single test file:**
  `npx vitest run test/Lightbox.spec.tsx --coverage.enabled=false` (disable
  coverage or the 100% threshold fails on partial runs; add `-t "name"` to
  filter tests)
- **Test UI:** `npm run test:ui`
- **Lint:** `npm run lint`
- **Dev server:** `npm run dev` (Vite playground in `dev/`)
- **Bundle size check:** `npm run size`
- **Full CI:** `npm run ci` (build + test + lint + size)

## Architecture

The lightbox renders through a **Portal** appended to `document.body`. Component
tree assembled in `src/Lightbox.tsx`:

`LightboxContextProvider` → `Controller` → `Zoom` → `Portal` →
`{Toolbar, Carousel, Navigation}`

State flows through three contexts, each created with the `makeUseContext`
factory from `src/utils.ts`:

- `LightboxContext` (`components/LightboxContext.tsx`) — resolved props: slides,
  index, settings, render/slots overrides
- `ControllerContext` (`components/Controller.tsx`) — navigation
  (`prev`/`next`/`close`); exposed publicly as `useController`
- `ZoomContext` + internal `ZoomInternalContext` (`components/Zoom.tsx`) — zoom
  state/gestures; exposed publicly as `useZoom`

Other key pieces:

- `src/props.ts` — `resolveProps` is the **single place where prop defaults
  live**. Never destructure with inline defaults at usage sites.
- `src/types.ts` — all public types. Extensible types (slides, labels) use the
  registry pattern: an `XRegistry` interface for declaration merging + an `X`
  type alias + an `XKey` union.
- `src/components/useSensors.ts` — unified pointer/wheel/keyboard event handling
- `src/components/Carousel.tsx` — slide window with configurable preload
  (default 2 each direction)
- `src/utils.ts` — `cssClass`/`cssVar` (all CSS classes are prefixed `yarll__`),
  slide type guards, math helpers
- `src/index.ts` — public API: `Lightbox` (default export), `IconButton`,
  `useController`, `useZoom`, all types

`Lightbox.tsx` living at the `src/` root is intentional — keep it there.

### Open/close lifecycle

The lightbox is controlled via `index` / `setIndex` props: `index: undefined`
means closed. `Lightbox.tsx` tracks a `PortalState` (`open`/`closing`/`closed`)
so the close transition can play before `setIndex(undefined)` fires in
`onClosed`.

## Testing

- Tests live in `test/`
- `test/test-utils.tsx` — render helpers, `yarll__*` class selectors, and
  gesture simulation; use these instead of raw queries
- `test/vitest.setup.ts` — stubs `ResizeObserver`, `resizeTo`, and `HTMLElement`
  dimensions
- Coverage: 100% required on all `src/**` files (excluding `index.ts`,
  `types.ts`, `.d.ts`)

## Code style

- Conventional commits enforced by commitlint + husky. No scopes — write
  `type: subject`. Wrap commit bodies at 100 chars.
- `no-console` is an error
- Prettier: 120 print width (80 + prose wrap for markdown)
- Unused vars allowed only with `_` prefix
