import { KeyboardEvent, MouseEvent, PointerEvent, useMemo, useRef, WheelEvent } from "react";

import { useZoom, useZoomInternal } from "./Zoom";
import { useController } from "./Controller";
import { useLightboxContext } from "./LightboxContext";
import { cssClass, scaleZoom } from "../utils";

const WHEEL_ZOOM_FACTOR = 100;
const WHEEL_SWIPE_DISTANCE = 100;
const WHEEL_SWIPE_COOLDOWN_TIME = 1_000;
const POINTER_SWIPE_DISTANCE = 100;
const KEYBOARD_ZOOM_FACTOR = 8 ** (1 / 4);
const KEYBOARD_MOVE_DISTANCE = 50;
const PINCH_ZOOM_DISTANCE_FACTOR = 100;
const PREVAILING_DIRECTION_FACTOR = 1.2;

function distance(pointerA: MouseEvent, pointerB: MouseEvent) {
  return ((pointerA.clientX - pointerB.clientX) ** 2 + (pointerA.clientY - pointerB.clientY) ** 2) ** 0.5;
}

export default function useSensors() {
  const wheelEvents = useRef<WheelEvent[]>([]);
  const wheelCooldown = useRef<number | null>(null);
  const wheelCooldownMomentum = useRef<number | null>(null);

  const activePointers = useRef<PointerEvent[]>([]);
  const pinchZoomDistance = useRef<number>(undefined);

  const { zoom, maxZoom, changeZoom, changeOffsets } = useZoom();
  const { carouselRef } = useZoomInternal();
  const { prev, next, close } = useController();

  const { closeOnPullUp, closeOnPullDown, closeOnBackdropClick } = {
    closeOnPullUp: true,
    closeOnPullDown: true,
    closeOnBackdropClick: true,
    ...useLightboxContext().controller,
  };

  return useMemo(() => {
    const onKeyDown = (event: KeyboardEvent) => {
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
    };

    const removePointer = (event: PointerEvent) => {
      const pointers = activePointers.current;
      pointers.splice(0, pointers.length, ...pointers.filter((pointer) => pointer.pointerId !== event.pointerId));
    };

    const addPointer = (event: PointerEvent) => {
      event.persist();
      removePointer(event);
      activePointers.current.push(event);
    };

    const shouldIgnoreEvent = (event: MouseEvent | PointerEvent) =>
      // ignore right button clicks (e.g., context menu)
      ("pointerType" in event && event.pointerType === "mouse" && event.buttons > 1) ||
      // ignore clicks on navigation buttons, toolbar, user-selectable elements, etc.
      (event.target instanceof Element &&
        (event.target.classList.contains(cssClass("button")) ||
          event.target.classList.contains(cssClass("icon")) ||
          Array.from(
            carouselRef.current?.parentElement?.querySelectorAll(
              `.${cssClass("toolbar")}, .${cssClass("selectable")}`,
            ) /* c8 ignore start */ || [] /* c8 ignore stop */,
          ).find((element) => element.contains(event.target as Element)) !== undefined));

    const onPointerDown = (event: PointerEvent) => {
      if (shouldIgnoreEvent(event)) return;

      addPointer(event);

      const pointers = activePointers.current;
      if (pointers.length === 2) {
        pinchZoomDistance.current = distance(pointers[0], pointers[1]);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const pointers = activePointers.current;
      const activePointer = pointers.find((pointer) => pointer.pointerId === event.pointerId);

      if (!activePointer) return;

      if (pointers.length === 2 && pinchZoomDistance.current) {
        addPointer(event);

        const currentDistance = distance(pointers[0], pointers[1]);
        const delta = currentDistance - pinchZoomDistance.current;

        if (Math.abs(delta) > 0) {
          changeZoom(scaleZoom(zoom, delta, PINCH_ZOOM_DISTANCE_FACTOR), {
            clientX: (pointers[0].clientX + pointers[1].clientX) / 2,
            clientY: (pointers[0].clientY + pointers[1].clientY) / 2,
          });

          pinchZoomDistance.current = currentDistance;
        }

        return;
      }

      if (zoom > 1) {
        if (pointers.length === 1) {
          changeOffsets(event.clientX - activePointer.clientX, event.clientY - activePointer.clientY);
        }

        addPointer(event);
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      const pointers = activePointers.current;
      const activePointer = pointers.find((pointer) => pointer.pointerId === event.pointerId);

      if (!activePointer) return;

      if (pointers.length === 1 && zoom === 1) {
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
            Array.from(activePointer.target.classList).some((className) =>
              [cssClass("slide"), cssClass("portal")].includes(className),
            ))
        ) {
          close();
        }
      }

      removePointer(event);
    };

    const onWheel = (event: WheelEvent) => {
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

      event.persist();
      wheelEvents.current = wheelEvents.current.filter((e) => e.timeStamp > event.timeStamp - 3_000);
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
    };

    const onDoubleClick = (event: MouseEvent) => {
      if (shouldIgnoreEvent(event)) return;

      changeZoom(zoom < maxZoom ? scaleZoom(zoom, 2, 1) : 1, event);
    };

    return {
      onKeyDown,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerLeave: onPointerUp,
      onPointerCancel: onPointerUp,
      onDoubleClick,
      onWheel,
    };
  }, [
    prev,
    next,
    close,
    zoom,
    maxZoom,
    changeZoom,
    changeOffsets,
    carouselRef,
    closeOnPullUp,
    closeOnPullDown,
    closeOnBackdropClick,
  ]);
}
