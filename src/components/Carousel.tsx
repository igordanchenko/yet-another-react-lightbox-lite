import { useCallback, useRef, useState } from "react";

import { useLightboxContext } from "./LightboxContext";
import ImageSlide from "./ImageSlide";
import { cssClass } from "../utils";
import { Rect } from "../types";

export default function Carousel() {
  const { slides, index, styles, render: { slide: renderSlide, slideHeader, slideFooter } = {} } = useLightboxContext();

  const [rect, setRect] = useState<Rect>();
  const observer = useRef<ResizeObserver>();

  const handleRef = useCallback((node: HTMLDivElement | null) => {
    observer.current?.disconnect();
    observer.current = undefined;

    const updateRect = () => setRect(node ? { width: node.clientWidth, height: node.clientHeight } : undefined);

    if (node && typeof ResizeObserver !== "undefined") {
      observer.current = new ResizeObserver(updateRect);
      observer.current.observe(node);
    } else {
      updateRect();
    }
  }, []);

  return (
    <div ref={handleRef} style={styles?.carousel} className={cssClass("carousel")}>
      {rect &&
        Array.from({ length: 5 }).map((_, i) => {
          const slideIndex = index - 2 + i;

          if (slideIndex < 0 || slideIndex >= slides.length) return null;

          const slide = slides[slideIndex];
          const current = slideIndex === index;
          const context = { slide, rect, current };

          return (
            <div
              key={slide.key ?? `${slideIndex}-${slide.src}`}
              role="group"
              aria-roledescription="slide"
              className={cssClass("slide")}
              hidden={!current}
              style={styles?.slide}
            >
              {slideHeader?.(context)}
              {renderSlide?.(context) ?? <ImageSlide {...context} />}
              {slideFooter?.(context)}
            </div>
          );
        })}
    </div>
  );
}
