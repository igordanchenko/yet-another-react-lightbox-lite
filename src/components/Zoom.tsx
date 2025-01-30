import {
  createContext,
  MouseEvent,
  PropsWithChildren,
  RefCallback,
  RefObject,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useLightboxContext } from "./LightboxContext";
import { getChildren, isImageSlide, makeUseContext } from "../utils";
import { Rect } from "../types";

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
  ) => void;
  /** change position offsets */
  changeOffsets: (dx: number, dy: number) => void;
};

const ZoomContext = createContext<ZoomContextType | null>(null);

/** `useZoom` hook */
export const useZoom = makeUseContext(ZoomContext);

type ZoomInternalContextType = {
  carouselRef: RefObject<HTMLDivElement | null>;
  setCarouselRef: RefCallback<HTMLDivElement>;
};

const ZoomInternalContext = createContext<ZoomInternalContextType | null>(null);

export const useZoomInternal = makeUseContext(ZoomInternalContext);

export default function Zoom({ children }: PropsWithChildren) {
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const [rect, setRect] = useState<Rect>();
  const observer = useRef<ResizeObserver>(undefined);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const { index, slides, zoom: { supports, disabled } = {} } = useLightboxContext();

  const [prevIndex, setPrevIndex] = useState(index);
  if (index !== prevIndex) {
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setPrevIndex(index);
  }

  const slide = slides[index];
  const maxZoom =
    (isImageSlide(slide) && !disabled) || ((supports as string[] | undefined) || []).includes(slide.type as string)
      ? 8
      : 1;

  useLayoutEffect(() => {
    const carouselHalfWidth = (rect?.width || 0) / 2;
    const carouselHalfHeight = (rect?.height || 0) / 2;

    const [slideHalfWidth, slideHalfHeight] = Array.from(
      getChildren(
        Array.from(getChildren(carouselRef.current)).find((node) => node instanceof HTMLElement && !node.hidden),
      ),
    )
      .filter((node) => node instanceof HTMLElement)
      .map((node) => [
        Math.max(carouselHalfWidth - node.offsetLeft, node.offsetLeft + node.offsetWidth - carouselHalfWidth),
        Math.max(carouselHalfHeight - node.offsetTop, node.offsetTop + node.offsetHeight - carouselHalfHeight),
      ])
      .reduce(
        ([maxWidth, maxHeight], [width, height]) => [Math.max(width, maxWidth), Math.max(height, maxHeight)],
        [0, 0],
      );

    const maxOffsetX = Math.max(slideHalfWidth * zoom - carouselHalfWidth, 0);
    const maxOffsetY = Math.max(slideHalfHeight * zoom - carouselHalfHeight, 0);

    setOffsetX(Math.min(maxOffsetX, Math.max(-maxOffsetX, offsetX)));
    setOffsetY(Math.min(maxOffsetY, Math.max(-maxOffsetY, offsetY)));
  }, [zoom, rect, offsetX, offsetY]);

  const setCarouselRef = useCallback((node: HTMLDivElement | null) => {
    carouselRef.current = node;

    observer.current?.disconnect();
    observer.current = undefined;

    const updateRect = () => setRect(node ? { width: node.clientWidth, height: node.clientHeight } : undefined);

    if (node && typeof ResizeObserver !== "undefined") {
      observer.current = new ResizeObserver(updateRect);
      observer.current.observe(node);
    } else {
      updateRect();
    }
  }, []);

  const changeOffsets = useCallback(
    (dx: number, dy: number) => {
      setOffsetX(offsetX + dx);
      setOffsetY(offsetY + dy);
    },
    [offsetX, offsetY],
  );

  const changeZoom = useCallback(
    (targetZoom: number, event?: Pick<MouseEvent, "clientX" | "clientY">) => {
      const newZoom = Math.min(Math.max(targetZoom, 1), maxZoom);

      setZoom(newZoom);

      if (event && carouselRef.current) {
        const { clientX, clientY } = event;
        const { left, top, width, height } = carouselRef.current.getBoundingClientRect();
        const zoomDelta = newZoom / zoom - 1;

        changeOffsets(
          (left + width / 2 + offsetX - clientX) * zoomDelta,
          (top + height / 2 + offsetY - clientY) * zoomDelta,
        );
      }
    },
    [zoom, maxZoom, offsetX, offsetY, changeOffsets],
  );

  const context = useMemo(
    () => ({ rect, zoom, maxZoom, offsetX, offsetY, changeZoom, changeOffsets }),
    [rect, zoom, maxZoom, offsetX, offsetY, changeZoom, changeOffsets],
  );

  const internalContext = useMemo(() => ({ carouselRef, setCarouselRef }), [setCarouselRef]);

  return (
    <ZoomContext.Provider value={context}>
      <ZoomInternalContext.Provider value={internalContext}>{children}</ZoomInternalContext.Provider>
    </ZoomContext.Provider>
  );
}
