<h1 align="center">
  <img src="https://raw.githubusercontent.com/DiegoRBaquero/v/master/logo.jpeg?token=AB6fNyMWytpgFAj65a1rUERhHF99P-viks5Ys6VMwA%3D%3D" />
  <br>
</h1>
<h4 align="center">🔒 Secure ❄️ Synchronized ⚡️ Realtime ☁️ Cloud 🌈 Native JavaScript Variables &amp; Events</h4>

<p align="center"><a href="https://npmjs.org/package/v"><img src="https://img.shields.io/npm/v/v.svg" alt="npm" /></a> <a href="https://npmjs.org/package/v"><img src="https://img.shields.io/npm/dm/v.svg" alt="downloads" /></a> <a href="https://greenkeeper.io/"><img src="https://badges.greenkeeper.io/DiegoRBaquero/v.svg?token=a422ad2d4e68470f999284e20bc6a0f1936468ebfcb74c157a65c2a54037e0d2" alt="Greenkeeper badge" /></a> 
<a href="https://travis-ci.com/DiegoRBaquero/v"><img src="https://travis-ci.com/DiegoRBaquero/v.svg?token=RmCH18hHqxd9wdtEPyix&amp;branch=master" alt="Build Status" /></a> <a href="https://codecov.io/gh/DiegoRBaquero/v"><img src="https://codecov.io/gh/DiegoRBaquero/v/branch/master/graph/badge.svg?token=uwf6VJzWlr" alt="codecov" /></a></p>

<p align="justify"><strong>V</strong> extends your in-memory variables to also be saved/persisted instantly. Variables are instantly synchronized
between all running instances of <strong>V</strong> in a room. When you (re)start in a room, variables and constants are reloaded/rehidrated automatically.</p>

### Current Features
- Keep your variables in the cloud
- Sync variables between instances
- Automatic reloaded/rehidrated on start-up

#### Requires ES6 Proxy (Node 6+ and new browsers)

### Coming Soon:
- Web GUI
- History - Time machine
- Events pub/sub

## Install

### Node
```sh
npm install --save v
or
npm i -S v
```

### Browser
Unpkg CDN:
```html
<script src="https://unpkg.com/v/v.min.js"></script>
```

More CDNs coming soon

## API

### Constructor (3 Ways to do it)

If no roomId is passed, a new one will be assigned automatically and printed in the console.

##### NodeJS only with deasync support
```js
const V = require('v')
const v = new V([roomId])
```

##### Callback
```js
const V = require('v')
V([roomId,] v => {

})
```

##### Promise
```js
const V = require('v')
V([roomId]).then(v => {

}).catch(e => {

})
```

### Enable debug logs

V comes with extensive debugging logs. Each v instance and constructor call has it own debug namespace.

In **node**, enable debug logs by setting the `DEBUG` environment variable to `*`

```bash
DEBUG=* node myProgram.js
```

In the **browser**, enable debug logs by running this in the developer console:

```js
localStorage.debug = '*'
```

Disable by running this:

```js
localStorage.removeItem('debug')
```

[![Standard - JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

## License [![npm](https://img.shields.io/npm/l/v.svg)](LICENSE)
MIT. Copyright © [Diego Rodríguez Baquero](https://diegorbaquero.com)
