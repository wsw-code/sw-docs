"use strict"; function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }



var _chunkBVU3VW2Zjs = require('./chunk-BVU3VW2Z.js');


var _chunkTU5ZQHWFjs = require('./chunk-TU5ZQHWF.js');

// src/node/cli.ts
var _cac = require('cac');

// src/node/build.ts
var _vite = require('vite');
var _url = require('url');
var _fsextra = require('fs-extra'); var _fsextra2 = _interopRequireDefault(_fsextra);
var _path = require('path');
async function bundle(root, config) {
  const resolveViteConfig = (isServer) => ({
    mode: "production",
    root,
    // plugins: [pluginReact(), pluginConfig(config)],
    plugins: _chunkBVU3VW2Zjs.createVitePlugins.call(void 0, config),
    ssr: {
      // 注意加上这个配置，防止 cjs 产物中 require ESM 的产物，因为 react-router-dom 的产物为 ESM 格式
      noExternal: ["react-router-dom"]
    },
    build: {
      ssr: isServer,
      outDir: isServer ? _path.join.call(void 0, root, ".temp") : "build",
      rollupOptions: {
        input: isServer ? _chunkBVU3VW2Zjs.SERVER_ENTRY_PATH : _chunkBVU3VW2Zjs.CLIENT_ENTRY_PATH,
        output: {
          format: isServer ? "cjs" : "esm"
        }
      }
    }
  });
  console.log("Building client + server bundles...");
  try {
    const [clientBundle, serverBundle] = await Promise.all([
      // client build
      _vite.build.call(void 0, resolveViteConfig(false)),
      // server build
      _vite.build.call(void 0, resolveViteConfig(true))
    ]);
    return [clientBundle, serverBundle];
  } catch (e) {
    console.log(e);
  }
}
async function renderPage(render, root, clientBundle) {
  const clientChunk = clientBundle.output.find(
    (chunk) => chunk.type === "chunk" && chunk.isEntry
  );
  console.log("Rendering page in server side...");
  const appHtml = render();
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>title</title>
      <meta name="description" content="xxx">
    </head>
    <body>
      <div id="root">${appHtml}</div>
      <script type="module" src="/${_optionalChain([clientChunk, 'optionalAccess', _ => _.fileName])}"></script>
    </body>
  </html>`.trim();
  await _fsextra2.default.ensureDir(_path.join.call(void 0, root, "build"));
  await _fsextra2.default.writeFile(_path.join.call(void 0, root, "build/index.html"), html);
  await _fsextra2.default.remove(_path.join.call(void 0, root, ".temp"));
}
async function build(root = process.cwd(), config) {
  const [clientBundle, serverBundle] = await bundle(root, config);
  const serverEntryPath = _url.pathToFileURL.call(void 0, _path.join.call(void 0, root, ".temp", "ssr-entry.js")) + "";
  const { render } = await Promise.resolve().then(() => _interopRequireWildcard(require(serverEntryPath)));
  try {
    await renderPage(render, root, clientBundle);
    console.log("build ok");
  } catch (error) {
    console.log(error);
  }
}

// src/node/cli.ts

var cli = _cac.cac.call(void 0, "island").version("0.0.1").help();
cli.command("[root]", "start dev server").alias("dev").action(async (root) => {
  const createServer = async () => {
    const { createDevServer } = await Promise.resolve().then(() => _interopRequireWildcard(require("./dev.js")));
    const server = await createDevServer(root, async () => {
      await server.close();
      await createServer();
    });
    await server.listen();
    server.printUrls();
  };
  await createServer();
});
cli.command("build [root]", "build for production").action(async (root) => {
  try {
    root = _path.resolve.call(void 0, root);
    const config = await _chunkTU5ZQHWFjs.resolveConfig.call(void 0, root, "build", "production");
    await build(root, config);
  } catch (e) {
    console.log(e);
  }
});
cli.parse();
