"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }



var _chunkZ3GBJ7WNjs = require('./chunk-Z3GBJ7WN.js');


var _chunkCBUPLIN5js = require('./chunk-CBUPLIN5.js');

// src/node/dev.ts
var _vite = require('vite');

// src/node/plugin-swdoc/indexHtml.ts
var _promises = require('fs/promises');
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
              src: `/@fs/${_chunkZ3GBJ7WNjs.CLIENT_ENTRY_PATH}`
            },
            injectTo: "body"
          }
        ]
      };
    },
    configureServer(server) {
      return () => {
        server.middlewares.use(async (req, res, next) => {
          let html = await _promises.readFile.call(void 0, _chunkZ3GBJ7WNjs.DEFAULT_HTML_PATH, "utf-8");
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

// src/node/dev.ts
var _pluginreact = require('@vitejs/plugin-react'); var _pluginreact2 = _interopRequireDefault(_pluginreact);
async function createDevServer(root = process.cwd(), restartServer) {
  const config = await _chunkCBUPLIN5js.resolveConfig.call(void 0, root, "serve", "development");
  return _vite.createServer.call(void 0, {
    plugins: [
      pluginIndexHtml(),
      _pluginreact2.default.call(void 0, ),
      _chunkZ3GBJ7WNjs.pluginConfig.call(void 0, config, restartServer)
    ]
  });
}


exports.createDevServer = createDevServer;
