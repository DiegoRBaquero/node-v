const test = require('tape')

const V = require('../index')

test('Variables - Number RW', t => {
  t.plan(3)
  const v = new V()
  t.pass('Construct with no roomId worked')
  v.a = 10
  t.equals(v.a, 10, 'Value is saved')
  v.a = 20
  t.equals(v.a, 20, 'Value is changed on set')
  v.destroy()
})

test('Variables - Number Persisted', t => {
  t.plan(5)

  let v = new V()
  const roomId = v._roomId
  t.pass('Construct worked')

  v.a = 10
  t.equals(v.a, 10, 'Value is saved')
  v.close()

  v = new V(roomId)
  t.pass('Construct with same roomId worked')
  t.equals(v.a, 10, 'Value is the same after rehidration')
  v.a = 20
  t.equals(v.a, 20, 'Value remains writeable')
  v.destroy()
})

test('Variables - String RW', t => {
  t.plan(3)
  const v = new V()
  t.pass('Construct with no roomId worked')
  v.a = 'string'
  t.equals(v.a, 'string', 'Value is saved')
  v.a = 'string2'
  t.equals(v.a, 'string2', 'Value is changed on set')
  v.destroy()
})

test('Variables - String Persisted', t => {
  t.plan(5)

  let v = new V()
  const roomId = v._roomId
  t.pass('Construct worked')

  v.a = 'string'
  t.equals(v.a, 'string', 'Value is saved')
  v.close()

  v = new V(roomId)
  t.pass('Construct with same roomId worked')
  t.equals(v.a, 'string', 'Value is the same after rehidration')
  v.a = 'string2'
  t.equals(v.a, 'string2', 'Value remains writeable')
  v.destroy()
})

test('Variables - Object RW', t => {
  t.plan(3)
  const v = new V()
  t.pass('Construct with no roomId worked')
  v.a = { b: 1, c: 'woot' }
  t.deepEquals(v.a, { b: 1, c: 'woot' }, 'Value is saved')
  v.a = { b: 5, c: 'woot2' }
  t.deepEquals(v.a, { b: 5, c: 'woot2' }, 'Value is changed on set')
  v.destroy()
})

test('Variables - Object Persisted', t => {
  t.plan(5)

  let v = new V()
  const roomId = v._roomId
  t.pass('Construct worked')

  v.a = { b: 1, c: 'woot' }
  t.deepEquals(v.a, { b: 1, c: 'woot' }, 'Value is saved')
  v.close()

  v = new V(roomId)
  t.pass('Construct with same roomId worked')
  t.deepEquals(v.a, { b: 1, c: 'woot' }, 'Value is the same after rehidration')
  v.a = { b: 5, c: 'woot2' }
  t.deepEquals(v.a, { b: 5, c: 'woot2' }, 'Value remains writeable')
  v.destroy()
})

test('Variables - Nested Object RW', t => {
  t.plan(3)
  const v = new V()
  t.pass('Construct with no roomId worked')
  v.a = {}
  v.a.b = 1
  t.deepEquals(v.a, { b: 1 }, 'Value is saved')
  v.a.b = 2
  t.deepEquals(v.a, { b: 2 }, 'Value is changed on set')
  v.destroy()
})
//
// test('Variables - Nested Object Persisted', t => {
//   t.plan(5)
//
//   let v = new V()
//   const roomId = v._roomId
//   t.pass('Construct worked')
//
//   v.a = { b: 1, c: 'woot' }
//   t.deepEquals(v.a, { b: 1, c: 'woot' }, 'Value is saved')
//   v.close()
//
//   v = new V(roomId)
//   t.pass('Construct with same roomId worked')
//   t.deepEquals(v.a, { b: 1, c: 'woot' }, 'Value is the same after rehidration')
//   v.a = { b: 5, c: 'woot2' }
//   t.deepEquals(v.a, { b: 5, c: 'woot2' }, 'Value remains writeable')
//   v.destroy()
// })
