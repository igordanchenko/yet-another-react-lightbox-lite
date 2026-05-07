import { forwardRef, useCallback, useState } from "react";

import { Carousel, Controller, LightboxContext, Navigation, Portal, Toolbar, Zoom } from "./components";
import type { LightboxPhase, LightboxProps, LightboxRef } from "./types";

/** Lightbox component */
const Lightbox = forwardRef<LightboxRef, LightboxProps>(function Lightbox(
  { slides, index: indexProp, setIndex, ...rest },
  ref,
) {
  const index =
    Array.isArray(slides) && indexProp !== undefined && indexProp >= 0 && indexProp < slides.length ? indexProp : null;

  const [phase, setPhase] = useState<LightboxPhase>(() => (index !== null ? "open" : "closed"));

  if (index !== null && phase === "closed") {
    setPhase("open");
  } else if (index === null && phase !== "closed") {
    setPhase("closed");
  }

  const close = useCallback(() => setPhase("closing"), []);
  const onClosed = useCallback(() => setIndex(undefined), [setIndex]);

  if (phase === "closed" || index === null) return null;

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
