import { useEffect, useState } from "react";

import { useLightboxContext } from "./LightboxContext";
import { cssClass, mergeSlot, round } from "../utils";
import type { Rect, SlideImage } from "../types";

type ImageSlideProps = {
  slide: SlideImage;
  rect: Rect;
  zoom: number;
};

function getImageDimensions(slide: SlideImage, rect: Rect) {
  const { width, height } = slide.srcSet?.[0] || slide;
  if (!width || !height) return [];
  const imageAspectRatio = width / height;
  return imageAspectRatio < rect.width / rect.height
    ? [round(imageAspectRatio * rect.height, 2), rect.height]
    : [rect.width, round(rect.width / imageAspectRatio, 2)];
}

export default function ImageSlide({ slide, rect, zoom }: ImageSlideProps) {
  const [scale, setScale] = useState(1);

  const {
    slots: { image },
  } = useLightboxContext();

  useEffect(() => {
    if (zoom <= scale) return;
    const timeoutId = setTimeout(() => setScale(zoom), 300);
    return () => clearTimeout(timeoutId);
  }, [zoom, scale]);

  const [width, height] = getImageDimensions(slide, rect);
  const sizes = width ? `${round(width * scale, 2)}px` : undefined;
  const srcSet = slide.srcSet?.map((source) => `${source.src} ${source.width}w`).join(", ");

  return (
    <img
      draggable={false}
      // `srcSet` must precede `src` attribute
      srcSet={srcSet}
      sizes={sizes}
      width={width}
      height={height}
      src={slide.src}
      alt={slide.alt ?? ""}
      // mergeSlot is spread last — escape hatch to override any attribute
      {...mergeSlot(typeof image === "function" ? image(slide) : image, cssClass("slide_image"))}
    />
  );
}
