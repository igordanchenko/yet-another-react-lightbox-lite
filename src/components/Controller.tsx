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
  const { slides, index } = useLightboxContext();

  const context = useMemo(() => {
    const prev = () => {
      if (index > 0) {
        setIndex(index - 1);
      }
    };

    const next = () => {
      if (index < slides.length - 1) {
        setIndex(index + 1);
      }
    };

    return { prev, next, close };
  }, [slides.length, index, setIndex, close]);

  useImperativeHandle(ref, () => context, [context]);

  return <ControllerContext.Provider value={context}>{children}</ControllerContext.Provider>;
});

export default Controller;
