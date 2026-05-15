import { SlideView } from "./SlideView";
import { useZoom, useZoomInternal } from "./Zoom";
import { useLightboxContext } from "./LightboxContext";
import { clsx, cssClass, isImageSlide, mergeSlot, translateLabel, wrapIndex } from "../utils";

export function Carousel() {
  const { slides, index, slots, labels, carousel } = useLightboxContext();
  const { setCarouselRef } = useZoomInternal();
  const { rect } = useZoom();

  return (
    <div
      ref={setCarouselRef}
      role="region"
      aria-live="polite"
      aria-label={translateLabel(labels, "Photo gallery")}
      aria-roledescription={translateLabel(labels, "Carousel")}
      {...mergeSlot(slots.carousel, clsx(cssClass("carousel"), cssClass(`transition_${carousel.transition}`)))}
    >
      {rect &&
        Array.from({ length: 2 * carousel.preload + 1 }).map((_, i) => {
          const slideIndex = index - carousel.preload + i;
          // keep out-of-bounds indices as-is when not infinite so slides[wrappedIndex] returns undefined
          const wrappedIndex = carousel.infinite ? wrapIndex(slideIndex, slides.length) : slideIndex;
          const slide = slides[wrappedIndex];

          if (!slide) return null;

          return (
            <SlideView
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
