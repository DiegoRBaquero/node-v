const test = require('tape')

const V = require('../index')

test('Variables - Write', t => {
  t.plan(3)
  const v = new V()
  t.pass('Construct with no ID worked')
  v.a = 10
  t.equals(v.a, 10, 'a equals 10')
  v.a = 20
  t.equals(v.a, 20, 'a equals 20')
  v.destroy()
})

test('Variables - Persisted', t => {
  t.plan(5)

  let v = new V()
  const uuid = v._uuid
  t.pass('Construct worked')

  v.a = 10
  t.equals(v.a, 10, 'Value is saved')
  v.close()

  v = new V(uuid)
  t.pass('Construct with same ID worked')
  t.equals(v.a, 10, 'Value remains the same')
  v.a = 20
  t.equals(v.a, 20, 'Value remains writeable')
  v.destroy()
})
