import { createContext, forwardRef, type PropsWithChildren, useImperativeHandle, useMemo } from "react";

import { useLightboxContext } from "./LightboxContext";
import { useEventCallback } from "../hooks";
import { makeUseContext } from "../utils";
import type { LightboxProps, LightboxRef } from "../types";

type ControllerProps = PropsWithChildren & Pick<LightboxProps, "setIndex"> & Pick<ControllerContextType, "close">;

type ControllerContextType = LightboxRef;

const ControllerContext = createContext<ControllerContextType | null>(null);

export const useController = makeUseContext("useController", ControllerContext);

export const Controller = forwardRef<LightboxRef, ControllerProps>(function Controller(
  { setIndex, close, children },
  ref,
) {
  const {
    slides,
    index,
    carousel: { infinite },
  } = useLightboxContext();

  // When a jump exceeds the preload window in `transition: slide` mode, the target slide
  // mounts fresh (no animation) while any slide that survived from the previous window
  // rides the standing `transition: transform` to its new position. Suppressing that for
  // one frame is possible but costs ~80 bytes of runtime + CSS; the visual quirk is mild
  // and rare enough that we accept it here.
  const goto = useEventCallback((target: number) => {
    if (infinite || (target >= 0 && target < slides.length)) {
      setIndex(target);
    }
  });

  const navigate = (delta: number) => {
    if (slides.length > 1) {
      goto(index + delta);
    }
  };

  const prev = useEventCallback(() => navigate(-1));
  const next = useEventCallback(() => navigate(1));

  const context = useMemo(() => ({ prev, next, goto, close }), [prev, next, goto, close]);

  useImperativeHandle(ref, () => context, [context]);

  return <ControllerContext.Provider value={context}>{children}</ControllerContext.Provider>;
});
