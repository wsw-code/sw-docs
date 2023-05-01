import {
  PACKAGE_ROOT,
  createVitePlugins
} from "./chunk-X5TN3O7I.mjs";
import {
  resolveConfig
} from "./chunk-AAQVMNX3.mjs";

// src/node/dev.ts
import { createServer as createViteDevServer } from "vite";
async function createDevServer(root = process.cwd(), restartServer) {
  const config = await resolveConfig(root, "serve", "development");
  return createViteDevServer({
    root: PACKAGE_ROOT,
    plugins: await createVitePlugins(config, restartServer),
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
