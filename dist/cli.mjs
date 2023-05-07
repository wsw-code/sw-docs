import {
  CLIENT_ENTRY_PATH,
  SERVER_ENTRY_PATH,
  createVitePlugins
} from "./chunk-P4Q2DABY.mjs";
import {
  resolveConfig
} from "./chunk-AAQVMNX3.mjs";

// src/node/cli.ts
import { cac } from "cac";

// src/node/build.ts
import { build as viteBuild } from "vite";
import { pathToFileURL } from "url";
import fs from "fs-extra";
import path, { join, dirname } from "path";
async function bundle(root, config) {
  const resolveViteConfig = async (isServer) => ({
    mode: "production",
    root,
    // plugins: [pluginReact(), pluginConfig(config)],
    plugins: await createVitePlugins(config, void 0, isServer),
    ssr: {
      // 注意加上这个配置，防止 cjs 产物中 require ESM 的产物，因为 react-router-dom 的产物为 ESM 格式
      noExternal: ["react-router-dom"]
    },
    build: {
      ssr: isServer,
      outDir: isServer ? path.join(root, ".temp") : path.join(root, "build"),
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
      viteBuild(await resolveViteConfig(false)),
      // server build
      viteBuild(await resolveViteConfig(true))
    ]);
    return [clientBundle, serverBundle];
  } catch (e) {
    console.log(e);
  }
}
async function renderPage(render, routes, root, clientBundle) {
  const clientChunk = clientBundle.output.find(
    (chunk) => chunk.type === "chunk" && chunk.isEntry
  );
  console.log("Rendering page in server side...");
  return Promise.all(
    routes.map(async (route) => {
      const routePath = route.path;
      const appHtml = render(routePath);
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
      const fileName = routePath.endsWith("/") ? `${routePath}index.html` : `${routePath}.html`;
      await fs.ensureDir(join(root, "build", dirname(fileName)));
      await fs.writeFile(join(root, "build", fileName), html);
    })
  );
}
async function build(root = process.cwd(), config) {
  const [clientBundle, serverBundle] = await bundle(root, config);
  const serverEntryPath = pathToFileURL(join(root, ".temp", "ssr-entry.js")) + "";
  const { render, routes } = await import(serverEntryPath);
  try {
    await renderPage(render, routes, root, clientBundle);
    console.log("build ok");
  } catch (error) {
    console.log(error);
  }
}

// src/node/cli.ts
import { resolve } from "path";
var cli = cac("swdoc").version("0.0.1").help();
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
  try {
    root = resolve(root);
    const config = await resolveConfig(root, "build", "production");
    await build(root, config);
  } catch (e) {
    console.log(e);
  }
});
cli.parse();
