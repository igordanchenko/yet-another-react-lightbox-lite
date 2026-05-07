import { useEffect, useRef } from "react";

import ImageSlide from "./ImageSlide";
import { useZoom, useZoomInternal } from "./Zoom";
import { useLightboxContext } from "./LightboxContext";
import { clsx, cssClass, isImageSlide, round, translateLabel, translateSlideCounter } from "../utils";
import type { RenderSlideProps, SlideImage } from "../types";

function CarouselSlide({
  slide,
  rect,
  current,
  slideIndex,
}: Pick<RenderSlideProps, "slide" | "rect" | "current" | "slideIndex">) {
  const ref = useRef<HTMLDivElement | null>(null);

  const { zoom, offsetX, offsetY } = useZoom();
  const {
    slides,
    styles,
    labels,
    render: { slide: renderSlide, slideHeader, slideFooter } = {},
  } = useLightboxContext();

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
      style={{
        transform:
          current && zoom > 1
            ? `translateX(${round(offsetX, 3)}px) translateY(${round(offsetY, 3)}px) scale(${round(zoom, 3)})`
            : undefined,
        ...styles?.slide,
      }}
    >
      {slideHeader?.(context)}
      {renderSlide?.(context) ??
        (isImageSlide(slide) && <ImageSlide {...(context as typeof context & { slide: SlideImage })} />)}
      {slideFooter?.(context)}
    </div>
  );
}

export default function Carousel() {
  const { slides, index, styles, labels, carousel: { preload = 2 } = {} } = useLightboxContext();
  const { setCarouselRef } = useZoomInternal();
  const { rect } = useZoom();

  return (
    <div
      ref={setCarouselRef}
      style={styles?.carousel}
      className={cssClass("carousel")}
      role="region"
      aria-live="polite"
      aria-label={translateLabel(labels, "Photo gallery")}
      aria-roledescription={translateLabel(labels, "Carousel")}
    >
      {rect &&
        Array.from({ length: 2 * preload + 1 }).map((_, i) => {
          const slideIndex = index - preload + i;
          const slide = slides[slideIndex];

          if (!slide) return null;

          return (
            <CarouselSlide
              key={slide.key ?? (isImageSlide(slide) ? `${slideIndex}|${slide.src}` : `${slideIndex}`)}
              rect={rect}
              slide={slide}
              slideIndex={slideIndex}
              current={slideIndex === index}
            />
          );
        })}
    </div>
  );
}
