import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TruckListSkeleton } from ".";

describe("TruckListSkeleton Component", () => {
  it("should render 3 Skeletons inside Cards", () => {
    render(<TruckListSkeleton />);

    const cards = screen.getAllByTestId("Card");
    expect(cards.length).toBe(3);

    const skeletons = screen.getAllByTestId("Skeleton");
    expect(skeletons.length).toBe(9);
  });
});
