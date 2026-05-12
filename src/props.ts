import type { CarouselSettings, ControllerSettings, LightboxProps, ZoomSettings } from "./types";

type WithRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/** Lightbox props with defaults filled in */
export type ResolvedLightboxProps = WithRequired<LightboxProps, "labels" | "render" | "slots" | "toolbar"> & {
  carousel: WithRequired<CarouselSettings, "infinite" | "preload" | "transition">;
  controller: Required<ControllerSettings>;
  zoom: Required<ZoomSettings>;
};

export function resolveProps(props: LightboxProps): ResolvedLightboxProps {
  const { slides, index, labels, slots, carousel, controller, render, toolbar, zoom } = props;

  const validSlides = Array.isArray(slides) && slides.length > 0;
  const infinite = carousel?.infinite ?? false;
  const preload = carousel?.preload ?? 2;

  return {
    ...props,
    // Out-of-range index closes the lightbox — except in infinite mode, where index is
    // allowed to drift outside [0, slides.length) to encode navigation direction across wraps.
    index:
      validSlides && index !== undefined && (infinite || (index >= 0 && index < slides.length)) ? index : undefined,
    carousel: {
      ...carousel,
      // In infinite mode, cap preload so 2*preload+1 ≤ slides.length where possible —
      // rendering more slots than slides only produces duplicate slides in the window.
      preload: validSlides && infinite ? Math.min(preload, Math.floor(slides.length / 2)) : preload,
      transition: carousel?.transition ?? "fade",
      infinite,
    },
    controller: {
      closeOnEscape: controller?.closeOnEscape ?? true,
      closeOnPullUp: controller?.closeOnPullUp ?? true,
      closeOnPullDown: controller?.closeOnPullDown ?? true,
      closeOnBackdropClick: controller?.closeOnBackdropClick ?? true,
    },
    zoom: {
      supports: zoom?.supports ?? ["image"],
      maxZoom: zoom?.maxZoom ?? 8,
    },
    labels: labels ?? {},
    slots: slots ?? {},
    render: render ?? {},
    toolbar: toolbar ?? {},
  };
}
