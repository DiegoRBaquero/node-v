const test = require('tape')
const debug = require('debug')('test')

const V = require('../index')

test('New V', t => {
  t.plan(1)

  let v = new V() // Init with new ID
  let uuid = v._uuid

  t.equal(Object.keys(v).length, 0, 'Empty keys')
  test('Reload Empty', t => {
    t.plan(1)
    v.close()
    v = new V(uuid)

    t.equal(v._uuid, uuid, 'ID is the same')

    test('Create & Read string', t => {
      t.plan(3)

      v.a = 'a'
      t.equal(Object.keys(v).length, 1, 'Keys length of 1')
      t.deepLooseEqual(Object.keys(v), ['a'], '`a` key exists')
      t.equal(v.a, 'a', '`a` key contains an \'a\'')

      test('Create & Read number', t => {
        t.plan(4)

        v.b = 1
        t.equal(Object.keys(v).length, 2, 'Keys length of 2')
        t.deepLooseEqual(Object.keys(v), ['a', 'b'], '`a` and `b` keys exist')
        t.equal(v.a, 'a', '`a` key contains \'a\'')
        t.equal(v.b, 1, '`b` key contains 1')

        test('Update & Read string', t => {
          t.plan(4)

          v.a = 'new a'
          t.equal(Object.keys(v).length, 2, 'Keys length of 2')
          t.deepLooseEqual(Object.keys(v), ['a', 'b'], '`a` and `b` keys exist')
          t.equal(v.a, 'new a', '`a` key contains \'new a\'')
          t.equal(v.b, 1, '`b` key contains \'b\'')

          test('Update & Read number', t => {
            t.plan(5)

            let temp = ++v.b
            t.equal(Object.keys(v).length, 2, 'Keys length of 2')
            t.deepLooseEqual(Object.keys(v), ['a', 'b'], '`a` and `b` keys exist')
            t.equal(v.a, 'new a', '`a` key contains \'new a\'')
            t.equal(v.b, 2, '`b` key contains 2')
            t.equal(temp, 2, 'temp key contains 2')

            test('Read & Update number', t => {
              t.plan(5)

              let temp = v.b++
              t.equal(Object.keys(v).length, 2, 'Keys length of 2')
              t.deepLooseEqual(Object.keys(v), ['a', 'b'], '`a` and `b` keys exist')
              t.equal(v.a, 'new a', '`a` key contains \'new a\'')
              t.equal(v.b, 3, '`b` key contains 1')
              t.equal(temp, 2, 'temp key contains 1')

              test('Delete string', t => {
                t.plan(4)

                delete v.a
                t.equal(Object.keys(v).length, 1, 'Keys length of 1')
                t.deepLooseEqual(Object.keys(v), ['b'], '`b` keys exists')
                t.equal(v.a, undefined, '`a` key is undefined')
                t.equal(v.b, 3, '`b` key contains \'new b\'')

                test('Delete number', t => {
                  t.plan(3)

                  delete v.b
                  t.equal(Object.keys(v).length, 0, 'Keys length of 0')
                  t.equal(v.a, undefined, '`a` key is undefined')
                  t.equal(v.b, undefined, '`b` key is undefined')
                  debug('destroying')
                  v.destroy()
                })
              })
            })
          })
        })
      })
    })
  })
})
