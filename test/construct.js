const test = require('tape')
// const debug = require('debug')('test')

const V = require('../')

test('New V - Empty ID', t => {
  t.plan(1)
  const v = new V()
  t.pass('Construct worked')
  v.close() // TODO: Change to destroy, we don't want to keep it in the cloud
})

test('New V - Const', t => {
  t.plan(2)
  const v = new V('const-test')
  t.pass('Construct worked')
  t.equals(v.c, 10)
  v.c = 20
  t.equals(v.c, 10)
  v.close() // TODO: Change to destroy, we don't want to keep it in the cloud
})
