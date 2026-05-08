import { useEffect, useRef, useState } from "react";

import ImageSlide from "./ImageSlide";
import { useZoom, useZoomInternal } from "./Zoom";
import { useLightboxContext } from "./LightboxContext";
import { clsx, cssClass, isImageSlide, round, translateLabel, translateSlideCounter, wrapIndex } from "../utils";
import type { RenderSlideProps, SlideImage } from "../types";

type CarouselSlideProps = Pick<RenderSlideProps, "slide" | "rect" | "current" | "slideIndex"> & {
  offset: number;
};

function CarouselSlide({ slide, rect, current, slideIndex, offset }: CarouselSlideProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const { zoom, offsetX, offsetY } = useZoom();
  const { slides, styles, labels, render } = useLightboxContext();

  // Once a slide has been zoomed during its current "current" stint, keep `transition: none`
  // applied even after zoom snaps back to 1 — otherwise the slide-mode `transition: transform`
  // rule would animate the final scale-down over the slide duration. Resets when the slide
  // leaves the current position.
  const [hadZoom, setHadZoom] = useState(false);
  if (current && zoom > 1 && !hadZoom) setHadZoom(true);
  if (!current && hadZoom) setHadZoom(false);

  useEffect(() => {
    if (!current) {
      // `inert` cannot be set as a JSX prop in a way that works on both React 18 and 19:
      // React 18 strips `inert={true}`; React 19 treats `inert=""` as falsy. Set imperatively.
      ref.current?.setAttribute("inert", "");

      // If focus was inside the slide we just made inert, the browser would drop it to <body>
      // and break the focus trap. Lift it to the Portal (the nearest `tabindex="-1"` ancestor).
      if (ref.current?.contains(document.activeElement)) {
        ref.current.closest<HTMLElement>('[tabindex="-1"]')?.focus();
      }
    } else {
      ref.current?.removeAttribute("inert");
    }
  }, [current]);

  const context = { slide, rect, current, slideIndex, zoom: round(current ? zoom : 1, 3) };

  return (
    <div
      ref={ref}
      role="group"
      aria-label={translateSlideCounter(labels, slideIndex + 1, slides.length)}
      aria-roledescription={translateLabel(labels, "Slide")}
      className={clsx(cssClass("slide"), current && cssClass("slide_current"))}
      data-offset={offset}
      style={{
        ...(current && (zoom > 1 || hadZoom)
          ? {
              transform:
                zoom > 1
                  ? `translateX(${round(offsetX, 3)}px) translateY(${round(offsetY, 3)}px) scale(${round(zoom, 3)})`
                  : undefined,
              // Suppress the slide-transition `transition: transform` so zoom/pan updates don't
              // ride the slide-duration ease-in-out curve — the same `transform` property carries both.
              transition: "none",
            }
          : undefined),
        ...styles.slide,
      }}
    >
      {render.slideHeader?.(context)}
      {render.slide?.(context) ??
        (isImageSlide(slide) && <ImageSlide {...(context as typeof context & { slide: SlideImage })} />)}
      {render.slideFooter?.(context)}
    </div>
  );
}

export default function Carousel() {
  const { slides, index, styles, labels, carousel } = useLightboxContext();
  const { setCarouselRef } = useZoomInternal();
  const { rect } = useZoom();

  return (
    <div
      ref={setCarouselRef}
      style={styles.carousel}
      className={clsx(cssClass("carousel"), cssClass(`transition_${carousel.transition}`))}
      role="region"
      aria-live="polite"
      aria-label={translateLabel(labels, "Photo gallery")}
      aria-roledescription={translateLabel(labels, "Carousel")}
    >
      {rect &&
        Array.from({ length: 2 * carousel.preload + 1 }).map((_, i) => {
          const slideIndex = index - carousel.preload + i;
          // keep out-of-bounds indices as-is when not infinite so slides[wrappedIndex] returns undefined
          const wrappedIndex = carousel.infinite ? wrapIndex(slideIndex, slides.length) : slideIndex;
          const slide = slides[wrappedIndex];

          if (!slide) return null;

          return (
            <CarouselSlide
              // Always prefix with slideIndex: in infinite mode the same slide can appear at
              // multiple positions simultaneously (when 2 * preload + 1 > slides.length)
              key={`${slideIndex}|${slide.key ?? (isImageSlide(slide) ? slide.src : "")}`}
              rect={rect}
              slide={slide}
              slideIndex={wrappedIndex}
              current={slideIndex === index}
              offset={slideIndex - index}
            />
          );
        })}
    </div>
  );
}
