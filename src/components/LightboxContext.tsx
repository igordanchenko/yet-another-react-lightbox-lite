import { createContext, type PropsWithChildren } from "react";

import { makeUseContext } from "../utils";
import type { ResolvedLightboxProps } from "../types";

type LightboxContextType = Omit<ResolvedLightboxProps, "setIndex"> & { index: number };

const LightboxContext = createContext<LightboxContextType | null>(null);

export const useLightboxContext = makeUseContext("useLightboxContext", LightboxContext);

// Intentionally not memoizing the context value — most props are objects that
// consumers pass as inline literals, so deps would change on every render anyway.
export default function LightboxContextProvider({ children, ...props }: PropsWithChildren & LightboxContextType) {
  return <LightboxContext.Provider value={props}>{children}</LightboxContext.Provider>;
}
