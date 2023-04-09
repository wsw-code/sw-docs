import { createServer as createViteDevServer } from 'vite';
import { pluginIndexHtml } from './plugin-swdoc/indexHtml';
import { resolveConfig } from './config';
import pluginReact from '@vitejs/plugin-react';
import { pluginConfig } from './plugin-swdoc/config';

export async function createDevServer(
  root = process.cwd(),
  restartServer: () => Promise<void>
) {
  const config = await resolveConfig(root, 'serve', 'development');

  return createViteDevServer({
    root,
    plugins: [
      pluginIndexHtml(),
      pluginReact(),
      pluginConfig(config, restartServer)
    ]
  });
}
