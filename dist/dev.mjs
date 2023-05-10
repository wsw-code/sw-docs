import {
  PACKAGE_ROOT,
  createVitePlugins
} from "./chunk-2QAE62BD.mjs";
import {
  resolveConfig
} from "./chunk-CC3L7WPI.mjs";

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
