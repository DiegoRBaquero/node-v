const test = require('tape')

const V = require('../index')
const common = require('./common')

const TIMEOUT = common.TIMEOUT

test('Sync - Delete', t => {
  t.plan(5)

  let v = new V()
  const uuid = v._uuid
  t.pass('Construct worked')

  v.a = 10
  t.equals(v.a, 10, 'Value is saved')

  const v2 = new V(uuid)
  t.pass('Construct with same ID worked')
  t.equals(v2.a, 10, 'Value is the same after rehidration')

  delete v.a
  setTimeout(() => {
    t.equals(v2.a, undefined, 'Delete value propagated correctly')
    v2.close()
    v.destroy()
  }, TIMEOUT)
})
