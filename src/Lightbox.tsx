import { forwardRef, useCallback, useState } from "react";

import {
  Carousel,
  Controller,
  LightboxContextProvider,
  Navigation,
  Portal,
  type PortalState,
  Toolbar,
  Zoom,
} from "./components";
import { resolveProps } from "./props";
import type { LightboxProps, LightboxRef } from "./types";

/** Lightbox component */
export const Lightbox = forwardRef<LightboxRef, LightboxProps>(function Lightbox(props, ref) {
  const { slides, index, setIndex, ...rest } = resolveProps(props);

  const [state, setState] = useState<PortalState>(() => (index !== undefined ? "open" : "closed"));

  if (index !== undefined && state === "closed") {
    setState("open");
  } else if (index === undefined && state !== "closed") {
    setState("closed");
  }

  const close = useCallback(() => setState("closing"), []);
  const onClosed = useCallback(() => setIndex(undefined), [setIndex]);

  if (state === "closed" || index === undefined) return null;

  return (
    <LightboxContextProvider {...{ slides, index, ...rest }}>
      <Controller {...{ ref, setIndex, close }}>
        <Zoom>
          <Portal {...{ state, onClosed }}>
            <Toolbar />
            <Carousel />
            <Navigation />
          </Portal>
        </Zoom>
      </Controller>
    </LightboxContextProvider>
  );
});
