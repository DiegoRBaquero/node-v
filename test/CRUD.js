const test = require('tape')

const V = require('../index')

test('CRUD - String & Number', t => {
  t.plan(32)

  let v = new V() // Init with new roomId
  t.pass('Construct with no roomId worked')
  let uuid = v._roomId

  t.equal(v.keys().length, 0, 'Empty keys')
  v.close()

  v = new V(uuid)
  t.pass('Construct with same roomId worked')

  t.equal(v._roomId, uuid, 'roomId is the same')

  v.a = 'a'
  t.equal(v.keys().length, 1, 'Keys length of 1')
  t.deepLooseEqual(v.keys(), [ 'a' ], '`a` key exists')
  t.equal(v.a, 'a', '`a` key contains an \'a\'')

  v.b = 1
  t.equal(v.keys().length, 2, 'Keys length of 2')
  t.deepLooseEqual(v.keys(), [ 'a', 'b' ], '`a` and `b` keys exist')
  t.equal(v.a, 'a', '`a` key contains \'a\'')
  t.equal(v.b, 1, '`b` key contains 1')

  v.a = 'new a'
  t.equal(v.keys().length, 2, 'Keys length of 2')
  t.deepLooseEqual(v.keys(), [ 'a', 'b' ], '`a` and `b` keys exist')
  t.equal(v.a, 'new a', '`a` key contains \'new a\'')
  t.equal(v.b, 1, '`b` key contains \'b\'')

  const updateReadB = ++v.b
  t.equal(v.keys().length, 2, 'Keys length of 2')
  t.deepLooseEqual(v.keys(), [ 'a', 'b' ], '`a` and `b` keys exist')
  t.equal(v.a, 'new a', '`a` key contains \'new a\'')
  t.equal(v.b, 2, '`b` key contains 2')
  t.equal(updateReadB, 2, 'temp key contains 2')

  const readUpdateB = v.b++
  t.equal(v.keys().length, 2, 'Keys length of 2')
  t.deepLooseEqual(v.keys(), [ 'a', 'b' ], '`a` and `b` keys exist')
  t.equal(v.a, 'new a', '`a` key contains \'new a\'')
  t.equal(v.b, 3, '`b` key contains 1')
  t.equal(readUpdateB, 2, 'temp key contains 1')

  delete v.a
  t.equal(v.keys().length, 1, 'Keys length of 1')
  t.deepLooseEqual(v.keys(), [ 'b' ], '`b` keys exists')
  t.equal(v.a, undefined, '`a` key is undefined')
  t.equal(v.b, 3, '`b` key contains \'new b\'')

  delete v.b
  t.equal(v.keys().length, 0, 'Keys length of 0')
  t.equal(v.a, undefined, '`a` key is undefined')
  t.equal(v.b, undefined, '`b` key is undefined')
  v.destroy()
})

