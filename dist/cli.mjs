import {
  CLIENT_ENTRY_PATH,
  SERVER_ENTRY_PATH
} from "./chunk-YIIII3XA.mjs";
import "./chunk-HQALMRJB.mjs";

// src/node/cli.ts
import { cac } from "cac";

// src/node/build.ts
import { build as viteBuild } from "vite";
import { pathToFileURL } from "url";
import fs from "fs-extra";
import { join } from "path";
async function bundle(root) {
  const resolveViteConfig = (isServer) => ({
    mode: "production",
    root,
    build: {
      ssr: isServer,
      outDir: isServer ? ".temp" : "build",
      rollupOptions: {
        input: isServer ? SERVER_ENTRY_PATH : CLIENT_ENTRY_PATH,
        output: {
          format: isServer ? "cjs" : "esm"
        }
      }
    }
  });
  console.log("Building client + server bundles...");
  try {
    const [clientBundle, serverBundle] = await Promise.all([
      // client build
      viteBuild(resolveViteConfig(false)),
      // server build
      viteBuild(resolveViteConfig(true))
    ]);
    return [clientBundle, serverBundle];
  } catch (e) {
    console.log(e);
  }
}
async function renderPage(render, root, clientBundle) {
  const clientChunk = clientBundle.output.find(
    (chunk) => chunk.type === "chunk" && chunk.isEntry
  );
  console.log("Rendering page in server side...");
  const appHtml = render();
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>title</title>
      <meta name="description" content="xxx">
    </head>
    <body>
      <div id="root">${appHtml}</div>
      <script type="module" src="/${clientChunk?.fileName}"></script>
    </body>
  </html>`.trim();
  await fs.ensureDir(join(root, "build"));
  await fs.writeFile(join(root, "build/index.html"), html);
  await fs.remove(join(root, ".temp"));
}
async function build(root = process.cwd()) {
  const [clientBundle, serverBundle] = await bundle(root);
  const serverEntryPath = pathToFileURL(join(root, ".temp", "ssr-entry.js")) + "";
  const { render } = await import(serverEntryPath);
  await renderPage(render, root, clientBundle);
}

// src/node/cli.ts
import { resolve } from "path";
var cli = cac("island").version("0.0.1").help();
cli.command("[root]", "start dev server").alias("dev").action(async (root) => {
  const createServer = async () => {
    const { createDevServer } = await import("./dev.mjs");
    const server = await createDevServer(root, async () => {
      await server.close();
      await createServer();
    });
    await server.listen();
    server.printUrls();
  };
  await createServer();
});
cli.command("build [root]", "build for production").action(async (root) => {
  root = resolve(root);
  await build(root);
});
cli.parse();