import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";

import { renderLightbox } from "./test-utils";
import { IconButton } from "../src";
import { Close } from "../src/components/icons";

describe("IconButton", () => {
  it("forwards ref to the underlying button element", () => {
    const ref = createRef<HTMLButtonElement>();

    renderLightbox({
      toolbar: {
        buttons: [<IconButton key="custom" ref={ref} label="Custom" icon={Close} />],
      },
    });

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toHaveAttribute("aria-label", "Custom");
  });

  it("spreads arbitrary native button props", () => {
    renderLightbox({
      toolbar: {
        buttons: [
          <IconButton
            key="custom"
            label="Custom"
            icon={Close}
            id="custom-id"
            tabIndex={-1}
            data-testid="custom-button"
            aria-pressed
          />,
        ],
      },
    });

    const button = screen.getByTestId("custom-button");
    expect(button).toHaveAttribute("id", "custom-id");
    expect(button).toHaveAttribute("tabindex", "-1");
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("translates known Label keys and accepts arbitrary strings", () => {
    renderLightbox({
      labels: { Close: "Dismiss", Download: "Télécharger" },
      toolbar: {
        buttons: [
          <IconButton key="known" label="Close" icon={Close} data-testid="known" />,
          <IconButton key="custom-key" label="Download" icon={Close} data-testid="custom-key" />,
          <IconButton key="untranslated" label="My custom action" icon={Close} data-testid="untranslated" />,
        ],
      },
    });

    expect(screen.getByTestId("known")).toHaveAttribute("aria-label", "Dismiss");
    expect(screen.getByTestId("custom-key")).toHaveAttribute("aria-label", "Télécharger");
    expect(screen.getByTestId("untranslated")).toHaveAttribute("aria-label", "My custom action");
  });

  it("soft-disables when `disabled` is set", () => {
    const onClick = vi.fn();

    renderLightbox({
      toolbar: {
        buttons: [
          <IconButton key="custom" label="Custom" icon={Close} disabled onClick={onClick} data-testid="custom" />,
        ],
      },
    });

    const button = screen.getByTestId("custom");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).not.toBeDisabled();

    button.click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders `renderIcon` output instead of the default icon when provided", () => {
    renderLightbox({
      toolbar: {
        buttons: [
          <IconButton
            key="custom"
            label="Custom"
            icon={Close}
            renderIcon={() => <span data-testid="custom-icon">X</span>}
            data-testid="custom"
          />,
        ],
      },
    });

    const button = screen.getByTestId("custom");
    expect(button.querySelector('[data-testid="custom-icon"]')).toBeInTheDocument();
    expect(button.querySelector(".yarll__icon")).not.toBeInTheDocument();
  });

  it("lets `slots.button` override caller props", () => {
    const callerClick = vi.fn();
    const slotClick = vi.fn();

    renderLightbox({
      slots: { button: { onClick: slotClick, className: "slot-class" } },
      toolbar: {
        buttons: [
          <IconButton
            key="custom"
            label="Custom"
            icon={Close}
            onClick={callerClick}
            className="caller-class"
            data-testid="custom"
          />,
        ],
      },
    });

    const button = screen.getByTestId("custom");
    expect(button.className).toContain("slot-class");
    expect(button.className).toContain("caller-class");
    expect(button.className).toContain("yarll__button");

    button.click();
    expect(slotClick).toHaveBeenCalledTimes(1);
    expect(callerClick).not.toHaveBeenCalled();
  });
});
