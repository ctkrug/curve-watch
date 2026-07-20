import { describe, expect, it } from "vitest";
import { unavailableStateMarkup } from "./startup";

describe("unavailableStateMarkup", () => {
  it("renders a recoverable, labelled status with the supplied reason", () => {
    const markup = unavailableStateMarkup("Historical data is unavailable.");
    expect(markup).toContain('class="startup-state"');
    expect(markup).toContain('aria-labelledby="startup-heading"');
    expect(markup).toContain("Historical data is unavailable.");
    expect(markup).toContain('href="./"');
  });

  it("uses a clear default for empty or malformed reasons", () => {
    expect(unavailableStateMarkup("   ")).toContain("The historical record could not be loaded.");
    expect(unavailableStateMarkup(null as unknown as string)).toContain("The historical record could not be loaded.");
  });
});
