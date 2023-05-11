"use strict";Object.defineProperty(exports, "__esModule", {value: true});


var _chunkBS72D4WZjs = require('./chunk-BS72D4WZ.js');


var _chunkTU5ZQHWFjs = require('./chunk-TU5ZQHWF.js');

// src/node/dev.ts
var _vite = require('vite');
async function createDevServer(root = process.cwd(), restartServer) {
  const config = await _chunkTU5ZQHWFjs.resolveConfig.call(void 0, root, "serve", "development");
  return _vite.createServer.call(void 0, {
    root: _chunkBS72D4WZjs.PACKAGE_ROOT,
    plugins: await _chunkBS72D4WZjs.createVitePlugins.call(void 0, config, restartServer),
    server: {
      fs: {
        allow: [_chunkBS72D4WZjs.PACKAGE_ROOT]
      }
    }
  });
}


exports.createDevServer = createDevServer;
