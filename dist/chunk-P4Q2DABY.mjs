import {
  __dirname
} from "./chunk-AAQVMNX3.mjs";

// src/node/constants/index.ts
import { join } from "path";
var PACKAGE_ROOT = join(__dirname, "..");
var DEFAULT_HTML_PATH = join(PACKAGE_ROOT, "template.html");
var CLIENT_ENTRY_PATH = join(
  PACKAGE_ROOT,
  "src",
  "runtime",
  "client-entry.tsx"
);
var SERVER_ENTRY_PATH = join(
  PACKAGE_ROOT,
  "src",
  "runtime",
  "ssr-entry.tsx"
);
var MD_REGEX = /\.mdx?$/;

// src/node/plugin-swdoc/indexHtml.ts
import { readFile } from "fs/promises";
function pluginIndexHtml() {
  return {
    name: "swdoc:index-html",
    apply: "serve",
    // 插入入口 script 标签
    transformIndexHtml(html) {
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              type: "module",
              src: `/@fs/${CLIENT_ENTRY_PATH}`
            },
            injectTo: "body"
          }
        ]
      };
    },
    configureServer(server) {
      return () => {
        server.middlewares.use(async (req, res, next) => {
          let html = await readFile(DEFAULT_HTML_PATH, "utf-8");
          try {
            html = await server.transformIndexHtml(
              req.url,
              html,
              req.originalUrl
            );
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            res.end(html);
          } catch (e) {
            return next(e);
          }
        });
      };
    }
  };
}

// src/node/vitePlugins.ts
import pluginReact from "@vitejs/plugin-react";

// src/node/plugin-swdoc/config.ts
import { relative } from "path";
import { normalizePath } from "vite";
import { join as join2 } from "path";
import sirv from "sirv";
var SITE_DATA_ID = "swdoc:site-data";
function pluginConfig(config, restartServer) {
  return {
    name: "swdoc:config",
    config() {
      return {
        root: PACKAGE_ROOT,
        resolve: {
          alias: {
            "@runtime": join2(PACKAGE_ROOT, "src", "runtime", "index.ts")
          }
        },
        css: {
          modules: {
            localsConvention: "camelCaseOnly"
          }
        }
      };
    },
    resolveId(id) {
      if (id === SITE_DATA_ID) {
        return "\0" + SITE_DATA_ID;
      }
    },
    load(id) {
      if (id === "\0" + SITE_DATA_ID) {
        return `export default ${JSON.stringify(config.siteData)}`;
      }
    },
    async handleHotUpdate(ctx) {
      console.log(ctx.file);
      const customWatchedFiles = [normalizePath(config.configPath)];
      const include = (id) => customWatchedFiles.some((file) => id.includes(file));
      if (include(ctx.file)) {
        console.log(
          `
${relative(config.root, ctx.file)} changed, restarting server...`
        );
        await restartServer();
      }
    },
    configureServer(server) {
      const publicDir = join2(config.root, "public");
      server.middlewares.use(sirv(publicDir));
    }
  };
}

// src/node/plugin-routes/RouteService.ts
import fastGlob from "fast-glob";
import { normalizePath as normalizePath2 } from "vite";
import path from "path";
var RouteService = class {
  #scanDir;
  #routeData = [];
  constructor(scanDir) {
    this.#scanDir = scanDir;
  }
  async init() {
    const files = fastGlob.sync(["**/*.{js,jsx,ts,tsx,md,mdx}"], {
      cwd: this.#scanDir,
      absolute: true,
      ignore: ["**/node_modules/**", "**/build/**", "config.ts"]
    }).sort();
    files.forEach((file) => {
      const fileRelativePath = normalizePath2(
        path.relative(this.#scanDir, file)
      );
      const routePath = this.normalizeRoutePath(fileRelativePath);
      this.#routeData.push({
        routePath,
        absolutePath: file
      });
    });
  }
  getRouteMeta() {
    return this.#routeData;
  }
  normalizeRoutePath(rawPath) {
    const routePath = rawPath.replace(/\.(.*)?$/, "").replace(/index$/, "");
    return routePath.startsWith("/") ? routePath : `/${routePath}`;
  }
  generateRoutesCode(ssr = false) {
    return `
    import React from 'react';
    import loadable from '@loadable/component';
    ${this.#routeData.map((route, index) => {
      return ssr ? `import Route${index} from "${route.absolutePath}";` : `const Route${index} = loadable(() => import('${route.absolutePath}'));`;
    }).join("\n")}
    export const routes = [
      ${this.#routeData.map((route, index) => {
      return `{ path: '${route.routePath}', element: React.createElement(Route${index}), preload: () => import('${route.absolutePath}') }`;
    }).join(",\n")}
    ];
`;
  }
};

// src/node/plugin-routes/index.ts
var CONVENTIONAL_ROUTE_ID = "swdoc:routes";
function pluginRoutes(options2) {
  const routeService = new RouteService(options2.root);
  return {
    name: "swdoc:routes",
    async configResolved() {
      await routeService.init();
    },
    resolveId(id) {
      if (id === CONVENTIONAL_ROUTE_ID) {
        return "\0" + id;
      }
    },
    load(id) {
      if (id === "\0" + CONVENTIONAL_ROUTE_ID) {
        return routeService.generateRoutesCode(options2.isSSR || false);
      }
    }
  };
}

// src/node/plugin-mdx/pluginMdxHmr.ts
import assert from "assert";
function pluginMdxHMR() {
  let viteReactPlugin;
  return {
    name: "vite-plugin-mdx-hmr",
    apply: "serve",
    configResolved(config) {
      viteReactPlugin = config.plugins.find(
        (plugin) => plugin.name === "vite:react-babel"
      );
    },
    async transform(code, id, opts) {
      if (MD_REGEX.test(id)) {
        assert(typeof viteReactPlugin.transform === "function");
        const result = await viteReactPlugin.transform?.call(
          this,
          code,
          id + "?.jsx",
          opts
        );
        const selfAcceptCode = "import.meta.hot.accept();";
        if (typeof result === "object" && !result.code?.includes(selfAcceptCode)) {
          result.code += selfAcceptCode;
        }
        return result;
      }
    }
  };
}

// src/node/plugin-mdx/pluginMdxRollup.ts
import pluginMdx from "@mdx-js/rollup";
import remarkPluginGFM from "remark-gfm";
import rehypePluginAutolinkHeadings from "rehype-autolink-headings";
import rehypePluginSlug from "rehype-slug";
import remarkPluginMDXFrontMatter from "remark-mdx-frontmatter";
import remarkPluginFrontmatter from "remark-frontmatter";

// node_modules/.pnpm/unist-util-is@5.2.1/node_modules/unist-util-is/lib/index.js
var convert = (
  /**
   * @type {(
   *   (<Kind extends Node>(test: PredicateTest<Kind>) => AssertPredicate<Kind>) &
   *   ((test?: Test) => AssertAnything)
   * )}
   */
  /**
   * @param {Test} [test]
   * @returns {AssertAnything}
   */
  function(test) {
    if (test === void 0 || test === null) {
      return ok;
    }
    if (typeof test === "string") {
      return typeFactory(test);
    }
    if (typeof test === "object") {
      return Array.isArray(test) ? anyFactory(test) : propsFactory(test);
    }
    if (typeof test === "function") {
      return castFactory(test);
    }
    throw new Error("Expected function, string, or object as test");
  }
);
function anyFactory(tests) {
  const checks = [];
  let index = -1;
  while (++index < tests.length) {
    checks[index] = convert(tests[index]);
  }
  return castFactory(any);
  function any(...parameters) {
    let index2 = -1;
    while (++index2 < checks.length) {
      if (checks[index2].call(this, ...parameters))
        return true;
    }
    return false;
  }
}
function propsFactory(check) {
  return castFactory(all);
  function all(node) {
    let key;
    for (key in check) {
      if (node[key] !== check[key])
        return false;
    }
    return true;
  }
}
function typeFactory(check) {
  return castFactory(type);
  function type(node) {
    return node && node.type === check;
  }
}
function castFactory(check) {
  return assertion;
  function assertion(node, ...parameters) {
    return Boolean(
      node && typeof node === "object" && "type" in node && // @ts-expect-error: fine.
      Boolean(check.call(this, node, ...parameters))
    );
  }
}
function ok() {
  return true;
}

// node_modules/.pnpm/unist-util-visit-parents@5.1.3/node_modules/unist-util-visit-parents/lib/color.js
function color(d) {
  return "\x1B[33m" + d + "\x1B[39m";
}

// node_modules/.pnpm/unist-util-visit-parents@5.1.3/node_modules/unist-util-visit-parents/lib/index.js
var CONTINUE = true;
var EXIT = false;
var SKIP = "skip";
var visitParents = (
  /**
   * @type {(
   *   (<Tree extends Node, Check extends Test>(tree: Tree, test: Check, visitor: BuildVisitor<Tree, Check>, reverse?: boolean | null | undefined) => void) &
   *   (<Tree extends Node>(tree: Tree, visitor: BuildVisitor<Tree>, reverse?: boolean | null | undefined) => void)
   * )}
   */
  /**
   * @param {Node} tree
   * @param {Test} test
   * @param {Visitor<Node>} visitor
   * @param {boolean | null | undefined} [reverse]
   * @returns {void}
   */
  function(tree, test, visitor, reverse) {
    if (typeof test === "function" && typeof visitor !== "function") {
      reverse = visitor;
      visitor = test;
      test = null;
    }
    const is2 = convert(test);
    const step = reverse ? -1 : 1;
    factory(tree, void 0, [])();
    function factory(node, index, parents) {
      const value = node && typeof node === "object" ? node : {};
      if (typeof value.type === "string") {
        const name = (
          // `hast`
          typeof value.tagName === "string" ? value.tagName : (
            // `xast`
            typeof value.name === "string" ? value.name : void 0
          )
        );
        Object.defineProperty(visit2, "name", {
          value: "node (" + color(node.type + (name ? "<" + name + ">" : "")) + ")"
        });
      }
      return visit2;
      function visit2() {
        let result = [];
        let subresult;
        let offset;
        let grandparents;
        if (!test || is2(node, index, parents[parents.length - 1] || null)) {
          result = toResult(visitor(node, parents));
          if (result[0] === EXIT) {
            return result;
          }
        }
        if (node.children && result[0] !== SKIP) {
          offset = (reverse ? node.children.length : -1) + step;
          grandparents = parents.concat(node);
          while (offset > -1 && offset < node.children.length) {
            subresult = factory(node.children[offset], offset, grandparents)();
            if (subresult[0] === EXIT) {
              return subresult;
            }
            offset = typeof subresult[1] === "number" ? subresult[1] : offset + step;
          }
        }
        return result;
      }
    }
  }
);
function toResult(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "number") {
    return [CONTINUE, value];
  }
  return [value];
}

// node_modules/.pnpm/unist-util-visit@4.1.2/node_modules/unist-util-visit/lib/index.js
var visit = (
  /**
   * @type {(
   *   (<Tree extends Node, Check extends Test>(tree: Tree, test: Check, visitor: BuildVisitor<Tree, Check>, reverse?: boolean | null | undefined) => void) &
   *   (<Tree extends Node>(tree: Tree, visitor: BuildVisitor<Tree>, reverse?: boolean | null | undefined) => void)
   * )}
   */
  /**
   * @param {Node} tree
   * @param {Test} test
   * @param {Visitor} visitor
   * @param {boolean | null | undefined} [reverse]
   * @returns {void}
   */
  function(tree, test, visitor, reverse) {
    if (typeof test === "function" && typeof visitor !== "function") {
      reverse = visitor;
      visitor = test;
      test = null;
    }
    visitParents(tree, test, overload, reverse);
    function overload(node, parents) {
      const parent = parents[parents.length - 1];
      return visitor(
        node,
        parent ? parent.children.indexOf(node) : null,
        parent
      );
    }
  }
);

// src/node/plugin-mdx/rehypePlugins/preWrapper.ts
var rehypePluginPreWrapper = () => {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName === "pre" && node.children[0]?.type === "element" && node.children[0].tagName === "code" && !node.data?.isVisited) {
        const codeNode = node.children[0];
        const codeClassName = codeNode.properties?.className?.toString() || "";
        const lang = codeClassName.split("-")[1];
        const clonedNode = {
          type: "element",
          tagName: "pre",
          children: node.children,
          data: {
            isVisited: true
          }
        };
        node.tagName = "div";
        node.properties = node.properties || {};
        node.properties.className = codeClassName;
        node.children = [
          {
            type: "element",
            tagName: "span",
            properties: {
              className: "lang"
            },
            children: [
              {
                type: "text",
                value: lang
              }
            ]
          },
          clonedNode
        ];
      }
    });
  };
};

// src/node/plugin-mdx/rehypePlugins/shiki.ts
import { fromHtml } from "hast-util-from-html";
var rehypePluginShiki = ({ highlighter }) => {
  return (tree) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName === "pre" && node.children[0]?.type === "element" && node.children[0].tagName === "code") {
        console.log(11212);
        const codeNode = node.children[0];
        const codeContent = codeNode.children[0].value;
        const codeClassName = codeNode.properties?.className?.toString() || "";
        const lang = codeClassName.split("-")[1];
        console.log(lang);
        if (!lang) {
          return;
        }
        const highlightedCode = highlighter.codeToHtml(codeContent, { lang });
        const fragmentAst = fromHtml(highlightedCode, { fragment: true });
        parent.children.splice(index, 1, ...fragmentAst.children);
      }
    });
  };
};

// src/node/plugin-mdx/pluginMdxRollup.ts
import shiki from "shiki";
async function pluginMdxRollup() {
  return [
    pluginMdx({
      remarkPlugins: [
        remarkPluginGFM,
        remarkPluginFrontmatter,
        [remarkPluginMDXFrontMatter, { name: "frontmatter" }]
      ],
      rehypePlugins: [
        rehypePluginSlug,
        [
          rehypePluginAutolinkHeadings,
          {
            properties: {
              class: "header-anchor"
            },
            content: {
              type: "text",
              value: "#"
            }
          }
        ],
        rehypePluginPreWrapper,
        [
          rehypePluginShiki,
          { highlighter: await shiki.getHighlighter({ theme: "nord" }) }
        ]
      ]
    })
  ];
}

// src/node/plugin-mdx/index.ts
async function pluginMdx2() {
  return [await pluginMdxRollup(), pluginMdxHMR()];
}

// src/node/vitePlugins.ts
import pluginUnocss from "unocss/vite";

// src/node/unocssOptions.ts
import { presetAttributify, presetWind, presetIcons } from "unocss";
var options = {
  presets: [presetAttributify(), presetWind({}), presetIcons()],
  rules: [
    [
      /^divider-(\w+)$/,
      ([, w]) => ({
        [`border-${w}`]: "1px solid var(--island-c-divider-light)"
      })
    ]
  ],
  theme: {
    colors: {
      brandLight: "var(--island-c-brand-light)",
      brandDark: "var(--island-c-brand-dark)",
      brand: "var(--island-c-brand)",
      text: {
        1: "var(--island-c-text-1)",
        2: "var(--island-c-text-2)",
        3: "var(--island-c-text-3)",
        4: "var(--island-c-text-4)"
      },
      divider: {
        default: "var(--island-c-divider)",
        light: "var(--island-c-divider-light)",
        dark: "var(--island-c-divider-dark)"
      },
      gray: {
        light: {
          1: "var(--island-c-gray-light-1)",
          2: "var(--island-c-gray-light-2)",
          3: "var(--island-c-gray-light-3)",
          4: "var(--island-c-gray-light-4)"
        }
      },
      bg: {
        default: "var(--island-c-bg)",
        soft: "var(--island-c-bg-soft)",
        mute: "var(--island-c-bg-mute)"
      }
    }
  }
};
var unocssOptions_default = options;

// src/node/vitePlugins.ts
async function createVitePlugins(config, restartServer, isSSR = false) {
  return [
    pluginUnocss(unocssOptions_default),
    pluginIndexHtml(),
    pluginReact({
      jsxRuntime: "automatic"
    }),
    pluginConfig(config, restartServer),
    pluginRoutes({
      root: config.root,
      isSSR
    }),
    await pluginMdx2()
  ];
}

export {
  PACKAGE_ROOT,
  CLIENT_ENTRY_PATH,
  SERVER_ENTRY_PATH,
  createVitePlugins
};
