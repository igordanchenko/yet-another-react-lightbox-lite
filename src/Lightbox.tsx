import { Carousel, Controller, LightboxContext, Navigation, Portal, Toolbar } from "./components";
import { LightboxProps } from "./types";

export default function Lightbox({ slides, index, setIndex, ...rest }: LightboxProps) {
  if (!Array.isArray(slides) || index === undefined || index < 0 || index >= slides.length) return null;

  return (
    <LightboxContext {...{ slides, index, ...rest }}>
      <Controller {...{ setIndex }}>
        <Portal>
          <Toolbar />
          <Carousel />
          <Navigation />
        </Portal>
      </Controller>
    </LightboxContext>
  );
}
