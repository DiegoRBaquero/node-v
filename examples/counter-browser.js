const V = require('../index')

V('counter-example', v => {
  console.log('The value on the cloud was', v.counter)
  v.counter++
  console.log('New value is', v.counter)
})
