const debug = require('debug')('test')

const V = require('../')

let v = new V()

debug(Object.getOwnPropertyNames(v))
debug(Object.keys(v))

v.close()
