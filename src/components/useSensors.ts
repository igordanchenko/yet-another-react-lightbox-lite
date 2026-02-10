import type { KeyboardEvent, MouseEvent, PointerEvent, WheelEvent } from "react";
import { useMemo, useRef } from "react";

import { useZoom } from "./Zoom";
import { useController } from "./Controller";
import { useLightboxContext } from "./LightboxContext";
import useEventCallback from "./useEventCallback";
import { cssClass, scaleZoom } from "../utils";

const WHEEL_ZOOM_FACTOR = 100;
const WHEEL_SWIPE_DISTANCE = 100;
const WHEEL_SWIPE_COOLDOWN_TIME = 1_000;
const WHEEL_EVENT_HISTORY_WINDOW = 3_000;
const POINTER_SWIPE_DISTANCE = 100;
const KEYBOARD_ZOOM_FACTOR = 8 ** (1 / 4);
const KEYBOARD_MOVE_DISTANCE = 50;
const PINCH_ZOOM_DISTANCE_FACTOR = 100;
const PREVAILING_DIRECTION_FACTOR = 1.2;

function hasTwoPointers(pointers: PointerEvent[]): pointers is [PointerEvent, PointerEvent] {
  return pointers.length === 2;
}

function distance(pointerA: MouseEvent, pointerB: MouseEvent) {
  return Math.hypot(pointerA.clientX - pointerB.clientX, pointerA.clientY - pointerB.clientY);
}

export default function useSensors() {
  const wheelEvents = useRef<WheelEvent[]>([]);
  const wheelCooldown = useRef<number | null>(null);
  const wheelCooldownMomentum = useRef<number | null>(null);

  const activePointers = useRef<PointerEvent[]>([]);
  const pinchZoomDistance = useRef<number>(undefined);

  const { zoom, maxZoom, changeZoom, changeOffsets } = useZoom();
  const { prev, next, close } = useController();

  const { closeOnPullUp, closeOnPullDown, closeOnBackdropClick } = {
    closeOnPullUp: true,
    closeOnPullDown: true,
    closeOnBackdropClick: true,
    ...useLightboxContext().controller,
  };

  const addPointer = (event: PointerEvent) => {
    removePointer(event);
    activePointers.current.push(event);
  };

  const removePointer = (event: PointerEvent) => {
    activePointers.current = activePointers.current.filter((pointer) => pointer.pointerId !== event.pointerId);
  };

  // intentionally querying the DOM each time — this only runs on pointerDown/doubleClick
  // (not on every pointer move), and the selectable elements can change per slide
  const shouldIgnoreEvent = (event: MouseEvent | PointerEvent) =>
    // ignore right button clicks (e.g., context menu)
    ("pointerType" in event && event.pointerType === "mouse" && event.buttons > 1) ||
    // ignore clicks on navigation buttons, toolbar, user-selectable elements, etc.
    (event.target instanceof Element &&
      event.target.closest(
        `.${cssClass("button")}, .${cssClass("icon")}, .${cssClass("toolbar")}, .${cssClass("selectable")}`,
      ) !== null);

  const onKeyDown = useEventCallback((event: KeyboardEvent) => {
    const { key, metaKey, ctrlKey } = event;
    const meta = metaKey || ctrlKey;

    const preventDefault = () => event.preventDefault();

    const handleChangeZoom = (newZoom: number) => {
      preventDefault();
      changeZoom(newZoom);
    };

    if (key === "+" || (meta && key === "=")) handleChangeZoom(zoom * KEYBOARD_ZOOM_FACTOR);
    if (key === "-" || (meta && key === "_")) handleChangeZoom(zoom / KEYBOARD_ZOOM_FACTOR);
    if (meta && key === "0") handleChangeZoom(1);

    if (key === "Escape") close();

    if (zoom > 1) {
      const move = (deltaX: number, deltaY: number) => {
        preventDefault();
        changeOffsets(deltaX, deltaY);
      };

      if (key === "ArrowUp") move(0, KEYBOARD_MOVE_DISTANCE);
      if (key === "ArrowDown") move(0, -KEYBOARD_MOVE_DISTANCE);
      if (key === "ArrowLeft") move(KEYBOARD_MOVE_DISTANCE, 0);
      if (key === "ArrowRight") move(-KEYBOARD_MOVE_DISTANCE, 0);

      return;
    }

    if (key === "ArrowLeft") prev();
    if (key === "ArrowRight") next();
  });

  const onPointerDown = useEventCallback((event: PointerEvent) => {
    if (shouldIgnoreEvent(event)) return;

    addPointer(event);

    if (hasTwoPointers(activePointers.current)) {
      pinchZoomDistance.current = distance(activePointers.current[0], activePointers.current[1]);
    }
  });

  const onPointerMove = useEventCallback((event: PointerEvent) => {
    const activePointer = activePointers.current.find((pointer) => pointer.pointerId === event.pointerId);

    if (!activePointer) return;

    if (hasTwoPointers(activePointers.current) && pinchZoomDistance.current) {
      addPointer(event);

      const currentDistance = distance(activePointers.current[0], activePointers.current[1]);
      const delta = currentDistance - pinchZoomDistance.current;

      if (Math.abs(delta) > 0) {
        changeZoom(scaleZoom(zoom, delta, PINCH_ZOOM_DISTANCE_FACTOR), {
          clientX: (activePointers.current[0].clientX + activePointers.current[1].clientX) / 2,
          clientY: (activePointers.current[0].clientY + activePointers.current[1].clientY) / 2,
        });

        pinchZoomDistance.current = currentDistance;
      }

      return;
    }

    if (zoom > 1) {
      if (activePointers.current.length === 1) {
        changeOffsets(event.clientX - activePointer.clientX, event.clientY - activePointer.clientY);
      }

      addPointer(event);
    }
  });

  const onPointerUp = useEventCallback((event: PointerEvent) => {
    const activePointer = activePointers.current.find((pointer) => pointer.pointerId === event.pointerId);

    if (!activePointer) return;

    if (activePointers.current.length === 1 && zoom === 1) {
      const dx = event.clientX - activePointer.clientX;
      const dy = event.clientY - activePointer.clientY;

      const deltaX = Math.abs(dx);
      const deltaY = Math.abs(dy);

      if (deltaX > POINTER_SWIPE_DISTANCE && deltaX > PREVAILING_DIRECTION_FACTOR * deltaY) {
        if (dx > 0) {
          prev();
        } else {
          next();
        }
      } else if (
        (deltaY > POINTER_SWIPE_DISTANCE &&
          deltaY > PREVAILING_DIRECTION_FACTOR * deltaX &&
          ((closeOnPullUp && dy < 0) || (closeOnPullDown && dy > 0))) ||
        (closeOnBackdropClick &&
          activePointer.target instanceof Element &&
          (activePointer.target.classList.contains(cssClass("slide")) ||
            activePointer.target.classList.contains(cssClass("portal"))))
      ) {
        close();
      }
    }

    removePointer(event);
  });

  const onWheel = useEventCallback((event: WheelEvent) => {
    if (event.ctrlKey) {
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        changeZoom(scaleZoom(zoom, -event.deltaY, WHEEL_ZOOM_FACTOR), event);
      }
      return;
    }

    if (zoom > 1) {
      changeOffsets(-event.deltaX, -event.deltaY);
      return;
    }

    if (wheelCooldown.current && wheelCooldownMomentum.current) {
      if (
        event.deltaX * wheelCooldownMomentum.current > 0 &&
        (event.timeStamp <= wheelCooldown.current + WHEEL_SWIPE_COOLDOWN_TIME / 2 ||
          (event.timeStamp <= wheelCooldown.current + WHEEL_SWIPE_COOLDOWN_TIME &&
            Math.abs(event.deltaX) < PREVAILING_DIRECTION_FACTOR * Math.abs(wheelCooldownMomentum.current)))
      ) {
        wheelCooldownMomentum.current = event.deltaX;
        return;
      }

      wheelCooldown.current = null;
      wheelCooldownMomentum.current = null;
    }

    wheelEvents.current = wheelEvents.current.filter((e) => e.timeStamp > event.timeStamp - WHEEL_EVENT_HISTORY_WINDOW);
    wheelEvents.current.push(event);

    const dx = wheelEvents.current.map((e) => e.deltaX).reduce((a, b) => a + b, 0);
    const deltaX = Math.abs(dx);
    const deltaY = Math.abs(wheelEvents.current.map((e) => e.deltaY).reduce((a, b) => a + b, 0));

    if (deltaX > WHEEL_SWIPE_DISTANCE && deltaX > PREVAILING_DIRECTION_FACTOR * deltaY) {
      if (dx < 0) {
        prev();
      } else {
        next();
      }

      wheelEvents.current = [];
      wheelCooldown.current = event.timeStamp;
      wheelCooldownMomentum.current = event.deltaX;
    }
  });

  const onDoubleClick = useEventCallback((event: MouseEvent) => {
    if (shouldIgnoreEvent(event)) return;

    changeZoom(zoom < maxZoom ? scaleZoom(zoom, 2, 1) : 1, event);
  });

  return useMemo(
    () => ({
      onKeyDown,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerLeave: onPointerUp,
      onPointerCancel: onPointerUp,
      onDoubleClick,
      onWheel,
    }),
    [onKeyDown, onPointerDown, onPointerMove, onPointerUp, onDoubleClick, onWheel],
  );
}
