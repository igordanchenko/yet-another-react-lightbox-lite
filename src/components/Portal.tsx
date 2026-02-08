import { PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import useSensors from "./useSensors";
import { useController } from "./Controller";
import { useLightboxContext } from "./LightboxContext";
import { clsx, cssClass, cssVar, getChildren, translateLabel } from "../utils";
import { Callback } from "../types";

function setAttribute(element: Element, attribute: string, value: string) {
  const previousValue = element.getAttribute(attribute);

  element.setAttribute(attribute, value);

  return () => {
    if (previousValue !== null) {
      element.setAttribute(attribute, previousValue);
    } else {
      element.removeAttribute(attribute);
    }
  };
}

export default function Portal({ children }: PropsWithChildren) {
  const { labels, styles, className } = useLightboxContext();

  const cleanup = useRef<Callback[]>([]);

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const portalRef = useRef<HTMLDivElement | null>(null);
  const onTransitionEnd = useRef<() => void>(undefined);
  const restoreFocus = useRef<HTMLElement | null>(null);

  const sensors = useSensors();
  const { addExitHook } = useController();

  const handleCleanup = useCallback(() => {
    cleanup.current.forEach((cleaner) => cleaner());
    cleanup.current = [];
  }, []);

  useEffect(
    () =>
      addExitHook(
        () =>
          new Promise((resolve) => {
            // transitionDuration can be a comma-separated list (e.g., "0.3s, 0.5s"), pick the longest
            const transitionDuration =
              (portalRef.current &&
                Math.max(...getComputedStyle(portalRef.current).transitionDuration.split(",").map(parseFloat)) *
                  1_000) ||
              0;

            const done = () => {
              onTransitionEnd.current = undefined;
              resolve();
            };

            // fallback timeout in case the transitionend event doesn't fire
            // (e.g., prefers-reduced-motion, custom styles, or browser quirks)
            const timeout = setTimeout(done, transitionDuration + 100);

            onTransitionEnd.current = () => {
              clearTimeout(timeout);
              done();
            };

            handleCleanup();

            setVisible(false);
          }),
      ),
    [addExitHook, handleCleanup],
  );

  useEffect(() => {
    const property = cssVar("scrollbar-width");
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    if (scrollbarWidth === 0) return;

    document.documentElement.style.setProperty(property, `${scrollbarWidth}px`);

    return () => {
      document.documentElement.style.removeProperty(property);
    };
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- false-positive lint
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleRef = useCallback(
    (node: HTMLDivElement | null) => {
      portalRef.current = node;

      if (node) {
        // transfer focus and force layout reflow
        node.focus();

        // prevent the default touchpad / touchscreen overscroll behavior
        // this has to be done via non-passive native event handler
        const preventWheelDefaults = (event: WheelEvent) => event.preventDefault();
        node.addEventListener("wheel", preventWheelDefaults, { passive: false });
        cleanup.current.push(() => {
          node.removeEventListener("wheel", preventWheelDefaults);
        });

        // mark portal siblings inert
        const elements = getChildren(node.parentElement);
        for (let i = 0; i < elements.length; i += 1) {
          const element = elements[i];
          if (!["TEMPLATE", "SCRIPT", "STYLE"].includes(element.tagName) && element !== node) {
            cleanup.current.push(setAttribute(element, "inert", ""));
            cleanup.current.push(setAttribute(element, "aria-hidden", "true"));
          }
        }

        cleanup.current.push(() => {
          restoreFocus.current?.focus?.();
          restoreFocus.current = null;
        });

        setVisible(true);
      } else {
        handleCleanup();
      }
    },
    [handleCleanup],
  );

  return mounted
    ? createPortal(
        <div
          aria-modal
          role="dialog"
          aria-label={translateLabel(labels, "Lightbox")}
          tabIndex={-1}
          ref={handleRef}
          style={styles?.portal}
          className={clsx(cssClass("portal"), !visible && cssClass("portal_closed"), className)}
          onTransitionEnd={() => onTransitionEnd.current?.()}
          onFocus={(event) => {
            if (!restoreFocus.current) {
              restoreFocus.current = event.relatedTarget as HTMLElement | null;
            }
          }}
          {...sensors}
        >
          {children}
        </div>,
        document.body,
      )
    : null;
}
