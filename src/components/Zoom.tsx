import type { MouseEvent, PropsWithChildren, RefCallback } from "react";
import { createContext, useCallback, useMemo, useRef, useState } from "react";

import { useLightboxContext } from "./LightboxContext";
import { useEventCallback, useIsomorphicLayoutEffect } from "../hooks";
import { cssClass, getChildren, makeUseContext, wrapIndex } from "../utils";
import type { Rect } from "../types";

/** Zoom context */
type ZoomContextType = {
  /** slide rect */
  rect?: Rect;
  /** zoom level */
  zoom: number;
  /** maximum zoom level */
  maxZoom: number;
  /** horizontal slide position offset */
  offsetX: number;
  /** vertical slide position offset */
  offsetY: number;
  /** change zoom level */
  changeZoom: (
    /** new zoom value */
    newZoom: number,
    /** pointer/mouse/wheel event that determines zoom-in point */
    event?: Pick<MouseEvent, "clientX" | "clientY">,
    /** additional horizontal position offset */
    deltaX?: number,
    /** additional vertical position offset */
    deltaY?: number,
  ) => void;
  /** change position offsets */
  changeOffsets: (dx: number, dy: number) => void;
};

const ZoomContext = createContext<ZoomContextType | null>(null);

/** `useZoom` hook */
export const useZoom = makeUseContext("useZoom", ZoomContext);

type ZoomInternalContextType = {
  setCarouselRef: RefCallback<HTMLDivElement>;
};

const ZoomInternalContext = createContext<ZoomInternalContextType | null>(null);

export const useZoomInternal = makeUseContext("useZoomInternal", ZoomInternalContext);

export function Zoom({ children }: PropsWithChildren) {
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const [rect, setRect] = useState<Rect>();
  const observer = useRef<ResizeObserver>(undefined);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const carouselRectRef = useRef<DOMRectReadOnly>(undefined);
  const slideDimensionsRef = useRef<readonly [number, number]>([0, 0]);

  const {
    index,
    slides,
    zoom: { supports, maxZoom: maxZoomProp },
  } = useLightboxContext();

  const [prevIndex, setPrevIndex] = useState(index);
  if (index !== prevIndex) {
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setPrevIndex(index);
  }

  const slide = slides[wrapIndex(index, slides.length)];
  const maxZoom = slide && supports.includes(slide.type ?? "image") ? maxZoomProp : 1;

  const carouselHalfWidth = (rect?.width || 0) / 2;
  const carouselHalfHeight = (rect?.height || 0) / 2;

  // Offsets must be updated functionally — multiple sensor events can share a single
  // render (e.g., both fingers of a two-finger pan report movement in the same frame),
  // so computing new offsets from `offsetX` / `offsetY` would lose all but the last
  // update in the batch.
  const clampOffsets = useEventCallback(
    (
      updateX: (x: number) => number = (x) => x,
      updateY: (y: number) => number = (y) => y,
      currentZoom: number = zoom,
    ) => {
      const [slideHalfWidth, slideHalfHeight] = slideDimensionsRef.current;

      const maxOffsetX = Math.max(slideHalfWidth * currentZoom - carouselHalfWidth, 0);
      const maxOffsetY = Math.max(slideHalfHeight * currentZoom - carouselHalfHeight, 0);

      setOffsetX((x) => Math.min(maxOffsetX, Math.max(-maxOffsetX, updateX(x))));
      setOffsetY((y) => Math.min(maxOffsetY, Math.max(-maxOffsetY, updateY(y))));
    },
  );

  // Cache slide dimensions on resize or slide change — the only time DOM reads are needed
  useIsomorphicLayoutEffect(() => {
    const nodes = getChildren(
      getChildren(carouselRef.current).find(
        (node) => node instanceof HTMLElement && node.classList.contains(cssClass("slide_current")),
      ),
    ).filter((node) => node instanceof HTMLElement);

    const measure = () => {
      slideDimensionsRef.current = nodes
        .map(
          (node) =>
            [
              Math.max(carouselHalfWidth - node.offsetLeft, node.offsetLeft + node.offsetWidth - carouselHalfWidth),
              Math.max(carouselHalfHeight - node.offsetTop, node.offsetTop + node.offsetHeight - carouselHalfHeight),
            ] as const,
        )
        .reduce(
          ([maxWidth, maxHeight], [width, height]) => [Math.max(width, maxWidth), Math.max(height, maxHeight)] as const,
          [0, 0],
        );

      clampOffsets();
    };

    measure();

    // Re-measure when the slide content resizes after the initial render — e.g., an image
    // without `width` / `height` metadata reports zero dimensions until it loads
    if (typeof ResizeObserver !== "undefined") {
      const contentObserver = new ResizeObserver(measure);
      nodes.forEach((node) => contentObserver.observe(node));
      return () => contentObserver.disconnect();
    }
  }, [carouselHalfWidth, carouselHalfHeight, index, clampOffsets]); // clampOffsets is stable

  const setCarouselRef = useCallback((node: HTMLDivElement | null) => {
    carouselRef.current = node;

    observer.current?.disconnect();
    observer.current = undefined;

    const updateRect = () => {
      carouselRectRef.current = node?.getBoundingClientRect();
      setRect(node ? { width: node.clientWidth, height: node.clientHeight } : undefined);
    };

    updateRect();

    if (node && typeof ResizeObserver !== "undefined") {
      observer.current = new ResizeObserver(updateRect);
      observer.current.observe(node);
    }
  }, []);

  const changeOffsets = useEventCallback((dx: number, dy: number) => {
    clampOffsets(
      (x) => x + dx,
      (y) => y + dy,
    );
  });

  const changeZoom = useEventCallback(
    (targetZoom: number, event?: Pick<MouseEvent, "clientX" | "clientY">, deltaX: number = 0, deltaY: number = 0) => {
      const newZoom = Math.min(Math.max(targetZoom, 1), maxZoom);

      setZoom(newZoom);

      const rect = carouselRectRef.current;
      // `zoom` may lag by one commit within a batch, overstating `zoomDelta` on the second
      // of two same-frame events — the re-centering error is second-order, and the zoom value
      // itself stays exact (`targetZoom` is absolute).
      const zoomDelta = newZoom / zoom - 1;

      clampOffsets(
        (x) => x + deltaX + (event && rect ? (rect.left + rect.width / 2 + x - event.clientX) * zoomDelta : 0),
        (y) => y + deltaY + (event && rect ? (rect.top + rect.height / 2 + y - event.clientY) * zoomDelta : 0),
        newZoom,
      );
    },
  );

  const context = useMemo(
    () => ({ rect, zoom, maxZoom, offsetX, offsetY, changeZoom, changeOffsets }),
    [rect, zoom, maxZoom, offsetX, offsetY, changeZoom, changeOffsets],
  );

  const internalContext = useMemo(() => ({ setCarouselRef }), [setCarouselRef]);

  return (
    <ZoomContext.Provider value={context}>
      <ZoomInternalContext.Provider value={internalContext}>{children}</ZoomInternalContext.Provider>
    </ZoomContext.Provider>
  );
}
