import { createContext, type PropsWithChildren } from "react";

import type { ResolvedLightboxProps } from "../props";
import { makeUseContext } from "../utils";

type LightboxContextType = Omit<ResolvedLightboxProps, "setIndex"> & { index: number };

const LightboxContext = createContext<LightboxContextType | null>(null);

export const useLightboxContext = makeUseContext("useLightboxContext", LightboxContext);

// Intentionally not memoizing the context value — most props are objects that
// consumers pass as inline literals, so deps would change on every render anyway.
export function LightboxContextProvider({ children, ...props }: PropsWithChildren & LightboxContextType) {
  return <LightboxContext.Provider value={props}>{children}</LightboxContext.Provider>;
}
