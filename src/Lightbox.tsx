import { forwardRef, useCallback, useState } from "react";

import { Carousel, Controller, LightboxContextProvider, Navigation, Portal, Toolbar, Zoom } from "./components";
import { resolveProps } from "./props";
import type { LightboxPhase, LightboxProps, LightboxRef } from "./types";

/** Lightbox component */
export const Lightbox = forwardRef<LightboxRef, LightboxProps>(function Lightbox(props, ref) {
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
    <LightboxContextProvider {...{ slides, index, ...rest }}>
      <Controller {...{ ref, setIndex, close }}>
        <Zoom>
          <Portal {...{ phase, onClosed }}>
            <Toolbar />
            <Carousel />
            <Navigation />
          </Portal>
        </Zoom>
      </Controller>
    </LightboxContextProvider>
  );
});
