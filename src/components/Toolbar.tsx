import { cloneElement, isValidElement } from "react";

import Button from "./Button";
import { Close } from "./icons";
import { useController } from "./Controller";
import { useLightboxContext } from "./LightboxContext";
import { cssClass } from "../utils";

export default function Toolbar() {
  const { render: { iconClose } = {}, toolbar: { buttons } = {}, styles } = useLightboxContext();
  const { close } = useController();

  return (
    <div style={styles?.toolbar} className={cssClass("toolbar")}>
      {/* eslint-disable-next-line react/no-array-index-key */}
      {buttons?.map((button, key) => (isValidElement(button) && !button.key ? cloneElement(button, { key }) : button))}

      <Button label="Close" icon={Close} renderIcon={iconClose} onClick={close} />
    </div>
  );
}
