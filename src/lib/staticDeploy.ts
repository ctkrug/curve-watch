/**
 * Finds document asset URLs that would escape a static-host subpath.
 * Protocol, data, hash, and relative URLs are safe because they do not resolve
 * to the host root when Curve Watch is mounted below a domain path.
 */
export function rootRelativeAssetUrls(documentMarkup: string): string[] {
  if (typeof documentMarkup !== "string") {
    throw new TypeError("Static document markup must be a string");
  }

  const urls: string[] = [];
  const attribute = /\b(?:src|href)\s*=\s*(["'])(.*?)\1/gi;
  for (const match of documentMarkup.matchAll(attribute)) {
    const url = match[2].trim();
    if (url.startsWith("/") && !url.startsWith("//")) urls.push(url);
  }
  return urls;
}

export function assertSubpathSafeDocument(documentMarkup: string): void {
  const unsafeUrls = rootRelativeAssetUrls(documentMarkup);
  if (unsafeUrls.length > 0) {
    throw new Error(`Static build contains root-relative asset URLs: ${unsafeUrls.join(", ")}`);
  }
}
