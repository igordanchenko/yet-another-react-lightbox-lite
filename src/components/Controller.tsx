import { createContext, PropsWithChildren, useMemo, useRef } from "react";

import { useLightboxContext } from "./LightboxContext";
import { makeUseContext, transition } from "../utils";
import { Callback, LightboxProps } from "../types";

type ControllerProps = PropsWithChildren & Pick<LightboxProps, "setIndex">;

type ExitHook = Callback<Promise<void> | void>;

type ControllerContextType = {
  close: Callback;
  prev: Callback;
  next: Callback;
  addExitHook: (hook: ExitHook) => Callback;
};

const ControllerContext = createContext<ControllerContextType | null>(null);

export const useController = makeUseContext(ControllerContext);

export default function Controller({ setIndex, children }: ControllerProps) {
  const { slides, index } = useLightboxContext();

  const exitHooks = useRef<ExitHook[]>([]);

  const context = useMemo(() => {
    const prev = () => {
      transition(() => setIndex(index === 0 ? slides.length - 1 : index - 1));
    };

    const next = () => {
      transition(() => setIndex(index === slides.length - 1 ? 0 : index + 1));
    };

    const close = () => {
      Promise.all(exitHooks.current.map((hook) => hook()))
        .catch(() => {})
        .then(() => {
          exitHooks.current = [];
          setIndex(-1);
        });
    };

    const addExitHook = (hook: ExitHook) => {
      exitHooks.current.push(hook);

      return () => {
        exitHooks.current.splice(exitHooks.current.indexOf(hook), 1);
      };
    };

    return { prev, next, close, addExitHook };
  }, [slides.length, index, setIndex]);

  return <ControllerContext.Provider value={context}>{children}</ControllerContext.Provider>;
}
