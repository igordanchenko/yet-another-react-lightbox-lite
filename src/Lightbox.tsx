import { forwardRef, useCallback, useState } from "react";

import { Carousel, Controller, LightboxContext, Navigation, Portal, Toolbar, Zoom } from "./components";
import type { LightboxPhase, LightboxProps, LightboxRef } from "./types";

function resolveProps(props: LightboxProps) {
  if (!Array.isArray(props.slides) || props.slides.length === 0) {
    return { ...props, index: undefined };
  }

  const { slides, index, carousel } = props;

  return {
    ...props,
    // Out-of-range index closes the lightbox — except in infinite mode, where index is
    // allowed to drift outside [0, slides.length) to encode navigation direction across wraps.
    index: index !== undefined && (carousel?.infinite || (index >= 0 && index < slides.length)) ? index : undefined,
    // In infinite mode, cap preload so 2*preload+1 ≤ slides.length where possible —
    // rendering more slots than slides only produces duplicate slides in the window.
    carousel: carousel?.infinite
      ? { ...carousel, preload: Math.min(carousel.preload ?? 2, Math.floor(slides.length / 2)) }
      : carousel,
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
