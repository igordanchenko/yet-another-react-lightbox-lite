# Yet Another React Lightbox Lite

Lightweight React lightbox component. This is a trimmed-down version of the
[yet-another-react-lightbox](https://github.com/igordanchenko/yet-another-react-lightbox)
that provides essential lightbox features and slick UX with a really modest
bundle size.

## Overview

[![NPM Version](https://img.shields.io/npm/v/yet-another-react-lightbox-lite.svg?color=blue)](https://www.npmjs.com/package/yet-another-react-lightbox-lite)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/yet-another-react-lightbox-lite.svg?color=blue)](https://bundlephobia.com/package/yet-another-react-lightbox-lite)
[![License MIT](https://img.shields.io/npm/l/yet-another-react-lightbox-lite.svg?color=blue)](https://github.com/igordanchenko/yet-another-react-lightbox-lite/blob/main/LICENSE)

- **Lightweight:** around 5.5KB minified + gzipped, with no runtime dependencies
- **Universal input:** keyboard, mouse, touchpad, and touchscreen navigation
- **Zoom:** pinch, wheel, double-tap, and keyboard, with a configurable zoom
  limit
- **Transitions:** built-in `fade`/`slide`/`none`, with custom effects via CSS
- **Preloading:** configurable preload window keeps memory and bandwidth in
  check
- **Responsive images:** built-in `srcSet` support for automatic resolution
  switching
- **Fully customizable:** override any element via `slots`, `render` props, and
  exported hooks, or add custom slide types
- **TypeScript-first:** extend `slides` and `labels` via declaration merging,
  with full autocomplete support

![Yet Another React Lightbox Lite | Example](https://images.yet-another-react-lightbox.com/example-lite.jpg)

## Documentation

[https://github.com/igordanchenko/yet-another-react-lightbox-lite](https://github.com/igordanchenko/yet-another-react-lightbox-lite)

## Examples

- Live demo -
  [https://stackblitz.com/edit/yet-another-react-lightbox-lite](https://stackblitz.com/edit/yet-another-react-lightbox-lite?file=src%2FApp.tsx)
- Examples -
  [https://stackblitz.com/edit/yet-another-react-lightbox-lite-examples](https://stackblitz.com/edit/yet-another-react-lightbox-lite-examples?file=src%2FApp.tsx)

## Changelog

[https://github.com/igordanchenko/yet-another-react-lightbox-lite/releases](https://github.com/igordanchenko/yet-another-react-lightbox-lite/releases)

## Requirements

- React 18+
- Node 22+
- modern ESM-compatible bundler

## Installation

```shell
npm install yet-another-react-lightbox-lite
```

## Minimal Setup Example

```tsx
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox-lite";
import "yet-another-react-lightbox-lite/styles.css";

export default function App() {
  const [index, setIndex] = useState<number>();

  return (
    <>
      <button type="button" onClick={() => setIndex(0)}>
        Open Lightbox
      </button>

      <Lightbox
        slides={[
          { src: "/image1.jpg" },
          { src: "/image2.jpg" },
          { src: "/image3.jpg" },
        ]}
        index={index}
        setIndex={setIndex}
      />
    </>
  );
}
```

## Responsive Images

To utilize responsive images with automatic resolution switching, provide
`srcset` images in the slide `srcSet` array.

```tsx
<Lightbox
  slides={[
    {
      src: "/image1x3840.jpg",
      width: 3840,
      height: 2560,
      srcSet: [
        { src: "/image1x320.jpg", width: 320, height: 213 },
        { src: "/image1x640.jpg", width: 640, height: 427 },
        { src: "/image1x1200.jpg", width: 1200, height: 800 },
        { src: "/image1x2048.jpg", width: 2048, height: 1365 },
        { src: "/image1x3840.jpg", width: 3840, height: 2560 },
      ],
    },
    // ...
  ]}
  // ...
/>
```

## Next.js Image

If your project is based on [Next.js](https://nextjs.org/), you may want to take
advantage of the
[next/image](https://nextjs.org/docs/pages/api-reference/components/image)
component. The `next/image` component provides a more efficient way to handle
images in your Next.js project. You can replace the standard `<img>` element
with `next/image` using the following `render.slide` render function.

```tsx
declare module "yet-another-react-lightbox-lite" {
  interface SlideImage {
    blurDataURL?: string;
  }
}
```

```tsx
<Lightbox
  render={{
    slide: ({ slide, rect }) => {
      const width =
        slide.width && slide.height
          ? Math.round(
              Math.min(rect.width, (rect.height / slide.height) * slide.width),
            )
          : rect.width;

      const height =
        slide.width && slide.height
          ? Math.round(
              Math.min(rect.height, (rect.width / slide.width) * slide.height),
            )
          : rect.height;

      return (
        <Image
          src={slide.src}
          alt={slide.alt || ""}
          width={width}
          height={height}
          loading="eager"
          draggable={false}
          blurDataURL={slide.blurDataURL}
          style={{
            minWidth: 0,
            minHeight: 0,
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      );
    },
  }}
  // ...
/>
```

## API

Yet Another React Lightbox Lite comes with a CSS stylesheet that needs to be
imported in your app.

```tsx
import "yet-another-react-lightbox-lite/styles.css";
```

The lightbox component accepts the following props.

### slides

Type: `Slide[]`

An array of slides to display in the lightbox. This prop is required. By
default, the lightbox supports only image slides. You can add support for custom
slides through a custom render function (see example below).

Image slide props:

- `src` - image source (required)
- `alt` - image `alt` attribute
- `width` - image width in pixels
- `height` - image height in pixels
- `srcSet` - alternative images for responsive resolution switching (see
  [Responsive Images](#responsive-images))

### index

Type: `number | undefined`

Current slide index. This prop is required.

### setIndex

Type: `(index: number | undefined) => void`

A callback to update current slide index state. This prop is required.

### labels

Type: `object`

Custom UI labels / translations.

```tsx
<Lightbox
  labels={{
    Previous: t("Previous"),
    Next: t("Next"),
    Close: t("Close"),
  }}
  // ...
/>
```

The `labels` prop accepts the built-in keys (`Previous`, `Next`, `Close`,
`Lightbox`, `Carousel`, `Slide`, `Photo gallery`, `{index} of {total}`) and any
custom string keys — useful for translating
[custom `IconButton` labels](#iconbutton). To get autocomplete for your custom
keys in both [`IconButton.label`](#iconbutton) and the `labels` prop,
declaration-merge them into the exported `LabelRegistry` interface:

```ts
declare module "yet-another-react-lightbox-lite" {
  interface LabelRegistry {
    Download?: string;
  }
}
```

### toolbar

Type: `object`

Toolbar settings.

- `buttons` - custom toolbar buttons (type: `ReactNode[]`). Each button should
  have a unique `key` attribute. Use the exported [`IconButton`](#iconbutton)
  component for buttons that match the built-in styling.
- `fixed` - if `true`, the toolbar is positioned statically above the carousel

Usage example:

```tsx
<Lightbox
  toolbar={{
    fixed: true,
    buttons: [
      <IconButton
        key="download"
        label="Download"
        icon={DownloadIcon}
        onClick={() => {
          // ...
        }}
      />,
    ],
  }}
  // ...
/>
```

### carousel

Type: `object`

Carousel settings.

- `preload` - the lightbox preloads `(2 * preload + 1)` slides (default: `2`)
- `transition` - slide transition effect, `"fade"` (default), `"slide"`, or
  `"none"` (see [Slide Transitions](#slide-transitions))
- `infinite` - if `true`, the carousel wraps around from the last slide to the
  first and vice versa (default: `false`). In this mode, the controlled `index`
  value drifts beyond `[0, slides.length)` to encode navigation direction; treat
  it as opaque navigation state. If you need to persist which slide is showing
  (e.g., to URL params), persist a stable slide identifier and resolve it back
  to an in-range index on load — don't round-trip the drifted index through
  normalization, as that would break wrap animations and the preload window
  during a live session.

Usage example:

```tsx
<Lightbox
  carousel={{ preload: 5 }}
  // ...
/>
```

Enable infinite (wrapping) navigation:

```tsx
<Lightbox
  carousel={{ infinite: true }}
  // ...
/>
```

To customize image slide attributes (e.g., `crossOrigin`, `loading`, `lang`),
use the [`slots.image`](#slots) prop.

### controller

Type: `object`

Controller settings.

- `closeOnPullUp` - if `true`, close the lightbox on pull-up gesture (default:
  `true`)
- `closeOnPullDown` - if `true`, close the lightbox on pull-down gesture
  (default: `true`)
- `closeOnBackdropClick` - if `true`, close the lightbox when the backdrop is
  clicked (default: `true`)
- `closeOnEscape` - if `true`, close the lightbox on Escape key press (default:
  `true`)

Usage example:

```tsx
<Lightbox
  controller={{
    closeOnEscape: false,
    closeOnPullUp: false,
    closeOnPullDown: false,
    closeOnBackdropClick: false,
  }}
  // ...
/>
```

### render

Type: `object`

An object providing custom render functions.

```tsx
<Lightbox
  render={{
    slide: ({ slide, rect, zoom, current, slideIndex }) => (
      <CustomSlide {...{ slide, rect, zoom, current, slideIndex }} />
    ),
    slideHeader: ({ slide, rect, zoom, current, slideIndex }) => (
      <SlideHeader {...{ slide, rect, zoom, current, slideIndex }} />
    ),
    slideFooter: ({ slide, rect, zoom, current, slideIndex }) => (
      <SlideFooter {...{ slide, rect, zoom, current, slideIndex }} />
    ),
    controls: () => <CustomControls />,
    iconPrev: () => <IconPrev />,
    iconNext: () => <IconNext />,
    iconClose: () => <IconClose />,
  }}
  // ...
/>
```

#### slide: ({ slide, rect, zoom, current, slideIndex }) => ReactNode

Render custom slide type, or override the default image slide implementation.

Parameters:

- `slide` - slide object (type: `Slide`)
- `rect` - slide rect size (type: `Rect`)
- `zoom` - current zoom level (type: `number`)
- `current` - if `true`, the slide is the current slide in the viewport (type:
  `boolean`)
- `slideIndex` - index of this slide within the `slides` array, always in
  `[0, slides.length)` (type: `number`). Not the same as the controlled `index`
  prop — for preloaded neighbors it points to a neighbor, and in `infinite` mode
  the controlled `index` may drift outside `[0, slides.length)` while
  `slideIndex` stays wrapped.

#### slideHeader: ({ slide, rect, zoom, current, slideIndex }) => ReactNode

Render custom elements above each slide.

#### slideFooter: ({ slide, rect, zoom, current, slideIndex }) => ReactNode

Render custom elements below or over each slide. By default, the content is
rendered right under the slide. Alternatively, you can use
`position: "absolute"` to position the extra elements relative to the slide.

For example, you can use the `slideFooter` render function to add slides
descriptions (see [Custom Slide Attributes](#custom-slide-attributes)).

```tsx
<Lightbox
  render={{
    slideFooter: ({ slide }) => (
      <div style={{ marginBlockStart: 16 }}>{slide.description}</div>
    ),
  }}
  // ...
/>
```

#### controls: () => ReactNode

Render custom controls or additional elements in the lightbox (use absolute
positioning).

For example, you can use the `render.controls` render function to implement a
slides counter.

```tsx
const slides = [
  { src: "/image1.jpg" },
  { src: "/image2.jpg" },
  { src: "/image3.jpg" },
];

const [index, setIndex] = useState<number>();

// Fold the controlled index back into [0, slides.length) — needed because
// `infinite` mode lets `index` drift outside that range.
const normalizeIndex = (i: number) =>
  ((i % slides.length) + slides.length) % slides.length;
```

```tsx
<Lightbox
  slides={slides}
  index={index}
  setIndex={setIndex}
  render={{
    controls: () =>
      index !== undefined && (
        <div style={{ position: "absolute", top: 16, left: 16 }}>
          {`${normalizeIndex(index) + 1} of ${slides.length}`}
        </div>
      ),
  }}
/>
```

#### iconPrev: () => ReactNode

Render custom `Previous` icon.

#### iconNext: () => ReactNode

Render custom `Next` icon.

#### iconClose: () => ReactNode

Render custom `Close` icon.

### slots

Type: `object`

Customization slots let you override HTML attributes on the lightbox elements —
`className`, `style` (including `--yarll__*` CSS variables), `data-*`, `aria-*`,
`crossOrigin`, etc.

Supported slots:

- `portal` - lightbox portal (root) `<div>`
- `carousel` - lightbox carousel `<div>`
- `toolbar` - lightbox toolbar `<div>`
- `button` - lightbox button `<button>` (Close, Previous, Next, and any custom
  toolbar buttons rendered via the exported [`IconButton`](#iconbutton)
  component)
- `icon` - lightbox icon `<svg>`
- `slide` - lightbox slide wrapper `<div>`
- `image` - lightbox slide image `<img>` (object form, or a function receiving
  the current slide and returning props)

Usage examples:

```tsx
<Lightbox
  slots={{
    portal: {
      className: "custom-portal-class",
      style: { "--yarll__backdrop_color": "rgba(0, 0, 0, 0.6)" },
    },
    image: { crossOrigin: "anonymous" },
  }}
  // ...
/>
```

You can also use a function form for `slots.image` to provide per-slide image
attributes. The example below augments `SlideImage` with a custom `lang` field
(see [Custom Slide Attributes](#custom-slide-attributes)) and forwards it to the
underlying `<img>`:

```tsx
declare module "yet-another-react-lightbox-lite" {
  interface SlideImage {
    lang?: string;
  }
}
```

```tsx
<Lightbox
  slots={{
    image: (slide) => ({ lang: slide.lang }),
  }}
  // ...
/>
```

`slots.image` is the only slot that accepts a function — image is the only slot
rendered per slide, so it's the only one with per-instance context. The other
slots are singletons and accept objects only.

`className` and `style` from a slot are merged with the lightbox internals
(library classes stay, your additions are appended; library style entries stay,
your entries override on conflict). All other attributes are spread last, so a
slot can override any built-in attribute (including the lightbox's own event
handlers) — use with caution.

#### CSS Custom Properties

The stylesheet exposes the following custom properties for theming. Override
them via the `slots` prop shown above, globally via `:root`, or scoped via a
custom class on the lightbox (`slots.portal.className`).

**Portal**

- `--yarll__foreground_color` — foreground color, inherited by descendants
- `--yarll__backdrop_color` — backdrop color
- `--yarll__portal_zindex` — portal `z-index`

**Transitions**

- `--yarll__fade_duration` — `"fade"` preset + lightbox open/close duration
- `--yarll__fade_easing` — `"fade"` preset + lightbox open/close timing function
- `--yarll__slide_duration` — `"slide"` preset duration
- `--yarll__slide_easing` — `"slide"` preset timing function

**Layout**

- `--yarll__carousel_margin` — margin around the carousel
- `--yarll__toolbar_margin` — toolbar offset from portal edges

**Buttons** (toolbar icon buttons; inherited by navigation buttons)

- `--yarll__button_padding` — button padding
- `--yarll__button_color` — idle foreground color
- `--yarll__button_color_active` — hover / focus foreground color
- `--yarll__button_color_disabled` — disabled foreground color
- `--yarll__button_background_color` — background color
- `--yarll__button_filter` — button shadow effect (`filter`)
- `--yarll__button_focus_outline` — focus-visible `outline`
- `--yarll__button_focus_box_shadow` — focus-visible `box-shadow`

**Navigation Buttons** (Previous / Next)

- `--yarll__navigation_button_padding` — padding (larger hit area)
- `--yarll__navigation_button_offset` — horizontal offset from the portal edge

**Icons**

- `--yarll__icon_size` — icon width and height

### zoom

Type: `object`

Zoom settings.

- `supports` - slide types that support zoom (default: `["image"]`)
- `maxZoom` - maximum zoom level (default: `8`)

Cap the maximum zoom level:

```tsx
<Lightbox
  zoom={{ maxZoom: 4 }}
  // ...
/>
```

Enable zoom on custom slide types:

```tsx
<Lightbox
  zoom={{ supports: ["image", "custom-slide-type"] }}
  // ...
/>
```

Disable zoom entirely:

```tsx
<Lightbox
  zoom={{ supports: [] }}
  // ...
/>
```

## Custom Slide Attributes

You can add custom slide attributes with the following module augmentation.
Augmenting `GenericSlide` extends all slide types, including custom ones. To
extend only image slides, augment `SlideImage` instead.

```tsx
declare module "yet-another-react-lightbox-lite" {
  interface GenericSlide {
    description?: string;
  }
}
```

```tsx
declare module "yet-another-react-lightbox-lite" {
  interface SlideImage {
    blurDataURL?: string;
  }
}
```

## Custom Slides

You can add custom slide types through module augmentation and render them with
the `render.slide` function.

Here is an example demonstrating video slide support.

```tsx
declare module "yet-another-react-lightbox-lite" {
  interface SlideVideo extends GenericSlide {
    type: "video";
    src: string;
    poster: string;
    width: number;
    height: number;
  }

  interface SlideTypes {
    video: SlideVideo;
  }
}

// ...

<Lightbox
  slides={[
    {
      type: "video",
      src: "/media/video.mp4",
      poster: "/media/poster.jpg",
      width: 1280,
      height: 720,
    },
  ]}
  render={{
    slide: ({ slide }) =>
      slide.type === "video" ? (
        <video
          controls
          playsInline
          poster={slide.poster}
          width={slide.width}
          height={slide.height}
          style={{ maxWidth: "100%", maxHeight: "100%" }}
        >
          <source type="video/mp4" src={slide.src} />
        </video>
      ) : undefined,
  }}
  // ...
/>;
```

## Code Splitting (Suspense)

```tsx
// Lightbox.tsx
import LightboxComponent, {
  LightboxProps,
} from "yet-another-react-lightbox-lite";
import "yet-another-react-lightbox-lite/styles.css";

export default function Lightbox(props: LightboxProps) {
  return <LightboxComponent {...props} />;
}
```

```tsx
// App.tsx
import { lazy, Suspense, useState } from "react";
import slides from "./slides";

const Lightbox = lazy(() => import("./Lightbox"));

export default function App() {
  const [index, setIndex] = useState<number>();

  return (
    <>
      <button type="button" onClick={() => setIndex(0)}>
        Open Lightbox
      </button>

      {index !== undefined && (
        <Suspense>
          <Lightbox slides={slides} index={index} setIndex={setIndex} />
        </Suspense>
      )}
    </>
  );
}
```

## Body Scroll Lock

By default, the lightbox hides the browser window scrollbar and prevents
document `<body>` from scrolling underneath the lightbox by assigning the
`height: 100%; overflow: hidden;` styles to the document `<body>` element.

If this behavior causes undesired side effects in your case, and you prefer not
to use this feature, you can turn it off by assigning the
`yarll__no_scroll_lock` class to the lightbox via `slots.portal.className`.

```tsx
<Lightbox
  slots={{ portal: { className: "yarll__no_scroll_lock" } }}
  // ...
/>
```

However, if you keep the body scroll lock feature on, you may notice a visual
layout shift of some fixed-positioned page elements when the lightbox opens. To
address this, you can assign the `yarll__fixed` CSS class to your
fixed-positioned elements to keep them in place. Please note that the
fixed-positioned element container should not have its own border or padding
styles. If it does, you can always add an extra wrapper that just defines the
fixed position without visual styles.

## Slide Transitions

Three transition effects are built in:

- `"fade"` (default) — cross-fade between slides
- `"slide"` — horizontal slide
- `"none"` — instant swap, no animation

Select one via the `carousel.transition` setting:

```tsx
<Lightbox carousel={{ transition: "slide" }} />
```

Each preset exposes its own duration / easing CSS variables:

- `"fade"` (and the lightbox enter/exit fade) — `--yarll__fade_duration`
  (default `0.3s`) and `--yarll__fade_easing` (default `ease`)
- `"slide"` — `--yarll__slide_duration` (default `0.5s`) and
  `--yarll__slide_easing` (default `ease-in-out`)

Override them via `slots.portal.style`, `slots.carousel.style`, or anywhere
reachable in your CSS cascade. For example, retuning the slide preset:

```tsx
<Lightbox
  slots={{
    carousel: {
      style: {
        "--yarll__slide_duration": "1s",
        "--yarll__slide_easing": "ease-in-out",
      },
    },
  }}
/>
```

…or in your stylesheet:

```css
.yarll__carousel {
  --yarll__slide_duration: 1s;
  --yarll__slide_easing: ease-in-out;
}
```

### Custom Transitions

`carousel.transition` accepts any string in addition to the three built-in
presets. The library applies a `yarll__transition_<name>` class to the carousel
element, so to register a custom effect, choose a name and write the matching
`.yarll__transition_<name>` CSS rules. For example, a zoom effect where the
incoming slide grows in from a smaller scale:

```tsx
<Lightbox carousel={{ transition: "zoom" }} />
```

```css
.yarll__transition_zoom .yarll__slide {
  transform: scale(0.85);
  transition: transform var(--yarll__fade_duration, 0.3s)
    var(--yarll__fade_easing, ease);
}

.yarll__transition_zoom .yarll__slide_current {
  transform: scale(1);
}
```

For direction-aware effects, every preloaded slide also carries a `data-offset`
attribute equal to `slideIndex - currentIndex` — negative for slides before the
current one, `0` for the current slide, and positive for those after it. Since
the `[data-offset^="-"]` prefix selector matches any negative value, the three
rules below cleanly target the slides on either side of the current one
regardless of the `carousel.preload` value:

```css
.yarll__slide {
  /* default — slides after the current one (positive offset) */
}

.yarll__slide[data-offset^="-"] {
  /* slides before the current one (negative offset) */
}

.yarll__slide_current {
  /* the current slide */
}
```

## Interactive Custom Elements

The lightbox sets `user-select: none`, `touch-action: none`, and
`-webkit-touch-callout: none` on the portal, and captures pointer, wheel, and
keyboard events for navigation and zoom. If you render custom content that needs
native behavior — text selection in captions, form inputs (including their
arrow-key cursor movement), scrollable panels, range sliders, iOS long-press
menus on embedded images, etc. — wrap it (or apply directly to the element) in
the `yarll__interactive` CSS class. This class restores native browser behavior
for those three properties and suppresses lightbox gesture, wheel, and keyboard
handling for events originating inside the subtree.

## Imperative Handle

`Lightbox` forwards a ref that exposes an imperative handle for programmatic
control. The handle is attached only while the lightbox is mounted (open or
closing); when the lightbox is closed, `ref.current` is `null`, so a guarded
call (`ref.current?.next()`) is a safe no-op.

```tsx
import { useRef } from "react";
import Lightbox, { type LightboxRef } from "yet-another-react-lightbox-lite";

const ref = useRef<LightboxRef>(null);

<Lightbox ref={ref} /* ... */ />;
```

The handle exposes the following methods:

- `prev()` - navigate to the previous slide
- `next()` - navigate to the next slide
- `goto(index)` - navigate to the specified slide
- `close()` - trigger the animated close

In non-infinite mode, `prev()` past the first slide, `next()` past the last, and
`goto()` with an out-of-range index are all no-ops.

Note that calling `close()` plays the exit transition (same as the Escape key or
the toolbar Close button), whereas setting `index` to `undefined` from the
parent skips the transition and unmounts immediately.

## Components

The library exports the following components that you may find helpful in
customizing the lightbox UI.

### IconButton

`IconButton` renders an icon-only button with the same styling, ARIA semantics,
and `slots.button` / `slots.icon` integration as the built-in Close, Previous,
and Next buttons. Use it to build custom toolbar buttons that look and behave
identically to the defaults.

```tsx
import Lightbox, { IconButton } from "yet-another-react-lightbox-lite";
```

`IconButton` accepts all standard `<button>` attributes (except `type`, `title`,
`aria-label`, and `children` — owned by the component), plus:

- `label` (required) - button label, used for both `title` and `aria-label`.
  Accepts a known `Labels` key (translated via the [`labels`](#labels) prop) or
  any custom string.
- `icon` (required) - icon component rendered inside the button.
- `renderIcon` - custom icon render function. When provided, takes precedence
  over `icon`.

`IconButton` must be rendered inside a `<Lightbox>` (it relies on the lightbox
context).

Usage example — a custom Download button rendered in the toolbar:

```tsx
import Lightbox, { IconButton } from "yet-another-react-lightbox-lite";

function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
    </svg>
  );
}

<Lightbox
  toolbar={{
    buttons: [
      <IconButton
        key="download"
        label="Download"
        icon={DownloadIcon}
        onClick={() => {
          // download the current slide
        }}
      />,
    ],
  }}
  // ...
/>;
```

Styling applied via [`slots.button`](#slots) and `slots.icon` is forwarded
automatically. Note that slot props take precedence over the caller's props
(including `onClick` and `className`), matching the behavior of the built-in
buttons.

## Hooks

The library exports the following hooks that you may find helpful in customizing
lightbox functionality.

### useController

`useController` exposes the lightbox's navigation controls so that custom
toolbar buttons (or other elements rendered through
[`render.controls`](#render)) can drive the lightbox from the inside. The
returned `close()` plays the exit transition — same as the toolbar Close button
or the Escape key — whereas clearing `index` from the parent unmounts
immediately.

```tsx
import { useController } from "yet-another-react-lightbox-lite";
```

The hook returns an object with:

- `prev()` - navigate to the previous slide
- `next()` - navigate to the next slide
- `goto(index)` - navigate to the specified slide
- `close()` - trigger the animated close

In non-infinite mode, `prev()` past the first slide, `next()` past the last, and
`goto()` with an out-of-range index are all no-ops.

`useController` must be called from inside a `<Lightbox>` (it reads the
lightbox's controller context).

Usage example — a custom bottom navigation bar rendered via
[`render.controls`](#render):

```tsx
import Lightbox, {
  IconButton,
  useController,
} from "yet-another-react-lightbox-lite";

function NavigationBar() {
  const { prev, next, close } = useController();
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        bottom: 16,
        left: "50%",
        gap: 8,
        transform: "translateX(-50%)",
      }}
    >
      <IconButton label="Previous" icon={PrevIcon} onClick={prev} />
      <IconButton label="Done" icon={DoneIcon} onClick={close} />
      <IconButton label="Next" icon={NextIcon} onClick={next} />
    </div>
  );
}

<Lightbox
  render={{ controls: () => <NavigationBar /> }}
  // ...
/>;
```

### useZoom

You can use the `useZoom` hook to build your custom zoom controls.

```tsx
import { useZoom } from "yet-another-react-lightbox-lite";
```

The hook provides an object with the following props:

- `rect` - slide rect
- `zoom` - current zoom level (numeric value between `1` and `maxZoom`)
- `maxZoom` - maximum zoom level (`1` if zoom is not supported on the current
  slide, otherwise the configured `zoom.maxZoom`, default `8`)
- `offsetX` - horizontal slide position offset
- `offsetY` - vertical slide position offset
- `changeZoom` - change zoom level
- `changeOffsets` - change position offsets

Usage example:

```tsx
import { IconButton, useZoom } from "yet-another-react-lightbox-lite";

function ZoomControls() {
  const { zoom, maxZoom, changeZoom } = useZoom();

  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        bottom: 16,
        left: 16,
        gap: 8,
      }}
    >
      <IconButton
        label="Zoom in"
        icon={ZoomInIcon}
        disabled={zoom >= maxZoom}
        onClick={() => changeZoom(zoom * 2)}
      />
      <IconButton
        label="Zoom out"
        icon={ZoomOutIcon}
        disabled={zoom <= 1}
        onClick={() => changeZoom(zoom / 2)}
      />
    </div>
  );
}
```

```tsx
<Lightbox
  render={{
    controls: () => <ZoomControls />,
  }}
  // ...
/>
```

## License

MIT © 2024 [Igor Danchenko](https://github.com/igordanchenko)
