import { useLightboxContext } from "./LightboxContext";
import { cssClass } from "../utils";
import { Rect, SlideImage } from "../types";

type ImageSlideProps = {
  slide: SlideImage;
  rect: Rect;
};

export default function ImageSlide({ slide, rect }: ImageSlideProps) {
  const { styles } = useLightboxContext();

  const { width, height } = slide.srcSet?.[0] ?? slide;
  const imageAspectRatio = width && height ? width / height : undefined;

  const srcSet = slide.srcSet
    ?.sort((a, b) => a.width - b.width)
    .map((image) => `${image.src} ${image.width}w`)
    .join(", ");

  const sizes = imageAspectRatio
    ? `${imageAspectRatio < rect.width / rect.height ? Math.round(imageAspectRatio * rect.height) : rect.width}px`
    : undefined;

  return (
    <img
      draggable={false}
      style={styles?.image}
      className={cssClass("slide_image")}
      // `srcSet` must precede `src` attribute
      srcSet={srcSet}
      sizes={sizes}
      src={slide.src}
      alt={slide.alt}
    />
  );
}
