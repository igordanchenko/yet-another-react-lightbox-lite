import { useEffect, useRef } from "react";

import ImageSlide from "./ImageSlide";
import { useZoom, useZoomInternal } from "./Zoom";
import { useLightboxContext } from "./LightboxContext";
import { cssClass, isImageSlide, round } from "../utils";
import { RenderSlideProps, SlideImage } from "../types";

function CarouselSlide({ slide, rect, current }: Pick<RenderSlideProps, "slide" | "rect" | "current">) {
  const ref = useRef<HTMLDivElement | null>(null);

  const { zoom, offsetX, offsetY } = useZoom();
  const { styles, render: { slide: renderSlide, slideHeader, slideFooter } = {} } = useLightboxContext();

  useEffect(() => {
    if (!current && ref.current?.contains(document.activeElement)) {
      ref.current.closest<HTMLElement>('[tabindex="-1"]')?.focus();
    }
  }, [current]);

  const context = { slide, rect, current, zoom: round(current ? zoom : 1, 3) };

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cssClass("slide")}
      hidden={!current}
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
  const { slides, index, styles, carousel: { preload = 2 } = {} } = useLightboxContext();
  const { setCarouselRef } = useZoomInternal();
  const { rect } = useZoom();

  return (
    <div ref={setCarouselRef} style={styles?.carousel} className={cssClass("carousel")}>
      {rect &&
        Array.from({ length: 2 * preload + 1 }).map((_, i) => {
          const slideIndex = index - preload + i;

          if (slideIndex < 0 || slideIndex >= slides.length) return null;

          const slide = slides[slideIndex];

          return (
            <CarouselSlide
              key={slide.key ?? [`${slideIndex}`, isImageSlide(slide) && slide.src].filter(Boolean).join("|")}
              rect={rect}
              slide={slide}
              current={slideIndex === index}
            />
          );
        })}
    </div>
  );
}
