import { createContext, PropsWithChildren } from "react";

import { makeUseContext } from "../utils";
import { LightboxProps } from "../types";

type LightboxContextType = Omit<LightboxProps, "index" | "setIndex"> & { index: number };

const LightboxContext = createContext<LightboxContextType | null>(null);

export const useLightboxContext = makeUseContext(LightboxContext);

// Intentionally not memoizing the context value — most props are objects that
// consumers pass as inline literals, so deps would change on every render anyway.
export default function LightboxContextProvider({ children, ...props }: PropsWithChildren & LightboxContextType) {
  return <LightboxContext.Provider value={props}>{children}</LightboxContext.Provider>;
}
