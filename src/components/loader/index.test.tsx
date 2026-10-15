import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Loader, PageLoader } from ".";
import { useLoadingStore } from "../../stores/loading";

describe("Loader", () => {
  afterEach(() => {
    useLoadingStore.setState({ isLoading: false });
  });

  it("should show the backdrop while loading", () => {
    useLoadingStore.setState({ isLoading: true });

    render(<Loader />);

    expect(screen.getByTestId("backdrop")).toBeVisible();
    expect(screen.getByTestId("circular-progress")).toBeInTheDocument();
  });

  it("should keep the backdrop hidden when idle", () => {
    render(<Loader />);

    expect(screen.getByTestId("backdrop")).not.toBeVisible();
  });
});

describe("PageLoader", () => {
  it("should render an accessible progress indicator", () => {
    render(<PageLoader />);

    expect(
      screen.getByRole("progressbar", { name: /carregando página/i })
    ).toBeInTheDocument();
  });
});
