# v [![npm](https://img.shields.io/npm/v/v.svg)](https://npmjs.org/package/v) [![downloads](https://img.shields.io/npm/dm/v.svg)](https://npmjs.org/package/v) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![npm](https://img.shields.io/npm/l/v.svg)](LICENSE)
#### 🔒 Secure ❄️ Synchronized ⚡️ Realtime ☁️ Cloud 🌈 Native JavaScript Variables & Events

[![Greenkeeper badge](https://badges.greenkeeper.io/DiegoRBaquero/v.svg?token=a422ad2d4e68470f999284e20bc6a0f1936468ebfcb74c157a65c2a54037e0d2)](https://greenkeeper.io/) 
[![Build Status](https://travis-ci.com/DiegoRBaquero/v.svg?token=RmCH18hHqxd9wdtEPyix&branch=master)](https://travis-ci.com/DiegoRBaquero/v) [![codecov](https://codecov.io/gh/DiegoRBaquero/v/branch/master/graph/badge.svg?token=uwf6VJzWlr)](https://codecov.io/gh/DiegoRBaquero/v)

V extends your in-memory variables to also be saved/persisted instantly. Variables are instantly synchronized
between all running instances of V in a room. When you (re)start in a room, variables and constants are reloaded/rehidrated automatically.

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

## License
MIT. Copyright © [Diego Rodríguez Baquero](https://diegorbaquero.com)
