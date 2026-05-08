import { createContext, forwardRef, type PropsWithChildren, useImperativeHandle, useMemo } from "react";

import { useLightboxContext } from "./LightboxContext";
import { makeUseContext } from "../utils";
import type { Callback, LightboxProps, LightboxRef } from "../types";

type ControllerProps = PropsWithChildren & Pick<LightboxProps, "setIndex"> & Pick<ControllerContextType, "close">;

type ControllerContextType = {
  prev: Callback;
  next: Callback;
  close: Callback;
};

const ControllerContext = createContext<ControllerContextType | null>(null);

export const useController = makeUseContext(ControllerContext);

const Controller = forwardRef<LightboxRef, ControllerProps>(function Controller({ setIndex, close, children }, ref) {
  const { slides, index, carousel: { infinite = false } = {} } = useLightboxContext();

  const context = useMemo(() => {
    const navigate = (delta: number) => {
      if (slides.length < 2) return;
      const target = index + delta;
      if (infinite || (target >= 0 && target < slides.length)) {
        setIndex(target);
      }
    };

    return { prev: () => navigate(-1), next: () => navigate(1), close };
  }, [slides.length, index, setIndex, infinite, close]);

  useImperativeHandle(ref, () => context, [context]);

  return <ControllerContext.Provider value={context}>{children}</ControllerContext.Provider>;
});

export default Controller;
