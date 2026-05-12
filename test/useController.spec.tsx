import { describe, it } from "vitest";
import { act, screen } from "@testing-library/react";

import { expectCurrentSlideToBe, expectLightboxToBeClosed, expectLightboxToBeOpen, renderLightbox } from "./test-utils";
import { IconButton, useController } from "../src";
import { Close, Next, Previous } from "../src/components/icons";

function PrevButton() {
  const { prev } = useController();
  return <IconButton label="Previous (custom)" icon={Previous} onClick={prev} data-testid="prev" />;
}

function NextButton() {
  const { next } = useController();
  return <IconButton label="Next (custom)" icon={Next} onClick={next} data-testid="next" />;
}

function CloseButton() {
  const { close } = useController();
  return <IconButton label="Close (custom)" icon={Close} onClick={close} data-testid="close" />;
}

describe("useController", () => {
  it("exposes prev / next / close from inside a custom toolbar button", async () => {
    renderLightbox({
      toolbar: {
        buttons: [<PrevButton key="prev" />, <NextButton key="next" />, <CloseButton key="close" />],
      },
    });

    await expectLightboxToBeOpen();
    expectCurrentSlideToBe(0);

    act(() => screen.getByTestId("next").click());
    expectCurrentSlideToBe(1);

    act(() => screen.getByTestId("prev").click());
    expectCurrentSlideToBe(0);

    act(() => screen.getByTestId("close").click());
    await expectLightboxToBeClosed();
  });
});
