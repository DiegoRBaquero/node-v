const test = require('tape')

const V = require('../index')

test('Constants - Read only', t => {
  t.plan(3)
  const v = new V()
  t.pass('Construct with no ID worked')
  v.const('c', 10)
  t.equals(v.c, 10, 'c equals 10')
  v.c = 20
  t.equals(v.c, 10, 'c equals 10')
  v.destroy()
})

test('Constants - Persisted', t => {
  t.plan(5)

  let v = new V()
  const uuid = v._uuid
  t.pass('Construct worked')

  v.const('c', 10)
  t.equals(v.c, 10, 'Value is saved')
  v.close()

  v = new V(uuid)
  t.pass('Construct with same ID worked')
  t.equals(v.c, 10, 'Value remains the same')
  v.c = 20
  t.equals(v.c, 10, 'Value remains read only')
  v.destroy()
})
