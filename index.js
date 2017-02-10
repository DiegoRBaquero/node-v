const debug = require('debug')('V')

let WebSocket
try {
  WebSocket = require('uws')
} catch (e) {
  debug('Could not use uws, trying ws')
  WebSocket = require('ws')
}

class V {
  constructor (uuid) {
    debug('constructor')
    const self = this
    let proxy, deasync

    try {
      deasync = require('deasync')
    } catch (e) {
      throw new Error('Can\'t load deasync module. Please use V.init with promise or cb')
    }

    function initWithId (id) {
      debug('Init with id: %s', id)
      Object.defineProperty(self, '_uuid', { value: id })
      init()
    }
    function init () {
      debug('Init')
      const handler = {
        get (obj, key) {
          if (!key.startsWith('_')) debug('get %s', key)
          if (key in obj) return obj[key]
          return undefined
        },
        set (obj, key, val) {
          debug('set %s', key)
          obj[key] = val
          self._socket.send(JSON.stringify({ type: 'set', key: key, data: val }))
          return true
        },
        deleteProperty (obj, key) {
          debug('deleteProperty %s', key)
          delete obj[key]
          self._socket.send(JSON.stringify({ type: 'delete', key: key }))
          return true
        },
        enumerate (obj) {
          debug('enumerate')
          return Object.keys(obj).filter(val => val[0] === '_')
        },
        keys () {
          debug('keys')
        }
      }
      proxy = new Proxy(self, handler)
    }
    function onMessage (message) {
      try {
        message = JSON.parse(message)
      } catch (e) {}
      if (typeof message === 'string') {
        debug('Message: %s', message)
        switch (message) {
          case 'start':
            init()
            break
          default:
            debug('Message not handled')
            break
        }
      } else {
        debug('Message: %o', message)
        switch (message.type) {
          case 'start':
            const data = message.data
            const vars = data.vars
            debug('vars: %O', vars)
            for (const key in vars) {
              const varOrConst = vars[key]
              debug(typeof varOrConst)
              if (varOrConst && typeof varOrConst === 'object' && varOrConst.isConst) {
                debug('Rehidrating const')
                Object.defineProperties(self, key, { value: vars[key].val, enumerable: true })
              } else {
                debug('Rehidrating var')
                self[key] = vars[key]
              }
            }
            init()
            break
          case 'id':
            console.log(`Use ${message.data} as your UUID`)
            initWithId(message.data)
            break
          default:
            debug('Message type not handled')
            break
        }
      }
    }
    function onClose (reason) {
      debug('Socket closed %s', reason)
    }

    const socket = new WebSocket('wss://api.vars.online')

    Object.defineProperty(this, '_socket', { value: socket })

    socket.on('message', onMessage)
    socket.on('close', onClose)
    socket.on('open', () => {
      debug('Socket opened')

      if (!uuid) {
        debug('Requesting UUID...')
        socket.send('requestId')
      } else {
        Object.defineProperty(self, '_uuid', { value: uuid })
        socket.send(stringify({ type: 'startWithId', data: uuid }))
      }
    })

    deasync.loopWhile(() => proxy === undefined)

    debug('Returning')

    return proxy
  }

  close () {
    if (this._socket) {
      this._socket.close()
    }
  }

  destroy () {
    this._socket.send('destroy')
    this.close()
  }
}

function stringify (data) {
  return JSON.stringify(data)
}

module.exports = V
