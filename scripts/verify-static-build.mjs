import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, relative } from "node:path";

const distDir = new URL("../dist/", import.meta.url);
const mount = "/curve-watch/";
const mimeTypes = { ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml" };
const index = await readFile(new URL("index.html", distDir), "utf8");
const urls = [...index.matchAll(/\b(?:src|href)="([^"]+)"/g)].map((match) => match[1]);

if (urls.some((url) => url.startsWith("/") && !url.startsWith("//"))) {
  throw new Error("Built document contains a root-relative asset URL");
}

const server = createServer(async (request, response) => {
  const requestPath = new URL(request.url ?? "/", "http://localhost").pathname;
  if (!requestPath.startsWith(mount)) return response.writeHead(404).end();
  const target = requestPath === mount ? "index.html" : requestPath.slice(mount.length);
  const filename = normalize(join(distDir.pathname, target));
  if (relative(distDir.pathname, filename).startsWith("..")) return response.writeHead(400).end();
  try {
    const info = await stat(filename);
    if (!info.isFile()) return response.writeHead(404).end();
    response.writeHead(200, { "content-type": mimeTypes[extname(filename)] ?? "application/octet-stream" });
    response.end(await readFile(filename));
  } catch {
    response.writeHead(404).end();
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
try {
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Could not start verification server");
  const origin = `http://127.0.0.1:${address.port}${mount}`;
  for (const url of urls.filter((url) => !url.startsWith("data:") && !url.startsWith("#"))) {
    const response = await fetch(new URL(url, origin));
    if (!response.ok) throw new Error(`Asset did not load from subpath: ${url} (${response.status})`);
  }
  console.log(`Verified ${urls.length} document assets from ${mount}`);
} finally {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}
