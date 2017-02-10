# V
Synchronized, realtime, cloud hosted, native JavaScript variables and constants

[![Build Status](https://travis-ci.com/DiegoRBaquero/V.svg?token=RmCH18hHqxd9wdtEPyix&branch=master)](https://travis-ci.com/DiegoRBaquero/V)

V keeps your variables online and in sync!

### Current Features
- Keeps your variables on the cloud
- Automatic variables rehidration

### TODO:
- Sync instances
- Web GUI
- History - Time machine
- Events pub/sub

## Examples:

First: Get a new ID (Web GUI soon), this will print your ID on the console
```js
const V = require('v')
const v = new v()
```

Then use it:
```js
const V = require('v')
const v = new v('the-id-from-the-console')

v.myVar = 5
v.const('constant', 10)
v.close
```

© Diego Rodríguez Baquero 2016 - 2017