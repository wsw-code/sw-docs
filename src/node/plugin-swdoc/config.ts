import { relative } from 'path';
import { Plugin, normalizePath } from 'vite';
import { SiteConfig } from 'shared/types/index';
import { PACKAGE_ROOT } from '../../node/constants';
import { join } from 'path';
const SITE_DATA_ID = 'swdoc:site-data';

export function pluginConfig(
  config: SiteConfig,
  restartServer?: () => Promise<void>
): Plugin {
  return {
    name: 'swdoc:config',
    config() {
      return {
        root: PACKAGE_ROOT,
        resolve: {
          alias: {
            '@runtime': join(PACKAGE_ROOT, 'src', 'runtime', 'index.ts')
          }
        },
        css: {
          modules: {
            localsConvention: 'camelCaseOnly'
          }
        }
      };
    },
    resolveId(id) {
      if (id === SITE_DATA_ID) {
        return '\0' + SITE_DATA_ID;
      }
    },
    load(id) {
      if (id === '\0' + SITE_DATA_ID) {
        return `export default ${JSON.stringify(config.siteData)}`;
      }
    },
    async handleHotUpdate(ctx) {
      console.log(ctx.file);
      const customWatchedFiles = [normalizePath(config.configPath)];
      const include = (id: string) =>
        customWatchedFiles.some((file) => id.includes(file));
      if (include(ctx.file)) {
        console.log(
          `\n${relative(config.root, ctx.file)} changed, restarting server...`
        );
        // 重点: 重启 Dev Server
        await restartServer();
      }
    }
  };
}
