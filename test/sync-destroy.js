const test = require('tape')

const V = require('../index')
const common = require('./common')

const TIMEOUT = common.TIMEOUT

test('Sync - Destroy', t => {
  t.plan(5)

  let v = new V()
  const uuid = v._uuid
  t.pass('Construct worked')

  v.a = 10
  t.equals(v.a, 10, 'Value is saved')

  const v2 = new V(uuid)
  t.pass('Construct with same ID worked')
  t.equals(v2.a, 10, 'Value is the same after rehidration')

  v.destroy()
  setTimeout(() => {
    t.true(v2._closed, 'Destroy instanceCounter propagated correctly')
  }, TIMEOUT)
})
