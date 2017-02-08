const V = require('../lib/v')
const v = new V('counter-example')

console.log(v.counter)
v.counter++
console.log(v.counter)
v.close()
