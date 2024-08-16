import { Carousel, Controller, LightboxContext, Navigation, Portal, Toolbar, Zoom } from "./components";
import { LightboxProps } from "./types";

/** Lightbox component */
export default function Lightbox({ slides, index, setIndex, ...rest }: LightboxProps) {
  if (!Array.isArray(slides) || index === undefined || index < 0 || index >= slides.length) return null;

  return (
    <LightboxContext {...{ slides, index, ...rest }}>
      <Controller {...{ setIndex }}>
        <Zoom>
          <Portal>
            <Toolbar />
            <Carousel />
            <Navigation />
          </Portal>
        </Zoom>
      </Controller>
    </LightboxContext>
  );
}
