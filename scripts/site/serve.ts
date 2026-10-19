// 組み立てたサイトを手元で配る小さな静的サーバ。撮影と確認にだけ使い、外には公開しない。
import { join, normalize } from "node:path";

export function serveStatic(directory: string, port = 0) {
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port,
    async fetch(request) {
      const url = new URL(request.url);
      const path = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
      const candidates = path.endsWith("/")
        ? [join(directory, path, "index.html")]
        : [join(directory, path), join(directory, path, "index.html")];
      for (const candidate of candidates) {
        if (!candidate.startsWith(directory)) {
          continue;
        }
        const file = Bun.file(candidate);
        if (await file.exists()) {
          return new Response(file);
        }
      }
      return new Response("Not Found", { status: 404 });
    },
  });
  return { url: `http://127.0.0.1:${server.port}/`, stop: () => server.stop(true) };
}

// make site-preview で .site を確かめる。
if (import.meta.main) {
  const directory = join(import.meta.dir, "../../.site");
  const server = serveStatic(directory, Number(process.env.PORT ?? 46281));
  console.log(`${server.url} で .site を配っています（Ctrl+C で止まります）`);
}
