import { useState } from 'react';
import { Content } from '@runtime';
import '../styles/base.css';
import '../styles/vars.css';
import '../styles/doc.css';
import { usePageData } from '../../runtime';
import { Nav } from '../components/Nav';
import { DocLayout } from './DocLayout';

import 'uno.css';
import { HomeLayout } from './HomeLayout/index';

// export function Layout() {
//   return (
//     <div>
//       <Nav />
//     </div>
//   );
// }

// export function Layout() {
//   const pageData = usePageData();
//   return (
//     <div>
//       <h1 p="2" m="4">
//         Common Content
//       </h1>
//       <h1>Doc Content</h1>
//       <Content />
//     </div>
//   );
// }

export function Layout() {
  const pageData = usePageData();
  const { pageType } = pageData;
  console.log('pageType = ', pageType);
  const getContent = () => {
    if (pageType === 'home') {
      return <HomeLayout />;
    } else if (pageType === 'doc') {
      return <DocLayout />;
    } else {
      return <div>404 页面</div>;
    }
  };
  return (
    <div>
      <Nav />
      <section style={{ paddingTop: 'var(--island-nav-height)' }}>
        {getContent()}
      </section>
    </div>
  );
}
