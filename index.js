const debug = require('debug')('V')
const WebSocket = require('uws')

class V {
  constructor (id) {
    let self = this

    function initWithId (id) {
      debug('Init %s', id)
      Object.defineProperty(self, '_id', { value: id })
      let handler = {
        get (obj, key) {
          debug('get %s', key)
          if (key in obj) return obj[key]
          return undefined
        },
        set (obj, key, val) {
          debug('set %s', key)
          obj[key] = val
          return true
        },
        deleteProperty (obj, key, val) {
          debug('deleteProperty %s', key)
          delete obj[key]
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
      debug('hola')
    }
    function onMessage (message) {
      try {
        message = JSON.parse(message)
      } catch (e) {}
      if (typeof message === 'string') {
        debug(message)
        switch (message) {
          default:
            debug('Message not handled')
            break
        }
      } else {
        debug('Object %O', message)
        switch (message.type) {
          case 'id':
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

    let socket = new WebSocket('ws://localhost:3000')

    Object.defineProperty(this, '_socket', { value: socket })

    var proxy

    socket.on('message', onMessage)
    socket.on('close', onClose)
    socket.on('open', () => {
      debug('Socket opened')

      if (!id) {
        debug('Requesting ID...')
        socket.send('requestID')
      } else {
        initWithId(id)
      }
    })

    while (proxy === undefined) {
      proxy = proxy || undefined
      require('deasync').sleep(100)
    }

    debug('Returning')

    return proxy
  }

  close () {
    if (this._socket) {
      this._socket.close()
    }
  }
}

module.exports = V
