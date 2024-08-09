# Yet Another React Lightbox Lite

Lightweight React lightbox component. This is a trimmed-down version of the
[yet-another-react-lightbox](https://github.com/igordanchenko/yet-another-react-lightbox)
that provides essential lightbox features and slick UX with just 2.8KB bundle
size.

## Overview

[![NPM Version](https://img.shields.io/npm/v/yet-another-react-lightbox-lite.svg?color=blue)](https://www.npmjs.com/package/yet-another-react-lightbox)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/yet-another-react-lightbox-lite.svg?color=blue)](https://bundlephobia.com/package/yet-another-react-lightbox)
[![License MIT](https://img.shields.io/npm/l/yet-another-react-lightbox-lite.svg?color=blue)](https://github.com/igordanchenko/yet-another-react-lightbox/blob/main/LICENSE)

- **Built for React:** works with React 18+
- **UX:** supports keyboard, mouse, touchpad and touchscreen navigation
- **Performance:** preloads a fixed number of images without compromising
  performance or UX
- **Responsive:** responsive images with automatic resolution switching are
  supported out of the box
- **Customization:** customize any UI element or add your own custom slides
- **No bloat:** supports only essential lightbox features
- **TypeScript:** type definitions come built-in in the package

## Documentation

[https://github.com/igordanchenko/yet-another-react-lightbox-lite](https://github.com/igordanchenko/yet-another-react-lightbox-lite)

## Live Demo

[https://stackblitz.com/edit/yet-another-react-lightbox-lite](https://stackblitz.com/edit/yet-another-react-lightbox-lite)

## Changelog

[https://github.com/igordanchenko/yet-another-react-lightbox-lite/releases](https://github.com/igordanchenko/yet-another-react-lightbox-lite/releases)

## Requirements

- React 18+
- Node 18+
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
with `next/image` with the following `render.slide` render function.

```tsx
<Lightbox
  // ...
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
          blurDataURL={(slide as any).blurDataURL}
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
/>
```

## API

Yet Another React Lightbox Lite comes with CSS stylesheet that needs to be
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

### index

Type: `number | undefined`

Current slide index. This prop is required.

### setIndex

Type: `(index: number | undefined) => void`

A callback to update current slide index state. This prop is required.

### labels

Type: `{ [key: string]: string }`

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

### render

Type: `object`

An object providing custom render functions.

```tsx
<Lightbox
  render={{
    slide: ({ slide, rect, current }) => (
      <CustomSlide {...{ slide, rect, current }} />
    ),
    slideHeader: ({ slide, rect, current }) => (
      <SlideHeader {...{ slide, rect, current }} />
    ),
    slideFooter: ({ slide, rect, current }) => (
      <SlideFooter {...{ slide, rect, current }} />
    ),
    controls: () => <CustomControls />,
    iconPrev: () => <IconPrev />,
    iconNext: () => <IconNext />,
    iconClose: () => <IconClose />,
  }}
  // ...
/>
```

#### slide: ({ slide, rect, current }) => ReactNode

Render custom slide type, or override the default image slide implementation.

#### slideHeader: ({ slide, rect, current }) => ReactNode

Render custom elements above each slide.

#### slideFooter: ({ slide, rect, current }) => ReactNode

Render custom elements below or over each slide. By default, the content is
rendered right under the slide. Alternatively, you can use
`position: "absolute"` to position the extra elements relative to the slide.

For example, you can use the `slideFooter` render function to add slides
descriptions.

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

For example, you can use the `render.controls` render function to implement
slides counter.

```tsx
<Lightbox
  // ...
  render={{
    controls: () =>
      index !== undefined && (
        <div style={{ position: "absolute", top: 16, left: 16 }}>
          {index + 1} of {slides.length}
        </div>
      ),
  }}
/>
```

You can also use the `render.controls` render function to add custom buttons to
the toolbar.

```tsx
<Lightbox
  // ...
  render={{
    controls: () => (
      <button
        type="button"
        className="yarll__button"
        style={{ position: "absolute", top: 8, right: 64 }}
        onClick={() => {
          // ...
        }}
      >
        <ButtonIcon />
      </button>
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

## Custom Slide Attributes

You can add custom slide attributes with the following module augmentation.

```tsx
declare module "yet-another-react-lightbox-lite" {
  interface GenericSlide {
    description?: string;
  }
}
```

## Custom Slides

You can add custom slide types through module augmentation and render them with
the `render.slide` render function.

Here is an example demonstrating video slides implementation.

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

## License

MIT © 2024 [Igor Danchenko](https://github.com/igordanchenko)
