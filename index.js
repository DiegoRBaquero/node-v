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
          try {
            obj[key] = val
            self._socket.send(JSON.stringify({ type: 'set', key: key, data: val }))
            return true
          } catch (e) {
            debug('Failed to set')
            return false
          }
        },
        deleteProperty (obj, key) {
          debug('deleteProperty %s', key)
          delete obj[key]
          self._socket.send(JSON.stringify({ type: 'delete', key: key }))
          return true
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
            onError('Message not hanlded')
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
                debug('Rehidrating constant')
                Object.defineProperty(self, key, { value: vars[key].val, enumerable: true })
              } else {
                debug('Rehidrating variable')
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
            onError('Message type not handled')
        }
      }
    }
    function onClose (reason) {
      debug('Socket closed %s', reason)
    }
    function onError (err = 'Error') {
      self.close()
      throw new Error(err)
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

  const (key, val) {
    Object.defineProperty(this, key, { value: val, enumerable: true })
    this._socket.send(JSON.stringify({ type: 'set', key: key, data: { val: val, isConst: true } }))
  }
}

function stringify (data) {
  return JSON.stringify(data)
}

module.exports = V
