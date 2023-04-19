import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import type { Element, Root } from 'hast';

export const rehypePluginPreWrapper: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'element', (node) => {
      // <pre><code>...</code></pre>
      // 1. 找到 pre 元素
      // 2. 解析出代码的语言名称
      // 3. 变换 Html AST
    });
  };
};
