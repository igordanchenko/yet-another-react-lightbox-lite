import { ComponentProps, CSSProperties, Dispatch, Key, ReactNode, SetStateAction } from "react";

/** Lightbox props */
export interface LightboxProps {
  /** slides to display in the lightbox */
  slides: Slide[];
  /** slide index */
  index: number | undefined;
  /** slide index change callback */
  setIndex: Dispatch<SetStateAction<number | undefined>>;
  /** custom UI labels / translations */
  labels?: Labels;
  /** custom render functions */
  render?: Render;
  /** toolbar settings */
  toolbar?: ToolbarSettings;
  /** carousel settings */
  carousel?: CarouselSettings;
  /** controller settings */
  controller?: ControllerSettings;
  /** zoom settings */
  zoom?: ZoomSettings;
  /** customization slots styles */
  styles?: SlotStyles;
  /** CSS class of the lightbox root element */
  className?: string;
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
  key?: Key;
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
  /** `Previous` button title */
  Previous?: string;
  /** `Next` button title */
  Next?: string;
  /** `Close` button title */
  Close?: string;
  /** Lightbox ARIA label */
  Lightbox?: string;
  /** Carousel ARIA role description */
  Carousel?: string;
  /** Slide ARIA role description */
  Slide?: string;
  /** Carousel ARIA label */
  "Photo gallery"?: string;
  /**
   * Slide ARIA label
   *
   * The value is a template string supporting the following placeholders:
   * - {index} - current slide index
   * - {total} - total number of slides
   */
  "{index} of {total}"?: string;
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
  /** slide rect size */
  rect: Rect;
  /** zoom level */
  zoom: number;
  /** if `true`, the slide is the current slide in the viewport */
  current: boolean;
  /** slide index */
  slideIndex: number;
}

/** Toolbar settings */
export interface ToolbarSettings {
  /** custom toolbar buttons */
  buttons?: ReactNode[];
  /** if `true`, the toolbar is positioned statically above the carousel */
  fixed?: boolean;
}

/** Carousel settings */
export interface CarouselSettings {
  /** the lightbox preloads (2 * preload + 1) slides */
  preload?: number;
  /** custom image slide attributes */
  imageProps?: ComponentProps<"img">;
}

/** Controller settings */
export interface ControllerSettings {
  /** if `true`, close the lightbox on pull-up gesture (default: `true`) */
  closeOnPullUp?: boolean;
  /** if `true`, close the lightbox on pull-down gesture (default: `true`) */
  closeOnPullDown?: boolean;
  /** if `true`, close the lightbox when the backdrop is clicked (default: `true`) */
  closeOnBackdropClick?: boolean;
}

/** Zoom settings */
export interface ZoomSettings {
  /** disable zoom on image slides */
  disabled?: boolean;
  /** zoom-enabled custom slide types */
  supports?: SlideTypeKey[];
}

/** Customization slots */
export interface SlotType {
  /** lightbox portal (root) customization slot */
  portal: "portal";
  /** lightbox carousel customization slot */
  carousel: "carousel";
  /** lightbox slide customization slot */
  slide: "slide";
  /** lightbox slide image customization slot */
  image: "image";
  /** lightbox toolbar customization slot */
  toolbar: "toolbar";
  /** lightbox button customization slot */
  button: "button";
  /** lightbox icon customization slot */
  icon: "icon";
}

/** Customization slots */
export type Slot = SlotType[keyof SlotType];

/** Customization slot CSS properties */
interface SlotCSSProperties extends CSSProperties {
  [key: `--yarll__${string}`]: string | number;
}

/** Customization slots styles */
export type SlotStyles = {
  [key in Slot]?: SlotCSSProperties;
};

/** Rect */
export type Rect = {
  /** rect width */
  width: number;
  /** rect height */
  height: number;
};

/** Generic callback function */
export type Callback<T = void> = () => T;

/** Render function */
export type RenderFunction<T = void> = [T] extends [void] ? () => ReactNode : (props: T) => ReactNode;
