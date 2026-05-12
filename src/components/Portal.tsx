import { type PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useSensors } from "./useSensors";
import { useLightboxContext } from "./LightboxContext";
import { clsx, cssClass, cssVar, getChildren, isInteractiveTarget, mergeSlot, translateLabel } from "../utils";

/** Portal lifecycle state */
export type PortalState = "open" | "closing" | "closed";

type PortalProps = PropsWithChildren & {
  state: PortalState;
  onClosed: () => void;
};

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

export function Portal({ state, onClosed, children }: PortalProps) {
  const { labels, slots } = useLightboxContext();

  const [mounted, setMounted] = useState(false);

  const cleanup = useRef<(() => void)[]>([]);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  const sensors = useSensors();

  const handleCleanup = useCallback(() => {
    cleanup.current.forEach((cleaner) => cleaner());
    cleanup.current = [];
  }, []);

  useEffect(() => {
    const property = cssVar("scrollbar_width");
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    if (scrollbarWidth > 0) {
      document.documentElement.style.setProperty(property, `${scrollbarWidth}px`);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- false-positive lint
    setMounted(true);

    return () => {
      // Tied to the component's mount lifecycle rather than the closing-phase cleanup:
      // the scrollbar-width compensation must stay applied through the fade-out so the
      // body padding doesn't snap away mid-transition. It's only safe to remove once
      // the portal has fully unmounted.
      document.documentElement.style.removeProperty(property);
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    if (state !== "closing") return undefined;

    // Restore inert/aria-hidden/focus immediately on closing so they take effect
    // before the fade-out completes, then wait for the transition before unmounting.
    handleCleanup();

    // transitionDuration can be a comma-separated list (e.g., "0.3s, 0.5s"), pick the longest
    const duration =
      (portalRef.current &&
        Math.max(...getComputedStyle(portalRef.current).transitionDuration.split(",").map(parseFloat)) * 1_000) ||
      0;

    const timeout = setTimeout(onClosed, duration);

    return () => clearTimeout(timeout);
  }, [state, handleCleanup, onClosed]);

  const handleRef = useCallback(
    (node: HTMLDivElement | null) => {
      portalRef.current = node;

      if (node) {
        // transfer focus and force layout reflow
        node.focus();

        // prevent the default touchpad / touchscreen overscroll behavior
        // this has to be done via non-passive native event handler
        const preventWheelDefaults = (event: WheelEvent) => {
          // skip the opt-out subtree so wheel scrolling reaches native scrollers
          // (textareas, overflow containers) inside `.yarll__interactive`
          if (isInteractiveTarget(event.target)) return;
          event.preventDefault();
        };
        node.addEventListener("wheel", preventWheelDefaults, { passive: false });
        cleanup.current.push(() => {
          node.removeEventListener("wheel", preventWheelDefaults);
        });

        // mark portal siblings inert
        for (const element of getChildren(node.parentElement)) {
          if (!["TEMPLATE", "SCRIPT", "STYLE"].includes(element.tagName) && element !== node) {
            cleanup.current.push(setAttribute(element, "inert", ""));
            cleanup.current.push(setAttribute(element, "aria-hidden", "true"));
          }
        }

        cleanup.current.push(() => {
          restoreFocus.current?.focus?.();
          restoreFocus.current = null;
        });
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
          onFocus={(event) => {
            if (!restoreFocus.current) {
              restoreFocus.current = event.relatedTarget as HTMLElement | null;
            }
          }}
          {...sensors}
          {...mergeSlot(slots.portal, clsx(cssClass("portal"), state !== "open" && cssClass("portal_closed")))}
        >
          {children}
        </div>,
        document.body,
      )
    : null;
}
