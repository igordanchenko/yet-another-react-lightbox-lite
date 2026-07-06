import type { KeyboardEvent, MouseEvent, PointerEvent, WheelEvent } from "react";
import { useRef } from "react";

import { useZoom } from "./Zoom";
import { useController } from "./Controller";
import { useLightboxContext } from "./LightboxContext";
import { useEventCallback } from "../hooks";
import { cssClass, isInteractiveTarget, scaleZoom, wrapIndex } from "../utils";

const WHEEL_ZOOM_FACTOR = 100;
const WHEEL_SWIPE_DISTANCE = 100;
const WHEEL_SWIPE_COOLDOWN_TIME = 1_000;
const WHEEL_EVENT_HISTORY_WINDOW = 3_000;
const POINTER_SWIPE_DISTANCE = 100;
const KEYBOARD_ZOOM_FACTOR = 8 ** (1 / 4);
const KEYBOARD_MOVE_DISTANCE = 50;
const PREVAILING_DIRECTION_FACTOR = 1.2;
const DELTA_LINE_MULTIPLIER = 8;
const DELTA_PAGE_MULTIPLIER = 24;
const MAX_WHEEL_ZOOM_DELTA = 24;
const DOUBLE_TAP_INTERVAL = 300;
const DOUBLE_TAP_DISTANCE = 30;

type Point = Pick<MouseEvent, "clientX" | "clientY">;

function distance(pointerA: Point, pointerB: Point) {
  return Math.hypot(pointerA.clientX - pointerB.clientX, pointerA.clientY - pointerB.clientY);
}

function hasTwoPointers(pointers: PointerEvent[]): pointers is [PointerEvent, PointerEvent] {
  return pointers.length === 2;
}

function isDominantAxis(primary: number, secondary: number, threshold: number) {
  return primary > threshold && primary > PREVAILING_DIRECTION_FACTOR * secondary;
}

type NormalizedWheelEvent = { timeStamp: number; deltaX: number; deltaY: number };

// Normalize wheel deltas to pixel-equivalent values. Firefox can report deltas in
// line- or page-mode (e.g. `deltaY = 3` for three lines), where Chromium/WebKit
// already deliver pixel deltas — without this, line-mode events would be ~100x
// weaker than pixel-mode ones. Shift+vertical-wheel is also remapped to a
// horizontal delta to match the platform convention used by mice without a
// horizontal scroll wheel.
function normalizeWheel(event: WheelEvent) {
  let dx = event.deltaX;
  let dy = event.deltaY;
  if (event.shiftKey && dx === 0) {
    [dx, dy] = [dy, dx];
  }
  if (event.deltaMode === 1 /* DOM_DELTA_LINE */) {
    dx *= DELTA_LINE_MULTIPLIER;
    dy *= DELTA_LINE_MULTIPLIER;
  } else if (event.deltaMode === 2 /* DOM_DELTA_PAGE */) {
    dx *= DELTA_PAGE_MULTIPLIER;
    dy *= DELTA_PAGE_MULTIPLIER;
  }
  return [dx, dy] as const;
}

function clampDelta(delta: number, max: number) {
  return Math.sign(delta) * Math.min(max, Math.abs(delta));
}

// Distinguish a trailing-inertia wheel event from a fresh intentional swipe.
// Trackpad inertia continues for several hundred milliseconds after the user
// stops scrolling, in the same direction with monotonically decaying magnitude.
// During the first half of the cooldown window any same-direction event is
// treated as inertia; during the second half only events whose magnitude is
// still below the most recent decay sample (a fresh swipe ramps up to a higher
// peak). Direction reversal escapes immediately.
function isInertiaContinuation(dx: number, timeStamp: number, cooldownStart: number, prevailingMomentum: number) {
  if (dx * prevailingMomentum <= 0) return false;

  const elapsed = timeStamp - cooldownStart;
  if (elapsed > WHEEL_SWIPE_COOLDOWN_TIME) return false;
  if (elapsed <= WHEEL_SWIPE_COOLDOWN_TIME / 2) return true;

  return Math.abs(dx) < PREVAILING_DIRECTION_FACTOR * Math.abs(prevailingMomentum);
}

// intentionally querying the DOM each time — interactive elements can change per slide
function shouldIgnorePointer(event: PointerEvent) {
  return (
    // ignore right button clicks (e.g., context menu)
    (event.pointerType === "mouse" && event.buttons > 1) ||
    // ignore clicks on navigation buttons, toolbar, user-interactive subtrees, etc.
    (event.target instanceof Element &&
      event.target.closest(
        `.${cssClass("button")}, .${cssClass("icon")}, .${cssClass("toolbar")}, .${cssClass("interactive")}`,
      ) !== null)
  );
}

export function useSensors() {
  const swipeHistory = useRef<NormalizedWheelEvent[]>([]);
  const cooldownStart = useRef<number | null>(null);
  const prevailingMomentum = useRef<number | null>(null);

  const activePointers = useRef<PointerEvent[]>([]);
  const initialPinchDistance = useRef<number | null>(null);
  const initialPinchZoom = useRef<number>(1);
  const lastTap = useRef<MouseEvent | null>(null);

  const { zoom, maxZoom, changeZoom, changeOffsets } = useZoom();
  const { prev, next, goto, close } = useController();

  const {
    slides,
    index,
    controller: { closeOnEscape, closeOnPullUp, closeOnPullDown, closeOnBackdropClick },
  } = useLightboxContext();

  const addPointer = (event: PointerEvent) => {
    removePointer(event);
    activePointers.current.push(event);
  };

  const removePointer = (event: PointerEvent) => {
    activePointers.current = activePointers.current.filter((pointer) => pointer.pointerId !== event.pointerId);
  };

  const onKeyDown = useEventCallback((event: KeyboardEvent) => {
    if (isInteractiveTarget(event.target)) return;

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

    if (key === "Escape" && closeOnEscape) {
      // Prevent parent modals (e.g. Radix UI, MUI) from also acting on this keystroke —
      // without this, pressing Escape inside the lightbox would close both the lightbox
      // and the surrounding dialog.
      event.stopPropagation();

      close();
    }

    if (key === "Home" || key === "End") {
      preventDefault();

      if (slides.length <= 1) return;

      // Pick the index of `targetSlide` in the same wrap cycle as the current
      // `index`, so `Home` never moves forward and `End` never moves backward.
      const targetSlide = key === "Home" ? 0 : slides.length - 1;
      goto(index - wrapIndex(index, slides.length) + targetSlide);
    }

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

    if (key === "ArrowLeft") {
      preventDefault();
      prev();
    }

    if (key === "ArrowRight") {
      preventDefault();
      next();
    }
  });

  const onPointerDown = useEventCallback((event: PointerEvent) => {
    if (shouldIgnorePointer(event)) return;

    addPointer(event);

    if (hasTwoPointers(activePointers.current)) {
      // Anchor the pinch to the starting distance and zoom so the gesture
      // tracks the finger spread as a ratio rather than accumulating per-event
      // deltas — feels natural and avoids drift.
      initialPinchDistance.current = distance(activePointers.current[0], activePointers.current[1]);
      initialPinchZoom.current = zoom;
    }
  });

  const onPointerMove = useEventCallback((event: PointerEvent) => {
    const activePointer = activePointers.current.find((pointer) => pointer.pointerId === event.pointerId);

    if (!activePointer) return;

    if (hasTwoPointers(activePointers.current) && initialPinchDistance.current) {
      addPointer(event);

      const currentDistance = distance(activePointers.current[0], activePointers.current[1]);

      changeZoom((initialPinchZoom.current * currentDistance) / initialPinchDistance.current, {
        clientX: (activePointers.current[0].clientX + activePointers.current[1].clientX) / 2,
        clientY: (activePointers.current[0].clientY + activePointers.current[1].clientY) / 2,
      });

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

    if (activePointers.current.length === 1) {
      const dx = event.clientX - activePointer.clientX;
      const dy = event.clientY - activePointer.clientY;

      const deltaX = Math.abs(dx);
      const deltaY = Math.abs(dy);

      const tapped = deltaX < DOUBLE_TAP_DISTANCE && deltaY < DOUBLE_TAP_DISTANCE;

      const swiped = zoom === 1 && isDominantAxis(deltaX, deltaY, POINTER_SWIPE_DISTANCE);

      const closed =
        zoom === 1 &&
        ((isDominantAxis(deltaY, deltaX, POINTER_SWIPE_DISTANCE) &&
          ((closeOnPullUp && dy < 0) || (closeOnPullDown && dy > 0))) ||
          // require a (near-)stationary pointer on the backdrop-click branch — without
          // it, any aborted drag (an under-threshold swipe, or a pull with the matching
          // closeOnPull* option disabled) that starts on the backdrop would close
          (tapped &&
            closeOnBackdropClick &&
            activePointer.target instanceof Element &&
            (activePointer.target.classList.contains(cssClass("slide")) ||
              activePointer.target.classList.contains(cssClass("portal")))));

      if (swiped) {
        if (dx > 0) {
          prev();
        } else {
          next();
        }
      } else if (closed) {
        close();
      } else if (tapped) {
        // Detect double-tap inline rather than relying on the synthetic
        // `dblclick` event — Android Chrome and several WebViews emit it
        // unreliably when the second tap lands within the platform's
        // "double-tap-to-zoom" window.
        if (
          lastTap.current &&
          event.timeStamp - lastTap.current.timeStamp < DOUBLE_TAP_INTERVAL &&
          distance(event, lastTap.current) < DOUBLE_TAP_DISTANCE
        ) {
          changeZoom(zoom < maxZoom ? scaleZoom(zoom, 2, 1) : 1, event);
          lastTap.current = null;
        } else {
          lastTap.current = event;
        }
      }
    }

    removePointer(event);

    if (activePointers.current.length < 2) {
      initialPinchDistance.current = null;
    }
  });

  const onWheel = useEventCallback((event: WheelEvent) => {
    if (isInteractiveTarget(event.target)) return;

    const [dx, dy] = normalizeWheel(event);

    if (event.ctrlKey) {
      if (Math.abs(dy) > Math.abs(dx)) {
        // Clamp per-event zoom delta — a single oversized wheel event (line/page mode,
        // or fast scroll) shouldn't jump multiple zoom steps at once.
        changeZoom(scaleZoom(zoom, -clampDelta(dy, MAX_WHEEL_ZOOM_DELTA), WHEEL_ZOOM_FACTOR), event);
      }
      return;
    }

    if (zoom > 1) {
      changeOffsets(-dx, -dy);
      return;
    }

    if (cooldownStart.current !== null && prevailingMomentum.current !== null) {
      if (isInertiaContinuation(dx, event.timeStamp, cooldownStart.current, prevailingMomentum.current)) {
        prevailingMomentum.current = dx;
        return;
      }

      cooldownStart.current = null;
      prevailingMomentum.current = null;
    }

    // Accumulate normalized deltas across recent events so a slow trackpad swipe
    // crosses the threshold even when individual events are tiny.
    swipeHistory.current = swipeHistory.current.filter(
      (e) => e.timeStamp > event.timeStamp - WHEEL_EVENT_HISTORY_WINDOW,
    );
    swipeHistory.current.push({ timeStamp: event.timeStamp, deltaX: dx, deltaY: dy });

    let totalX = 0;
    let totalY = 0;
    for (const e of swipeHistory.current) {
      totalX += e.deltaX;
      totalY += e.deltaY;
    }

    if (isDominantAxis(Math.abs(totalX), Math.abs(totalY), WHEEL_SWIPE_DISTANCE)) {
      if (totalX < 0) {
        prev();
      } else {
        next();
      }

      swipeHistory.current = [];
      cooldownStart.current = event.timeStamp;
      prevailingMomentum.current = dx;
    }
  });

  return {
    onKeyDown,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave: onPointerUp,
    onPointerCancel: onPointerUp,
    onWheel,
  };
}
