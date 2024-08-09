import Button from "./Button";
import { useController } from "./Controller";
import { useLightboxContext } from "./LightboxContext";
import { Close, Next, Previous } from "./icons";
import { cssClass } from "../utils";

export default function Navigation() {
  const { slides, index, render: { iconPrev, iconNext, iconClose, controls } = {} } = useLightboxContext();
  const { prev, next, close } = useController();

  return (
    <>
      {slides.length > 1 && (
        <>
          <Button
            label="Previous"
            icon={Previous}
            renderIcon={iconPrev}
            onClick={prev}
            className={cssClass("button_prev")}
            disabled={index <= 0}
          />

          <Button
            label="Next"
            icon={Next}
            renderIcon={iconNext}
            onClick={next}
            className={cssClass("button_next")}
            disabled={index >= slides.length - 1}
          />
        </>
      )}

      <Button label="Close" icon={Close} renderIcon={iconClose} onClick={close} className={cssClass("button_close")} />

      {controls?.()}
    </>
  );
}
