import { createContext, type PropsWithChildren, useMemo } from "react";

import { useLightboxContext } from "./LightboxContext";
import { makeUseContext, transition } from "../utils";
import type { Callback, LightboxProps } from "../types";

type ControllerProps = PropsWithChildren & Pick<LightboxProps, "setIndex"> & Pick<ControllerContextType, "close">;

type ControllerContextType = {
  prev: Callback;
  next: Callback;
  close: Callback;
};

const ControllerContext = createContext<ControllerContextType | null>(null);

export const useController = makeUseContext(ControllerContext);

export default function Controller({ setIndex, close, children }: ControllerProps) {
  const { slides, index } = useLightboxContext();

  const context = useMemo(() => {
    const prev = () => {
      if (index > 0) {
        transition(() => setIndex(index - 1));
      }
    };

    const next = () => {
      if (index < slides.length - 1) {
        transition(() => setIndex(index + 1));
      }
    };

    return { prev, next, close };
  }, [slides.length, index, setIndex, close]);

  return <ControllerContext.Provider value={context}>{children}</ControllerContext.Provider>;
}
