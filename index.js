const EventEmitter = require('events').EventEmitter
const _debug = require('debug')
const _WebSocket = require('simple-websocket')
let deasync
try {
  deasync = require('deasync')
} catch (e) {
  _debug('V')('Couldn\'t load deasync')
}

let instanceCounter = 1
let consCounter = 1

class V extends EventEmitter {
  constructor (uuid, cb) {
    super()

    const self = this

    // Hide EventEmitter properties from enumeration
    Object.defineProperty(self, '_events', { value: self._events, enumerable: false })
    Object.defineProperty(self, '_maxListeners', { value: self._events, enumerable: false })

    // Define numerated contructor debug object
    Object.defineProperty(self, 'debug', {
      value: _debug('V:constructor-' + consCounter++),
      writable: true
    })

    self.debug('constructor %s', uuid)

    // if (!deasync && cb === undefined) throw new Error('Can\'t load deasync module. Please use v with a cb: `V(uuid, v => { ...your code })` ')

    // Proxy handler with object tree
    const handler = (tree = []) => {
      // self.debug('new handler %o', tree)
      return {
        get (obj, key) {
          const treeKey = tree.concat([key]).join('.')
          self.debug('get %s', treeKey)
          if (key in obj) {
            if (!key.startsWith('_') && typeof obj[key] === 'object') {
              const newTree = tree.slice()
              newTree.push(key)
              return new Proxy(obj[key], handler(newTree))
            }
            return obj[key]
          }
          return undefined
        },
        set (obj, key, val) {
          const treeKey = tree.concat([key]).join('.')
          self.debug('set %s=%o', treeKey, val)
          try {
            obj[key] = val
            if (!self._closed && !key.startsWith('_')) {
              self._socket.send(JSON.stringify({
                type: 'set',
                key: treeKey,
                data: val
              }))
            }
            return true
          } catch (e) {
            self.debug('Failed to set readonly property')
            return false
          }
        },
        deleteProperty (obj, key) {
          const treeKey = tree.concat([key]).join('.')
          self.debug('deleteProperty %s', treeKey)
          delete obj[key]
          if (!self._closed) self._socket.send(JSON.stringify({ type: 'delete', key: treeKey }))
          return true
        }
      }
    }

    let proxy

    function initWithId (id) {
      self.debug('Init with id: %s', id)
      Object.defineProperty(self, '_uuid', { value: id })
      init()
    }
    function init () {
      Object.defineProperty(self, 'debug', {
        value: _debug('v' + instanceCounter++ + ':' + self._uuid)
      })
      self.debug('Init')
      proxy = new Proxy(self, handler())
      if (cb) cb(proxy)
    }
    function onMessage (message) {
      try {
        message = JSON.parse(message)
      } catch (e) {}
      if (typeof message === 'string') {
        self.debug('SMessage: %s', message)
        switch (message) {
          case 'start':
            init()
            break
          case 'NON_EXISTEN_ID':
            onError('Please create a new V')
            break
          default:
            onError('Message not hanlded')
        }
      } else {
        self.debug('OMessage: %o', message)
        switch (message.type) {
          case 'start':
            const data = message.data
            const vars = data.vars
            self.debug('vars: %O', vars)
            for (const key in vars) {
              const varOrConst = vars[key]
              // self.debug(typeof varOrConst)
              if (varOrConst && typeof varOrConst === 'object' && varOrConst.isConst) {
                // self.debug('Rehidrating constant')
                Object.defineProperty(self, key, { value: vars[key].val, enumerable: true })
              } else {
                // self.debug('Rehidrating variable')
                self[key] = vars[key]
              }
            }
            init()
            break
          case 'id':
            self.debug('Use %s as your UUID', message.data)
            console.log(`Use ${message.data} as your UUID`)
            initWithId(message.data)
            break
          case 'set':
            const setKey = message.key
            self.debug('sync set %s', setKey)
            try {
              self[setKey] = message.data
              self.emit('set', { key: message.key, value: message.data })
            } catch (e) {
              self.debug('Failed to sync set')
            }
            break
          case 'delete':
            const deleteKey = message.key
            self.debug('sync delete %s', deleteKey)
            delete self[deleteKey]
            self.emit('delete', message.key)
            break
          case 'destroy':
            self.close()
            self.emit('destroy')
            break
          default:
            onError('Message type not handled')
        }
      }
    }
    function onClose (reason) {
      self.debug('Socket closed %s', reason)
    }
    function onError (err = 'Error') {
      self.debug('Socket error %s', err)
      self.close()
      throw err
    }

    const socket = new _WebSocket('wss://api.vars.online')

    Object.defineProperty(this, '_socket', { value: socket })

    socket.on('data', onMessage)
    socket.on('close', onClose)
    socket.on('error', onError)
    socket.on('connect', () => {
      self.debug('Socket opened')

      if (!uuid) {
        self.debug('Requesting UUID...')
        self._requestedUUID = true
        socket.send('requestId')
      } else {
        Object.defineProperty(self, '_uuid', { value: uuid })
        socket.send(stringify({ type: 'startWithId', data: uuid }))
      }
    })

    if (deasync && deasync.loopWhile) {
      self.debug('%d %o', instanceCounter, deasync)
      deasync.loopWhile(() => proxy === undefined)
      return proxy
    }
  }

  close () {
    this.debug('close')
    if (this._requestedUUID) {
      this.debug('Remember to set your UUID to %s', this._uuid)
      console.log(`Remember to set your UUID to ${this._uuid}`)
    }
    if (this._socket) {
      this._socket.destroy()
      this._closed = true
    }
  }

  destroy () {
    this.debug('destroy')
    this._socket.send(stringify({ type: 'destroy' }))
    this.close()
  }

  const (key, val) {
    _debug('V:const')('%s %o', key, val)
    Object.defineProperty(this, key, { value: val, enumerable: true })
    this._socket.send(JSON.stringify({ type: 'set', key: key, data: { val: val, isConst: true } }))
  }

  keys () {
    return Object.keys(this).filter(key => !key.startsWith('_') && key !== 'domain')
  }
}

function stringify (data) {
  return JSON.stringify(data)
}

module.exports = function _V (uuid = '', cb) {
  if (!deasync || !deasync.loopWhile) {
    // If only callback is passed, fix params
    if (typeof uuid === 'function') {
      cb = uuid
      uuid = ''
    }
    if (cb) return new V(uuid, cb)
    return new Promise((resolve, reject) => {
      return new V(uuid, resolve)
    })
  }
  return new V(uuid, cb)
}
