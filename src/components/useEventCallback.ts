import { useCallback, useLayoutEffect, useRef } from "react";

export default function useEventCallback<Args extends unknown[], Return>(fn: (...args: Args) => Return) {
  const ref = useRef(fn);
  useLayoutEffect(() => {
    ref.current = fn;
  });
  return useCallback((...args: Args) => ref.current(...args), []);
}
