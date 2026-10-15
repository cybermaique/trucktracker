import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import Toolbar from ".";
import { DEMO_USER } from "../../constants/user";
import { useSnackbarStore } from "../../stores/snackbar";

const renderToolbar = (onClickMenu = vi.fn()) => {
  render(
    <MemoryRouter>
      <Toolbar onClickMenu={onClickMenu} />
    </MemoryRouter>
  );
  return { onClickMenu };
};

describe("Toolbar", () => {
  afterEach(() => {
    useSnackbarStore.getState().closeSnackbar();
  });

  it("should render the brand linking to the home page and the user", () => {
    renderToolbar();

    expect(
      screen.getByRole("link", { name: /trucktracker — página inicial/i })
    ).toHaveAttribute("href", "/");
    expect(screen.getByText(DEMO_USER.name)).toBeInTheDocument();
  });

  it("should call onClickMenu when the menu button is clicked", async () => {
    const { onClickMenu } = renderToolbar();

    await userEvent.click(
      screen.getByRole("button", { name: /abrir ou fechar menu/i })
    );

    expect(onClickMenu).toHaveBeenCalledTimes(1);
  });

  it("should open the account menu and inform that logout is unavailable", async () => {
    renderToolbar();
    const accountButton = screen.getByRole("button", {
      name: new RegExp(DEMO_USER.name),
    });

    await userEvent.click(accountButton);
    expect(accountButton).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(screen.getByRole("menuitem", { name: /sair/i }));

    expect(useSnackbarStore.getState()).toMatchObject({
      open: true,
      severity: "info",
    });
  });
});
