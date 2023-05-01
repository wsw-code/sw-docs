import { useState } from 'react';
import { Content } from '@runtime';
import { usePageData } from '../../runtime';
import 'uno.css';

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
  const getContent = () => {
    if (pageType === 'home') {
      return (
        <div p="2" m="4">
          Home 页面
        </div>
      );
    } else if (pageType === 'doc') {
      return (
        <div p="2" m="4">
          正文页面
        </div>
      );
    } else {
      return <div>404 页面</div>;
    }
  };
  return <div>{getContent()}</div>;
}
