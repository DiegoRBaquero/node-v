const test = require('tape')

const V = require('../index')

test('New V - custom server', t => {
  t.plan(1)
  const v = new V({server: 'ws://server.diegorbaquero.com:7295'})
  t.pass('Construct with custom server worked')
  v.destroy()
})

test('New V - custom failing server', t => {
  t.plan(1)
  try {
    const v = new V({server: 'woot-is-this'})
    v.destroy() // this shouldn't be executed
    t.fail('Construct worked when it shouldn\'t')
  } catch (e) {
    t.pass('Construct with failing server didn\'t work')
  }
})
