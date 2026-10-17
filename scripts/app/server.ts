// .app に入れるサーバ。127.0.0.1 だけで待ち受け、外には公開しない。
import { join, normalize, sep } from "node:path";
import handler from "../../dist/server/server.js";

const port = Number(process.env.PORT ?? "43124");
const clientDir = normalize(
  process.env.YOROZUYA_CLIENT_DIR ?? join(import.meta.dir, "../../dist/client"),
);

async function staticFile(pathname: string): Promise<Response | null> {
  const file = normalize(join(clientDir, decodeURIComponent(pathname)));
  if (!file.startsWith(clientDir + sep)) {
    return null;
  }
  const blob = Bun.file(file);
  if (!(await blob.exists())) {
    return null;
  }
  return new Response(blob, {
    headers: { "cache-control": "public, max-age=31536000, immutable" },
  });
}

Bun.serve({
  hostname: "127.0.0.1",
  port,
  async fetch(request) {
    const { pathname } = new URL(request.url);
    if (pathname.startsWith("/assets/")) {
      const response = await staticFile(pathname);
      if (response) {
        return response;
      }
    }
    return handler.fetch(request);
  },
});

console.log(`よろずや: http://127.0.0.1:${port}/`);
