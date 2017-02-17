const test = require('tape')

const V = require('../index')

test('Sync - Set', t => {
  t.plan(5)

  let v = new V()
  const uuid = v._roomId
  t.pass('Construct worked')

  v.a = 10
  t.equals(v.a, 10, 'Value is saved')

  const v2 = new V(uuid)
  t.pass('Construct with same roomId worked')
  t.equals(v2.a, 10, 'Value is the same after rehidration')

  v.a = 20
  v2.on('set', update => {
    console.log(update)
    t.equals(v2.a, 20, 'Set value propagated correctly')
    v2.close()
    v.destroy()
  })
})
