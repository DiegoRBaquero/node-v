const test = require('tape')

const V = require('../index')

test('Constants - Read only', t => {
  t.plan(3)
  const v = new V()
  t.pass('Construct with no roomId worked')
  v.const('c', 10)
  t.equals(v.c, 10, 'Value is saved')
  v.c = 20
  t.equals(v.c, 10, 'Value is unchanged after set')
  v.destroy()
})

test('Constants - Persisted', t => {
  t.plan(5)

  let v = new V()
  const uuid = v._roomId
  t.pass('Construct worked')

  v.const('c', 10)
  t.equals(v.c, 10, 'Value is saved')

  v = new V(uuid)
  t.pass('Construct with same roomId worked')
  t.equals(v.c, 10, 'Value is the same after rehidration')
  v.c = 20
  t.equals(v.c, 10, 'Value remains read only')
  v.destroy()
})
