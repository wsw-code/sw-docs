import {
  PACKAGE_ROOT,
  createVitePlugins
} from "./chunk-F4J3EVJY.mjs";
import {
  resolveConfig
} from "./chunk-AAQVMNX3.mjs";

// src/node/dev.ts
import { createServer as createViteDevServer } from "vite";
async function createDevServer(root = process.cwd(), restartServer) {
  const config = await resolveConfig(root, "serve", "development");
  return createViteDevServer({
    root: PACKAGE_ROOT,
    // plugins: [
    //   pluginIndexHtml(),
    //   pluginReact(),
    //   pluginConfig(config, restartServer),
    //   pluginRoutes({
    //     root: config.root
    //   })
    // ],
    plugins: createVitePlugins(config, restartServer),
    server: {
      fs: {
        allow: [PACKAGE_ROOT]
      }
    }
  });
}
export {
  createDevServer
};
