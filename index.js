const debug = require('debug')('V')
const WebSocket = require('ws')

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
          if (!self._closed) self._socket.send(JSON.stringify({ type: 'set', key: key, data: val }))
          return true
        } catch (e) {
          debug('Failed to set readonly property')
          return false
        }
      },
      deleteProperty (obj, key) {
        debug('deleteProperty %s', key)
        delete obj[key]
        if (!self._closed) self._socket.send(JSON.stringify({ type: 'delete', key: key }))
        return true
      }
    }

    function initWithId (id) {
      debug('Init with id: %s', id)
      Object.defineProperty(self, '_uuid', { value: id })
      init()
    }
    function init () {
      debug('Init')
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
          case 'set':
            const setKey = message.key
            debug('sync set %s', setKey)
            try {
              self[setKey] = message.data
            } catch (e) {
              debug('Failed to sync set')
            }
            break
          case 'delete':
            const deleteKey = message.key
            debug('sync delete %s', deleteKey)
            delete self[deleteKey]
            break
          case 'destroy':
            self.close()
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
    socket.on('error', onError)
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
      this._closed = true
    }
  }

  destroy () {
    this._socket.send(stringify({ type: 'destroy' }))
    this.close()
    this._destroyed = true
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
