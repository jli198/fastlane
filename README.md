# fastlane

## Installation

* Make sure to install npm.
* Run ```npm start```.

```sh
$ npm start

> hst325-test-project@1.0.0 start
> webpack-dev-server --config webpack/base.js --open

CLI for webpack must be installed.
  webpack-cli (https://github.com/webpack/webpack-cli)

We will use "npm" to install the CLI via "npm install -D webpack-cli".
Do you want to install 'webpack-cli' (yes/no): yes
Installing 'webpack-cli' (running 'npm install -D webpack-cli')...

added 519 packages, and audited 520 packages in 26s

53 packages are looking for funding
  run `npm fund` for details       

found 0 vulnerabilities
Error: Cannot find module 'webpack-cli/package.json'
Require stack:
- C:\Users\user\AppData\Roaming\npm\node_modules\webpack-dev-server\bin\webpack-dev-server.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:995:15)
    at Function.resolve (node:internal/modules/cjs/helpers:109:19)
    at runCli (C:\Users\user\AppData\Roaming\npm\node_modules\webpack-dev-server\bin\webpack-dev-server.js:73:27)
    at C:\Users\user\AppData\Roaming\npm\node_modules\webpack-dev-server\bin\webpack-dev-server.js:168:9
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [
    'C:\\Users\\user\\AppData\\Roaming\\npm\\node_modules\\webpack-dev-server\\bin\\webpack-dev-server.js'       
  ]
}
```

This Error is find. Run ```npm start``` again to run the module.

```sh
$ npm start

> hst325-test-project@1.0.0 start
> webpack-dev-server --config webpack/base.js --open

C:\Users\user\source\repos\fastlane\public\images.json written
<i> [webpack-dev-server] Project is running at:
<i> [webpack-dev-server] Loopback: http://localhost:8081/
<i> [webpack-dev-server] On Your Network (IPv4): http://10.156.89.180:8081/
<i> [webpack-dev-server] Content not from webpack is served from 'C:\Users\user\source\repos\fastlane\public' directory
<i> [webpack-dev-middleware] wait until bundle finished: /
asset main.js 19 MiB [emitted] (name: main)
asset index.html 471 bytes [emitted]
runtime modules 27.3 KiB 12 modules
cacheable modules 6.8 MiB
  modules by path ./src/ 126 KiB
    modules by path ./src/scenes/data/ 67.8 KiB 19 modules
    modules by path ./src/scenes/*.js 31.7 KiB 3 modules
    modules by path ./src/scenes/lib/*.js 26.2 KiB 3 modules
    ./src/index.js 877 bytes [built] [code generated]
  modules by path ./node_modules/ 6.68 MiB
    modules by path ./node_modules/webpack-dev-server/client/ 55.8 KiB 12 modules
    modules by path ./node_modules/webpack/hot/*.js 4.59 KiB 4 modules
    modules by path ./node_modules/html-entities/lib/*.js 81.3 KiB 4 modules
    + 3 modules
+ 16 modules
webpack 5.75.0 compiled successfully in 6168 ms
```
