import { serveDir } from "https://deno.land/std@0.204.0/http/file_server.ts";

Deno.serve((req) => {
  const fsRoot = new URL("./dist", import.meta.url);
  return serveDir(req, {
    fsRoot: fsRoot.pathname,
  });
});
