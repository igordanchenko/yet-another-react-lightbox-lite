import { clsx, cssClass, mergeSlot } from "../utils";
import { useController } from "./Controller";
import { IconButton } from "./IconButton";
import { Close } from "./icons";
import { useLightboxContext } from "./LightboxContext";

export function Toolbar() {
  const {
    slots,
    render: { iconClose },
    toolbar: { buttons, fixed },
  } = useLightboxContext();
  const { close } = useController();

  return (
    <div {...mergeSlot(slots.toolbar, clsx(cssClass("toolbar"), fixed && cssClass("toolbar_fixed")))}>
      {buttons}
      <IconButton label="Close" icon={Close} renderIcon={iconClose} onClick={close} />
    </div>
  );
}
