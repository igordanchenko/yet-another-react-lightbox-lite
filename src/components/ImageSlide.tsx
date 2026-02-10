import { useEffect, useState } from "react";

import { useLightboxContext } from "./LightboxContext";
import { cssClass, round } from "../utils";
import type { Rect, SlideImage } from "../types";

type ImageSlideProps = {
  slide: SlideImage;
  rect: Rect;
  zoom: number;
};

function getImageDimensions(slide: SlideImage, rect: Rect) {
  const { width, height } = slide.srcSet?.[0] || slide;
  const imageAspectRatio = width && height ? width / height : undefined;
  const rectAspectRatio = rect.width / rect.height;

  return imageAspectRatio
    ? [
        round(imageAspectRatio < rectAspectRatio ? imageAspectRatio * rect.height : rect.width, 2),
        round(imageAspectRatio > rectAspectRatio ? rect.width / imageAspectRatio : rect.height, 2),
      ]
    : [];
}

export default function ImageSlide({ slide, rect, zoom }: ImageSlideProps) {
  const [scale, setScale] = useState(1);

  const { carousel: { imageProps: imagePropsParam } = {}, styles } = useLightboxContext();

  const imageProps = typeof imagePropsParam === "function" ? imagePropsParam(slide) : imagePropsParam;

  useEffect(() => {
    if (zoom <= scale) return;

    const timeoutId = setTimeout(() => {
      setScale(zoom);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [zoom, scale]);

  const srcSet = slide.srcSet
    ?.slice()
    .sort((a, b) => a.width - b.width)
    .map((image) => `${image.src} ${image.width}w`)
    .join(", ");

  const [width, height] = getImageDimensions(slide, rect);

  const sizes = width ? `${round(width * scale, 2)}px` : undefined;

  return (
    <img
      draggable={false}
      style={styles?.image}
      className={cssClass("slide_image")}
      // `srcSet` must precede `src` attribute
      srcSet={srcSet}
      sizes={sizes}
      width={width}
      height={height}
      src={slide.src}
      alt={slide.alt ?? ""}
      // intentionally spread last — escape hatch to override any attribute
      {...imageProps}
    />
  );
}
