import { type ComponentProps, type ElementType, forwardRef } from "react";

import { useLightboxContext } from "./LightboxContext";
import { clsx, cssClass, mergeSlot, translateLabel } from "../utils";
import type { Label, RenderFunction } from "../types";

export type IconButtonProps = Omit<ComponentProps<"button">, "type" | "title" | "aria-label" | "children"> & {
  /** button label — accepts a known `Labels` key (translated via `labels`) or any custom string */
  label: Label;
  /** icon component (rendered when `renderIcon` is not provided) */
  icon: ElementType;
  /** custom icon render function (takes precedence over `icon`) */
  renderIcon?: RenderFunction;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon: Icon, renderIcon, label, onClick, disabled, className, ...rest },
  ref,
) {
  const { labels, slots } = useLightboxContext();
  const buttonLabel = translateLabel(labels, label);

  return (
    <button
      ref={ref}
      type="button"
      title={buttonLabel}
      aria-label={buttonLabel}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
      {...rest}
      {...mergeSlot(slots.button, clsx(cssClass("button"), className))}
    >
      {renderIcon?.() ?? <Icon {...mergeSlot(slots.icon, cssClass("icon"))} />}
    </button>
  );
});
