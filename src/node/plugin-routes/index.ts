import { Plugin } from 'vite';
import { ComponentType } from 'react';
import { RouteService } from './RouteService';
// 本质: 把文件目录结构 -> 路由数据

export type PageType = 'home' | 'doc' | 'custom' | '404';

export interface FrontMatter {
  title?: string;
  description?: string;
  pageType?: PageType;
  sidebar?: boolean;
  outline?: boolean;
}

export interface PageModule {
  default: ComponentType;
  frontmatter?: FrontMatter;
  [key: string]: unknown;
}

export interface Route {
  path: string;
  element: React.ReactElement;
  filePath: string;
  preload: () => Promise<PageModule>;
}

interface PluginOptions {
  root: string;
  isSSR: boolean;
}

export const CONVENTIONAL_ROUTE_ID = 'swdoc:routes';

export function pluginRoutes(options: PluginOptions): Plugin {
  const routeService = new RouteService(options.root);

  return {
    name: 'swdoc:routes',
    async configResolved() {
      await routeService.init();
    },
    resolveId(id: string) {
      if (id === CONVENTIONAL_ROUTE_ID) {
        return '\0' + id;
      }
    },

    load(id: string) {
      if (id === '\0' + CONVENTIONAL_ROUTE_ID) {
        return routeService.generateRoutesCode(options.isSSR || false);
      }
    }
  };
}
