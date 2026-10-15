import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import AppSnackbar from ".";
import { useSnackbarStore } from "../../stores/snackbar";

describe("AppSnackbar", () => {
  afterEach(() => {
    act(() => useSnackbarStore.getState().closeSnackbar());
  });

  it("should display the message from the store with its severity", () => {
    render(<AppSnackbar />);

    act(() =>
      useSnackbarStore.getState().showSnackbar("Salvo com sucesso!", "success")
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Salvo com sucesso!");
    expect(screen.getByRole("alert")).toHaveClass("MuiAlert-filledSuccess");
  });

  it("should close when the close button is clicked", async () => {
    render(<AppSnackbar />);
    act(() => useSnackbarStore.getState().showSnackbar("Mensagem", "info"));

    await userEvent.click(screen.getByRole("button", { name: /close/i }));

    expect(useSnackbarStore.getState().open).toBe(false);
  });
});
