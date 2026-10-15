import { describe, expect, it } from "vitest";
import { matchesSearch } from "./search";

describe("matchesSearch", () => {
  it.each([
    ["abc1234", "ABC-1234"],
    ["sao paulo", "Volvo · São Paulo (SP)"],
    ["VT-540", "VT540SP01"],
  ])("matches %s in %s", (query, text) => {
    expect(matchesSearch(query, [text])).toBe(true);
  });

  it("matches everything for an empty query", () => {
    expect(matchesSearch("  -  ", ["anything"])).toBe(true);
  });

  it("requires a contiguous match, not loose fuzzy matching", () => {
    expect(matchesSearch("zz", ["Belo Horizonte BHZ3C58"])).toBe(false);
  });
});
