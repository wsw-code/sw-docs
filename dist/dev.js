"use strict";Object.defineProperty(exports, "__esModule", {value: true});


var _chunkGHO5GKOAjs = require('./chunk-GHO5GKOA.js');


var _chunkTU5ZQHWFjs = require('./chunk-TU5ZQHWF.js');

// src/node/dev.ts
var _vite = require('vite');
async function createDevServer(root = process.cwd(), restartServer) {
  const config = await _chunkTU5ZQHWFjs.resolveConfig.call(void 0, root, "serve", "development");
  return _vite.createServer.call(void 0, {
    root: _chunkGHO5GKOAjs.PACKAGE_ROOT,
    // plugins: [
    //   pluginIndexHtml(),
    //   pluginReact(),
    //   pluginConfig(config, restartServer),
    //   pluginRoutes({
    //     root: config.root
    //   })
    // ],
    plugins: _chunkGHO5GKOAjs.createVitePlugins.call(void 0, config, restartServer),
    server: {
      fs: {
        allow: [_chunkGHO5GKOAjs.PACKAGE_ROOT]
      }
    }
  });
}


exports.createDevServer = createDevServer;
