import { createServer as createViteDevServer } from 'vite';
import { pluginIndexHtml } from './plugin-swdoc/indexHtml';
import { resolveConfig } from './config';
import pluginReact from '@vitejs/plugin-react';
import { pluginConfig } from './plugin-swdoc/config';
import { PACKAGE_ROOT } from './constants';
import { pluginRoutes } from './plugin-routes';
import { createVitePlugins } from './vitePlugins';

export async function createDevServer(
  root = process.cwd(),
  restartServer: () => Promise<void>
) {
  const config = await resolveConfig(root, 'serve', 'development');

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
