import Button from "./Button";
import { useController } from "./Controller";
import { useLightboxContext } from "./LightboxContext";
import { Next, Previous } from "./icons";
import { cssClass } from "../utils";

export default function Navigation() {
  const { slides, render: { iconPrev, iconNext, controls } = {} } = useLightboxContext();
  const { prev, next } = useController();

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
          />

          <Button label="Next" icon={Next} renderIcon={iconNext} onClick={next} className={cssClass("button_next")} />
        </>
      )}

      {controls?.()}
    </>
  );
}
