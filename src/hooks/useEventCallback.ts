import { useCallback, useRef } from "react";

import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

export function useEventCallback<Args extends unknown[], Return>(fn: (...args: Args) => Return) {
  const ref = useRef(fn);
  useIsomorphicLayoutEffect(() => {
    ref.current = fn;
  });
  return useCallback((...args: Args) => ref.current(...args), []);
}
