import { cac } from 'cac';
import * as path from 'path';
import { createDevServer } from './dev';
import { build } from './build';
import { resolve } from 'path';

const cli = cac('island').version('0.0.1').help();

cli
  .command('[root]', 'start dev server')
  .alias('dev')
  .action(async (root: string) => {
    const createServer = async () => {
      const { createDevServer } = await import('./dev.js');
      const server = await createDevServer(root, async () => {
        await server.close();
        await createServer();
      });
      await server.listen();
      server.printUrls();
    };
    await createServer();
  });

cli
  .command('build [root]', 'build for production')
  .action(async (root: string) => {
    root = resolve(root);
    await build(root);
  });

cli.parse();
