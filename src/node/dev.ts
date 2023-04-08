import { createServer as createViteDevServer } from 'vite';
import { pluginIndexHtml } from './plugin-swdoc/indexHtml';
import { resolveConfig } from './config';
import pluginReact from '@vitejs/plugin-react';

export async function createDevServer(root = process.cwd()) {
  const config = await resolveConfig(root, 'serve', 'development');
  console.log(config);
  return createViteDevServer({
    root,
    plugins: [pluginIndexHtml(), pluginReact()]
  });
}
