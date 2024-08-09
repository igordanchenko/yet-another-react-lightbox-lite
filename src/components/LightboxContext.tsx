import { createContext, PropsWithChildren } from "react";

import { makeUseContext } from "../utils";
import { LightboxProps } from "../types";

type LightboxContextType = Omit<LightboxProps, "index" | "setIndex"> & { index: number };

const LightboxContext = createContext<LightboxContextType | null>(null);

export const useLightboxContext = makeUseContext(LightboxContext);

export default function LightboxContextProvider({ children, ...props }: PropsWithChildren & LightboxContextType) {
  return <LightboxContext.Provider value={props}>{children}</LightboxContext.Provider>;
}
