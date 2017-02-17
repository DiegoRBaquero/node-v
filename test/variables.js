const test = require('tape')

const V = require('../index')

test('Variables - Write', t => {
  t.plan(3)
  const v = new V()
  t.pass('Construct with no roomId worked')
  v.a = 10
  t.equals(v.a, 10, 'Value is saved')
  v.a = 20
  t.equals(v.a, 20, 'Value is changed on set')
  v.destroy()
})

test('Variables - Persisted', t => {
  t.plan(5)

  let v = new V()
  const uuid = v._roomId
  t.pass('Construct worked')

  v.a = 10
  t.equals(v.a, 10, 'Value is saved')
  v.close()

  v = new V(uuid)
  t.pass('Construct with same roomId worked')
  t.equals(v.a, 10, 'Value is the same after rehidration')
  v.a = 20
  t.equals(v.a, 20, 'Value remains writeable')
  v.destroy()
})
