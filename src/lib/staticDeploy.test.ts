import { describe, expect, it } from "vitest";
import { assertSubpathSafeDocument, rootRelativeAssetUrls } from "./staticDeploy";

describe("rootRelativeAssetUrls", () => {
  it("finds root-relative script and stylesheet URLs", () => {
    expect(rootRelativeAssetUrls('<link href="/assets/app.css"><script src="/assets/app.js"></script>')).toEqual([
      "/assets/app.css",
      "/assets/app.js",
    ]);
  });

  it("allows relative, data, protocol, and hash URLs", () => {
    const markup = '<link href="./assets/app.css"><img src="data:image/svg+xml,curve"><a href="#history"><a href="https://example.com">';
    expect(rootRelativeAssetUrls(markup)).toEqual([]);
  });

  it("handles empty markup and rejects malformed input", () => {
    expect(rootRelativeAssetUrls("")).toEqual([]);
    expect(() => rootRelativeAssetUrls(null as unknown as string)).toThrow("must be a string");
  });
});

describe("assertSubpathSafeDocument", () => {
  it("throws a useful error with each unsafe URL", () => {
    expect(() => assertSubpathSafeDocument('<script src="/entry.js"><img src="/curve.svg">')).toThrow(
      "/entry.js, /curve.svg",
    );
  });
});
