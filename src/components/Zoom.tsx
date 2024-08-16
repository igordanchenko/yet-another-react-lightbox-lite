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
import { isImageSlide, makeUseContext } from "../utils";
import { Rect } from "../types";

type ZoomContextType = {
  rect?: Rect;
  zoom: number;
  maxZoom: number;
  offsetX: number;
  offsetY: number;
  changeZoom: (newZoom: number, event?: Pick<MouseEvent, "clientX" | "clientY">) => void;
  changeOffsets: (dx: number, dy: number) => void;
  carouselRef: RefObject<HTMLDivElement>;
  setCarouselRef: RefCallback<HTMLDivElement>;
};

const ZoomContext = createContext<ZoomContextType | null>(null);

export const useZoom = makeUseContext(ZoomContext);

export default function Zoom({ children }: PropsWithChildren) {
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const [rect, setRect] = useState<Rect>();
  const observer = useRef<ResizeObserver>();
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const { index, slides, zoom: { supports } = {} } = useLightboxContext();

  const slide = slides[index];
  const maxZoom = isImageSlide(slide) || (supports || []).includes((slide as any).type) ? 8 : 1;

  useLayoutEffect(() => {
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  }, [index]);

  useLayoutEffect(() => {
    const carouselHalfWidth = (rect?.width || 0) / 2;
    const carouselHalfHeight = (rect?.height || 0) / 2;

    const [slideHalfWidth, slideHalfHeight] = Array.from(
      Array.from(carouselRef.current?.children || []).find((node) => node instanceof HTMLElement && !node.hidden)
        ?.children || [],
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
    () => ({ rect, zoom, maxZoom, offsetX, offsetY, changeZoom, changeOffsets, carouselRef, setCarouselRef }),
    [rect, zoom, maxZoom, offsetX, offsetY, changeZoom, changeOffsets, setCarouselRef],
  );

  return <ZoomContext.Provider value={context}>{children}</ZoomContext.Provider>;
}
