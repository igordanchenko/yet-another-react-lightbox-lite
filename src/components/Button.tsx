import { ComponentProps, ElementType } from "react";

import { useLightboxContext } from "./LightboxContext";
import { clsx, cssClass, translateLabel } from "../utils";
import { Label, RenderFunction } from "../types";

type ButtonProps = Pick<ComponentProps<"button">, "onClick" | "disabled" | "className"> & {
  label: Label;
  icon: ElementType;
  renderIcon?: RenderFunction;
};

export default function Button({ icon: Icon, renderIcon, label, onClick, disabled, className }: ButtonProps) {
  const { labels } = useLightboxContext();
  const buttonLabel = translateLabel(labels, label);

  return (
    <button
      type="button"
      title={buttonLabel}
      aria-label={buttonLabel}
      onClick={onClick}
      disabled={disabled}
      className={clsx(cssClass("button"), className)}
    >
      {renderIcon?.() ?? <Icon className={cssClass("icon")} />}
    </button>
  );
}
