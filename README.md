<h1 align="center">
  <a href="https://vars.online"><img src="https://vars.online/logo.svg" alt="V Logo" width="180" /></a>
  <br>
</h1>
<h4 align="center">🔒 Secure ❄️ Synchronized ⚡️ Realtime ☁️ Cloud 🌈 Native JavaScript Variables &amp; Events</h4>

<p align="center"><a href="https://npmjs.org/package/v"><img src="https://img.shields.io/npm/v/v.svg" alt="npm" /></a> <a href="https://npmjs.org/package/v"><img src="https://img.shields.io/npm/dm/v.svg" alt="downloads" /></a> <a href="https://greenkeeper.io/"><img src="https://badges.greenkeeper.io/DiegoRBaquero/v.svg?token=a422ad2d4e68470f999284e20bc6a0f1936468ebfcb74c157a65c2a54037e0d2" alt="Greenkeeper badge" /></a> 
<a href="https://travis-ci.org/DiegoRBaquero/V"><img src="https://travis-ci.org/DiegoRBaquero/V.svg?branch=master" alt="Build Status" /></a> <a href="https://codecov.io/gh/DiegoRBaquero/V"><img src="https://codecov.io/gh/DiegoRBaquero/V/branch/master/graph/badge.svg" alt="codecov" /></a> <a href="https://www.bithound.io/github/DiegoRBaquero/V"><img src="https://www.bithound.io/github/DiegoRBaquero/V/badges/score.svg" alt="bitHound Overall Score"></a><br> <a href="https://nodesecurity.io/orgs/diegorbaquero/projects/fe10e154-1166-4afd-8ee8-26a395b2a04c"><img src="https://nodesecurity.io/orgs/diegorbaquero/projects/fe10e154-1166-4afd-8ee8-26a395b2a04c/badge" alt="NSP Status"></a> <a href="https://snyk.io/test/github/diegorbaquero/v"><img src="https://snyk.io/test/github/diegorbaquero/v/badge.svg" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/github/diegorbaquero/v" style="max-width:100%;"></a></p>

<p align="justify"><strong>V</strong> extends your in-memory variables to also be saved/persisted instantly. Variables are instantly synchronized between all running instances of <strong>V</strong> in a room. When you (re)start in a room, variables and constants are reloaded/rehydrated automatically.</p>

### Current Features
- Keep your variables in the cloud
- Sync variables between instances
- Automatic reloaded/rehydrated on start-up

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

#### Custom Opts

The `opts` object has the following options and their default options listed
```js
myOpts = {
  roomId: '',
  server: 'wss://api.online.vars'
}
```

Use it:
```js
const v = new V(myOpts)
```

## Debug logs

**V** comes with extensive debugging logs. Each **V** instance and constructor-call has it own debug namespace.

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
GPL-3.0 Copyright © [Diego Rodríguez Baquero](https://diegorbaquero.com)
