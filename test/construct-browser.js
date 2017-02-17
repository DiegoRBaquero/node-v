const test = require('tape')

const V = require('../index')

test('New V callback - No roomId', t => {
  t.plan(1)
  V(v => {
    t.pass('Construct with no roomId worked')
    v.destroy()
  })
})

test('New V callback - Non existent roomId', t => {
  t.plan(1)
  try {
    V('this-will-fail', v => {
      v.close()
      t.fail('Construct with a non existent roomId worked')
    })
  } catch (e) {
    t.ok(e, 'Failed to construct with non existent roomId')
  }
})

test('New V promise - No roomId', t => {
  t.plan(1)
  V('', 'promise').then(v => {
    t.pass('Construct with no roomId worked')
    v.destroy()
  }).catch(e => {
    t.fail(e.message)
  })
})

test('New V promise - Non existent roomId', t => {
  t.plan(1)
  V('this-will-fail', 'promise').then(v => {
    v.close()
    t.fail('Construct with a non existent roomId worked')
  }).catch(e => {
    t.ok(e, 'Failed to construct with non existent roomId')
  })
})
