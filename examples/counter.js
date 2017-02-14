const V = require('../index')
const v = new V('counter-example')

console.log('The value on the cloud was', v.counter)
v.counter++
console.log('New value is', v.counter)
v.close()
