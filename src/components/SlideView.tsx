import { useRef, useState } from "react";

import { ImageSlide } from "./ImageSlide";
import { useZoom } from "./Zoom";
import { useLightboxContext } from "./LightboxContext";
import { useIsomorphicLayoutEffect } from "../hooks";
import { clsx, cssClass, isImageSlide, mergeSlot, round, translateLabel, translateSlideCounter } from "../utils";
import type { RenderSlideProps, SlideImage } from "../types";

type SlideViewProps = Pick<RenderSlideProps, "slide" | "rect" | "current" | "slideIndex"> & {
  offset: number;
};

export function SlideView({ slide, rect, current, slideIndex, offset }: SlideViewProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const { zoom, offsetX, offsetY } = useZoom();
  const { slides, slots, labels, render } = useLightboxContext();

  // Once a slide has been zoomed during its current "current" stint, keep `transition: none`
  // applied even after zoom snaps back to 1 — otherwise the slide-mode `transition: transform`
  // rule would animate the final scale-down over the slide duration. Resets when the slide
  // leaves the current position.
  const [hadZoom, setHadZoom] = useState(false);
  if (current && zoom > 1 && !hadZoom) setHadZoom(true);
  if (!current && hadZoom) setHadZoom(false);

  useIsomorphicLayoutEffect(() => {
    if (!current) {
      // If focus is inside the slide we're about to make inert, the browser would drop it to
      // <body> and break the focus trap. Lift it to the Portal (the nearest `tabindex="-1"`
      // ancestor) first.
      if (ref.current?.contains(document.activeElement)) {
        ref.current.closest<HTMLElement>('[tabindex="-1"]')?.focus();
      }

      // `inert` cannot be set as a JSX prop in a way that works on both React 18 and 19:
      // React 18 strips `inert={true}`; React 19 treats `inert=""` as falsy. Set imperatively.
      ref.current?.setAttribute("inert", "");
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
      data-offset={offset}
      {...mergeSlot(
        slots.slide,
        clsx(cssClass("slide"), current && cssClass("slide_current")),
        current && (zoom > 1 || hadZoom)
          ? {
              transform:
                zoom > 1
                  ? `translateX(${round(offsetX, 3)}px) translateY(${round(offsetY, 3)}px) scale(${round(zoom, 3)})`
                  : undefined,
              // Suppress the slide-transition `transition: transform` so zoom/pan updates don't
              // ride the slide-duration ease-in-out curve — the same `transform` property carries both.
              transition: "none",
            }
          : undefined,
      )}
    >
      {render.slideHeader?.(context)}
      {render.slide?.(context) ??
        (isImageSlide(slide) && <ImageSlide {...(context as typeof context & { slide: SlideImage })} />)}
      {render.slideFooter?.(context)}
    </div>
  );
}
