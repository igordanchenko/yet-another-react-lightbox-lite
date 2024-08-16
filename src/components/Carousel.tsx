import { useZoom } from "./Zoom";
import { useLightboxContext } from "./LightboxContext";
import ImageSlide from "./ImageSlide";
import { cssClass, isImageSlide, round } from "../utils";
import { SlideImage } from "../types";

export default function Carousel() {
  const { slides, index, styles, render: { slide: renderSlide, slideHeader, slideFooter } = {} } = useLightboxContext();
  const { rect, zoom, offsetX, offsetY, setCarouselRef } = useZoom();

  return (
    <div ref={setCarouselRef} style={styles?.carousel} className={cssClass("carousel")}>
      {rect &&
        Array.from({ length: 5 }).map((_, i) => {
          const slideIndex = index - 2 + i;

          if (slideIndex < 0 || slideIndex >= slides.length) return null;

          const slide = slides[slideIndex];
          const current = slideIndex === index;
          const context = { slide, rect, current, zoom: round(current ? zoom : 1, 3) };

          return (
            <div
              key={slide.key ?? `${slideIndex}-${isImageSlide(slide) ? slide.src : undefined}`}
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
        })}
    </div>
  );
}
