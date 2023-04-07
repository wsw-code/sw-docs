import { createServer as createViteDevServer } from 'vite';
import { pluginIndexHtml } from './plugin-swdoc/indexHtml';
import pluginReact from '@vitejs/plugin-react';

export async function createDevServer(root = process.cwd()) {
  console.log('root = ', root);
  return createViteDevServer({
    root,
    plugins: [pluginIndexHtml(), pluginReact()]
  });
}
