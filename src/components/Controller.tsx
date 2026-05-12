import { createContext, forwardRef, type PropsWithChildren, useImperativeHandle, useMemo } from "react";

import { useLightboxContext } from "./LightboxContext";
import { useEventCallback } from "./useEventCallback";
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

  const navigate = (delta: number) => {
    if (slides.length < 2) return;
    const target = index + delta;
    if (infinite || (target >= 0 && target < slides.length)) {
      setIndex(target);
    }
  };

  const prev = useEventCallback(() => navigate(-1));
  const next = useEventCallback(() => navigate(1));

  const context = useMemo(() => ({ prev, next, close }), [prev, next, close]);

  useImperativeHandle(ref, () => context, [context]);

  return <ControllerContext.Provider value={context}>{children}</ControllerContext.Provider>;
});
