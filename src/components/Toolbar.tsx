import Button from "./Button";
import { Close } from "./icons";
import { useController } from "./Controller";
import { useLightboxContext } from "./LightboxContext";
import { clsx, cssClass } from "../utils";

export default function Toolbar() {
  const { render: { iconClose } = {}, toolbar: { buttons, fixed } = {}, styles } = useLightboxContext();
  const { close } = useController();

  return (
    <div style={styles?.toolbar} className={clsx(cssClass("toolbar"), fixed && cssClass("toolbar_fixed"))}>
      {buttons}
      <Button label="Close" icon={Close} renderIcon={iconClose} onClick={close} />
    </div>
  );
}
