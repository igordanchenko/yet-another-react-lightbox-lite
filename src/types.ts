import type { ComponentProps, CSSProperties, Key, ReactNode } from "react";

/** Lightbox props */
export interface LightboxProps {
  /** slides to display in the lightbox */
  slides: readonly Slide[];
  /** slide index */
  index: number | undefined;
  /** slide index change callback */
  setIndex: (index: number | undefined) => void;
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
  /** customization slots — override HTML attributes (including className and style) on the lightbox elements */
  slots?: Slots;
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
  srcSet?: readonly ImageSource[];
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

/**
 * Registry of typed label keys. Declaration-merge to register your own keys
 * for autocomplete in `IconButton.label` and the `labels` prop:
 *
 * ```ts
 * declare module "yet-another-react-lightbox-lite" {
 *   interface LabelRegistry {
 *     Download?: string;
 *   }
 * }
 * ```
 *
 * Arbitrary string labels still work without merging — registration only adds
 * autocomplete.
 */
export interface LabelRegistry {
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

/** Custom UI labels / translations — known keys plus any custom string */
export type Labels = LabelRegistry & Record<string, string | undefined>;

/** Label key — accepts a known `Labels` key (with autocomplete) or any custom string */
export type Label = keyof LabelRegistry | (string & {});

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
  /**
   * Index of this slide within the `slides` array (always in `[0, slides.length)`).
   *
   * Not the same as the controlled `index` prop:
   * - For preloaded neighbors, it points to a neighbor, not the current slide.
   * - In `infinite` mode, the controlled `index` is allowed to drift outside
   *   `[0, slides.length)` to encode navigation direction; `slideIndex` is the
   *   wrapped position you can safely use to look the slide up in `slides`.
   */
  slideIndex: number;
}

/** Toolbar settings */
export interface ToolbarSettings {
  /** custom toolbar buttons */
  buttons?: readonly ReactNode[];
  /** if `true`, the toolbar is positioned statically above the carousel */
  fixed?: boolean;
}

/** Carousel settings */
export interface CarouselSettings {
  /** the lightbox preloads (2 * preload + 1) slides */
  preload?: number;
  /** if `true`, the carousel wraps around from the last slide to the first and vice versa (default: `false`) */
  infinite?: boolean;
  /** Slide transition effect (default: `"fade"`) */
  transition?: "fade" | "slide" | "none" | (string & {});
}

/** Controller settings */
export interface ControllerSettings {
  /** if `true`, close the lightbox on Escape key press (default: `true`) */
  closeOnEscape?: boolean;
  /** if `true`, close the lightbox on pull-up gesture (default: `true`) */
  closeOnPullUp?: boolean;
  /** if `true`, close the lightbox on pull-down gesture (default: `true`) */
  closeOnPullDown?: boolean;
  /** if `true`, close the lightbox when the backdrop is clicked (default: `true`) */
  closeOnBackdropClick?: boolean;
}

/** Zoom settings */
export interface ZoomSettings {
  /** slide types that support zoom (default: `["image"]`) */
  supports?: readonly SlideTypeKey[];
  /** maximum zoom level (default: `8`) */
  maxZoom?: number;
}

/** CSS properties of a customization slot, including typed `--yarll__*` CSS variables */
interface SlotStyle extends CSSProperties {
  [key: `--yarll__${string}`]: string | number;
}

/**
 * Customization slot props — HTML attributes of the slot element with typed `style`.
 * `children`, `key`, `ref`, and `dangerouslySetInnerHTML` are excluded — they clobber
 * the lightbox subtree or are silently dropped on spread, and have no slot use case.
 */
type SlotProps<T> = Omit<T, "children" | "dangerouslySetInnerHTML" | "key" | "ref" | "style"> & {
  style?: SlotStyle;
};

/** Customization slots */
export type Slots = {
  /** lightbox portal (root) */
  portal?: SlotProps<ComponentProps<"div">>;
  /** lightbox carousel */
  carousel?: SlotProps<ComponentProps<"div">>;
  /** lightbox toolbar */
  toolbar?: SlotProps<ComponentProps<"div">>;
  /** lightbox button (Close, Previous, Next, and any toolbar buttons rendered through the same component) */
  button?: SlotProps<ComponentProps<"button">>;
  /** lightbox icon (svg) */
  icon?: SlotProps<ComponentProps<"svg">>;
  /** lightbox slide wrapper */
  slide?: SlotProps<ComponentProps<"div">>;
  /** lightbox slide image — object form, or function that receives the slide and returns props */
  image?: SlotProps<ComponentProps<"img">> | ((slide: SlideImage) => SlotProps<ComponentProps<"img">>);
};

/** Rect */
export type Rect = {
  /** rect width */
  width: number;
  /** rect height */
  height: number;
};

/** Render function */
export type RenderFunction<T = void> = [T] extends [void] ? () => ReactNode : (props: T) => ReactNode;

/** Lightbox imperative handle */
export interface LightboxRef {
  /** navigate to the previous slide */
  prev: () => void;
  /** navigate to the next slide */
  next: () => void;
  /** trigger animated close */
  close: () => void;
}
