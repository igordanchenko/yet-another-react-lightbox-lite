import type React from "react";

/** Lightbox props */
export interface LightboxProps {
  /** slides to display in the lightbox */
  slides: Slide[];
  /** slide index */
  index: number | undefined;
  /** slide index change callback */
  setIndex: (index: number | undefined) => void;
  /** custom UI labels / translations */
  labels?: Labels;
  /** custom render functions */
  render?: Render;
}

/** Slide */
export type Slide = SlideTypes[SlideTypeKey];

/** Supported slide types */
export interface SlideTypes {
  /** image slide type */
  image: SlideImage;
}

/** Slide type key */
export type SlideTypeKey = keyof SlideTypes;

/** Generic slide */
export interface GenericSlide {
  /** slide key */
  key?: React.Key;
  /** slide type */
  type?: SlideTypeKey;
}

/** Image slide properties */
export interface SlideImage extends GenericSlide {
  /** image slide type */
  type?: "image";
  /** image URL */
  src: string;
  /** image width in pixels */
  width?: number;
  /** image height in pixels */
  height?: number;
  /** image 'alt' attribute */
  alt?: string;
  /** alternative images to be passed to the 'srcSet' */
  srcSet?: ImageSource[];
}

/** Image source */
export interface ImageSource {
  /** image URL */
  src: string;
  /** image width in pixels */
  width: number;
  /** image height in pixels */
  height: number;
}

/** Custom UI labels / translations */
export interface Labels {
  Previous?: string;
  Next?: string;
  Close?: string;
}

/** Label key */
export type Label = keyof Labels;

/** Custom render functions. */
export interface Render {
  /** render custom slide type, or override the default image slide */
  slide?: RenderFunction<RenderSlideProps>;
  /** render custom elements above each slide */
  slideHeader?: RenderFunction<RenderSlideProps>;
  /** render custom elements below or over each slide */
  slideFooter?: RenderFunction<RenderSlideProps>;
  /** render custom controls or additional elements in the lightbox (use absolute positioning) */
  controls?: RenderFunction;
  /** render custom Prev icon */
  iconPrev?: RenderFunction;
  /** render custom Next icon */
  iconNext?: RenderFunction;
  /** render custom Close icon */
  iconClose?: RenderFunction;
}

/** `render.slide` render function props */
export interface RenderSlideProps {
  /** slide */
  slide: Slide;
  /** slide */
  rect: Rect;
  /** if `true`, the slide is the current slide in the viewport */
  current: boolean;
}

/** Rect */
export type Rect = {
  width: number;
  height: number;
};

/** Generic callback function */
export type Callback<T = void> = () => T;

/** Render function */
export type RenderFunction<T = void> = [T] extends [void] ? () => React.ReactNode : (props: T) => React.ReactNode;
