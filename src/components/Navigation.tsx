import { cssClass } from "../utils";
import { useController } from "./Controller";
import { IconButton } from "./IconButton";
import { Next, Previous } from "./icons";
import { useLightboxContext } from "./LightboxContext";

export function Navigation() {
  const {
    slides,
    index,
    carousel: { infinite },
    render: { iconPrev, iconNext, controls },
  } = useLightboxContext();
  const { prev, next } = useController();

  return (
    <>
      {slides.length > 1 && (
        <>
          <IconButton
            label="Previous"
            icon={Previous}
            renderIcon={iconPrev}
            onClick={prev}
            className={cssClass("button_prev")}
            disabled={!infinite && index <= 0}
          />

          <IconButton
            label="Next"
            icon={Next}
            renderIcon={iconNext}
            onClick={next}
            className={cssClass("button_next")}
            disabled={!infinite && index >= slides.length - 1}
          />
        </>
      )}

      {controls?.()}
    </>
  );
}
