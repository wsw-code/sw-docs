import { routes } from 'swdoc:routes';
import { matchRoutes } from 'react-router-dom';
import { Route } from 'node/plugin-routes';
import { PageData } from 'shared/types';
import { Layout } from '../theme-default';
import siteData from 'swdoc:site-data';

export async function initPageData(routePath: string): Promise<PageData> {
  // 获取路由组件编译后的模块内容
  const matched = matchRoutes(routes, routePath);

  if (matched) {
    // Preload route component
    // 待补充信息: preload 方法
    const moduleInfo = await (matched[0].route as Route).preload();
    console.log(moduleInfo.toc);
    return {
      pageType: moduleInfo.frontmatter?.pageType ?? 'doc',
      siteData,
      frontmatter: moduleInfo.frontmatter,
      pagePath: routePath,
      toc: moduleInfo.toc
    };
  }
  return {
    pageType: '404',
    siteData,
    pagePath: routePath,
    frontmatter: {}
  };
}

export function App() {
  return <Layout />;
}
