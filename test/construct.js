const test = require('tape')
// const debug = require('debug')('test')

const V = require('../lib/v')

test('New V - Empty ID', t => {
  t.plan(1)
  let v = new V()
  t.pass('Construct worked')
  v.close() // TODO: Change to destroy
})

test('New V - Const', t => {
  t.plan(2)
  let v = new V('const-test')
  t.pass('Construct worked')
  t.equals(v.c, 10)
  v.c = 20
  t.equals(v.c, 10)
  v.close() // TODO: Change to destroy
})
