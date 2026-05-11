import { forwardRef, useCallback, useState } from "react";

import { Carousel, Controller, LightboxContext, Navigation, Portal, Toolbar, Zoom } from "./components";
import type { LightboxPhase, LightboxProps, LightboxRef, ResolvedLightboxProps } from "./types";

function resolveProps(props: LightboxProps): ResolvedLightboxProps {
  const { slides, index, labels, styles, carousel, controller, render, toolbar, zoom } = props;

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
    },
    labels: labels ?? {},
    styles: styles ?? {},
    render: render ?? {},
    toolbar: toolbar ?? {},
  };
}

/** Lightbox component */
const Lightbox = forwardRef<LightboxRef, LightboxProps>(function Lightbox(props, ref) {
  const { slides, index, setIndex, ...rest } = resolveProps(props);

  const [phase, setPhase] = useState<LightboxPhase>(() => (index !== undefined ? "open" : "closed"));

  if (index !== undefined && phase === "closed") {
    setPhase("open");
  } else if (index === undefined && phase !== "closed") {
    setPhase("closed");
  }

  const close = useCallback(() => setPhase("closing"), []);
  const onClosed = useCallback(() => setIndex(undefined), [setIndex]);

  if (phase === "closed" || index === undefined) return null;

  return (
    <LightboxContext {...{ slides, index, ...rest }}>
      <Controller {...{ ref, setIndex, close }}>
        <Zoom>
          <Portal {...{ phase, onClosed }}>
            <Toolbar />
            <Carousel />
            <Navigation />
          </Portal>
        </Zoom>
      </Controller>
    </LightboxContext>
  );
});

export default Lightbox;
