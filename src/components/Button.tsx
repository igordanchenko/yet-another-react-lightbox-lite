import type { ComponentProps, ElementType } from "react";

import { useLightboxContext } from "./LightboxContext";
import { clsx, cssClass, mergeSlot, translateLabel } from "../utils";
import type { Label, RenderFunction } from "../types";

type ButtonProps = Pick<ComponentProps<"button">, "onClick" | "disabled" | "className"> & {
  label: Label;
  icon: ElementType;
  renderIcon?: RenderFunction;
};

export default function Button({ icon: Icon, renderIcon, label, onClick, disabled, className }: ButtonProps) {
  const { labels, slots } = useLightboxContext();
  const buttonLabel = translateLabel(labels, label);

  return (
    <button
      type="button"
      title={buttonLabel}
      aria-label={buttonLabel}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
      {...mergeSlot(slots.button, clsx(cssClass("button"), className))}
    >
      {renderIcon?.() ?? <Icon {...mergeSlot(slots.icon, cssClass("icon"))} />}
    </button>
  );
}
