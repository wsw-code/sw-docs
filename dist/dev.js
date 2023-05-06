"use strict";Object.defineProperty(exports, "__esModule", {value: true});


var _chunkVPFYX7X7js = require('./chunk-VPFYX7X7.js');


var _chunkTU5ZQHWFjs = require('./chunk-TU5ZQHWF.js');

// src/node/dev.ts
var _vite = require('vite');
async function createDevServer(root = process.cwd(), restartServer) {
  const config = await _chunkTU5ZQHWFjs.resolveConfig.call(void 0, root, "serve", "development");
  return _vite.createServer.call(void 0, {
    root: _chunkVPFYX7X7js.PACKAGE_ROOT,
    plugins: await _chunkVPFYX7X7js.createVitePlugins.call(void 0, config, restartServer),
    server: {
      fs: {
        allow: [_chunkVPFYX7X7js.PACKAGE_ROOT]
      }
    }
  });
}


exports.createDevServer = createDevServer;
