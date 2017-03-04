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
  constructor (opts, cb) {
    super()

    const self = this

    // Hide EventEmitter properties from enumeration
    Object.defineProperty(self, '_events', { value: self._events, enumerable: false, configurable: false, writable: true })
    Object.defineProperty(self, '_maxListeners', { value: self._events, enumerable: false, configurable: false, writable: true })

    // Define numerated contructor debug object
    Object.defineProperty(self, '_debug', {
      value: _debug('V:constructor-' + consCounter++),
      writable: true
    })

    self._debug('constructor %o', opts)

    let proxy

    const ws = new _WebSocket(opts.server)

    Object.defineProperty(self, '_socket', { value: ws, writable: true })

    ws.on('data', onMessage)
    ws.on('close', onClose)
    ws.on('error', onError)
    ws.on('connect', () => {
      self._debug('Socket opened')

      if (!opts.roomId) {
        self._debug('Requesting new roomId...')
        self._requestedRoomId = true
        send({ type: 'requestRoomId' })
      } else {
        Object.defineProperty(self, '_roomId', { value: opts.roomId })
        send({ type: 'startWithId', data: opts.roomId })
      }
    })

    if (deasync && deasync.loopWhile) {
      deasync.loopWhile(() => proxy === undefined)
      return proxy
    }

    // Proxy handler with object tree
    function handler (tree = []) {
      // self._debug('new handler %o', tree)
      return {
        get (obj, key) {
          if (typeof key === 'symbol' || key === 'domain' || key === 'keys') return obj[key]
          const treeKey = tree.concat([key]).join('.')
          if (!key.startsWith('_')) self._debug('get %s', treeKey)
          if (key in obj) {
            if (!key.startsWith('_') && typeof obj[key] === 'object') {
              self._debug('New proxy for key %s', key)
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
          self._debug('set %s=%o', treeKey, val)
          try {
            if (obj[key] === val) return true
            obj[key] = val
            if (!self._closed && !key.startsWith('_')) {
              send({
                type: 'set',
                key: treeKey,
                data: val
              })
            }
            return true
          } catch (e) {
            self._debug('Failed to set readonly property %o', e)
            return false
          }
        },
        deleteProperty (obj, key) {
          const treeKey = tree.concat([key]).join('.')
          self._debug('deleteProperty %s', treeKey)
          delete obj[key]
          if (!self._closed) {
            send({
              type: 'delete',
              key: treeKey
            })
          }
          return true
        }
      }
    }
    function send (data, sendingWs = self._socket) {
      self._debug('Sending %o', data)
      sendingWs.send(JSON.stringify(data))
    }
    function initWithId (id) {
      self._debug('Init with id: %s', id)
      Object.defineProperty(self, '_roomId', { value: id })
      init()
    }
    function init () {
      if (!self._closed) {
        Object.defineProperty(self, '_debug', {
          value: _debug('v' + instanceCounter++ + ':' + self._roomId)
        })
        Object.defineProperty(self, 'keys', {
          get () {
            return Object.keys(self).filter(key => !key.startsWith('_') && key !== 'domain')
          }
        })
      }
      self._closed = false
      proxy = new Proxy(self, handler())
      self.checkToUnref()
      self._debug('Ready')
      if (cb) return cb(proxy)
    }
    function onMessage (message) {
      message = JSON.parse(message)
      self._debug('Received %o', message)
      switch (message.type) {
        case 'roomId': {
          self._debug('Use %s as your roomId', message.data)
          console.log(`Use ${message.data} as your roomId`)
          initWithId(message.data)
          break
        }
        case 'start': {
          const data = message.data
          const vars = data.vars
          self._debug('vars: %O', vars)
          for (const key in vars) {
            const varOrConst = vars[ key ]
            // self._debug(typeof varOrConst)
            if (varOrConst && typeof varOrConst === 'object' && varOrConst.isConst) {
              // self._debug('Rehidrating constant')
              Object.defineProperty(self, key, { value: vars[ key ].val, enumerable: true })
            } else {
              // self._debug('Rehidrating variable')
              self[ key ] = vars[ key ]
            }
          }
          init()
          break
        }
        case 'set': {
          const setKey = message.key
          self._debug('sync set %s', setKey)
          try {
            if (!setKey.includes('.')) {
              self[ setKey ] = message.data
            } else {
              const tree = setKey.split('.')
              let obj = self
              for (let i = 0; i < tree.length - 1; i++) {
                let k = tree[i]
                if (k in obj) {
                  obj = obj[k]
                } else {
                  obj[k] = {}
                }
              }
              obj[tree[tree.length - 1]] = message.data
            }
            self.emit('set', { key: message.key, value: message.data })
          } catch (e) {
            self._debug('Failed to sync set')
          }
          break
        }
        case 'delete': {
          const deleteKey = message.key
          self._debug('sync delete %s', deleteKey)
          if (!deleteKey.includes('.')) {
            delete self[ deleteKey ]
          } else {
            const tree = deleteKey.split('.')
            let obj = self
            for (let i = 0; i < tree.length - 1; i++) {
              let k = tree[i]
              if (k in obj) {
                obj = obj[k]
              } else {
                obj[k] = {}
              }
            }
            delete obj[tree[tree.length - 1]]
          }
          self.emit('delete', message.key)
          break
        }
        case 'destroy': {
          self.close(true)
          self.emit('destroyed')
          break
        }
        case 'error': {
          const errorMessage = message.data
          self._debug('Error: %s', errorMessage)
          console.error(errorMessage)
          self.close()
          throw new Error(errorMessage)
        }
        default: {
          self._debug('Received unknown message type')
        }
      }
    }
    function onClose (reason = 'Not specified') {
      self._debug('Socket closed %s', reason)
      self._closed = true
      if (!self._closing && !self._error) {
        reconnect()
      }
    }
    function onError (err) {
      self._debug('Socket error %o', err)
      self._error = true
      self.close()
      throw err
    }
    function reconnect (retry = 1) {
      if (self._closing || self._error) return false
      setTimeout(() => {
        const ws = new _WebSocket(opts.server)

        Object.defineProperty(self, '_socket', { value: ws, writable: true })

        ws.on('error', () => {
          self._debug('Failed to reconnect, retrying...')
          reconnect(++retry)
        })
        ws.on('connect', () => {
          ws.on('data', onMessage)
          ws.on('close', onClose)
          self._debug('Socket opened')
          send({ type: 'startWithId', data: self._roomId })
        })
      }, Math.pow(2, retry) * 1000)
    }
  }

  addListener (eventName, cb) {
    this.ref()
    super.addListener(eventName, cb)
  }

  on (eventName, cb) {
    this.ref()
    super.on(eventName, cb)
  }

  once (eventName, cb) {
    this.ref()
    super.once(eventName, (data) => {
      cb(data)
    })
  }

  prependListener (eventName, cb) {
    this.ref()
    super.prependListener(eventName, cb)
  }

  prependOnceListener (eventName, cb) {
    this.ref()
    super.prependOnceListener(eventName, cb)
  }

  removeListener (eventName, cb) {
    super.removeListener(eventName, cb)
    this.checkToUnref()
  }

  removeAllListeners (eventName) {
    super.removeAllListeners(eventName)
    this.checkToUnref()
  }

  ref () {
    if (this._socket._ws && this._socket._ws._socket && this._socket._ws._socket.ref) {
      this._socket._ws._socket.ref()
    }
  }

  checkToUnref () {
    if (this._socket._ws && this._socket._ws._socket && this._socket._ws._socket.unref) {
      let counter = 0
      this.eventNames().forEach(event => {
        counter += this.listenerCount(event)
      })
      if (!counter) this._socket._ws._socket.unref()
    }
  }

  close (destroying = false) {
    this._closing = true
    this._debug('close')
    if (!destroying && this._requestedRoomId) {
      this._debug('Remember to set your roomId to %s', this._roomId)
      console.log(`Remember to set your roomId to ${this._roomId}`)
    }
    if (this._socket) {
      this._socket.destroy()
    }
  }

  destroy () {
    this._debug('destroy')
    this._socket.send(stringify({ type: 'destroy' }))
    this.close(true)
  }

  const (key, val) {
    _debug('V:const')('%s %o', key, val)
    Object.defineProperty(this, key, { value: val, enumerable: true })
    this._socket.send(JSON.stringify({ type: 'set', key: key, data: { val: val, isConst: true } }))
  }
}

function stringify (data) {
  return JSON.stringify(data)
}

const defaultsOps = {
  roomId: '',
  server: 'wss://api.vars.online'
}

module.exports = function (opts = defaultsOps, cb) {
  // If only callback is passed, fix params
  if (typeof opts === 'function') {
    cb = opts
    opts = defaultsOps
  }
  if (typeof opts === 'string') {
    opts = { roomId: opts }
  }
  Object.keys(defaultsOps).forEach(k => {
    if (!opts[k]) opts[k] = defaultsOps[k]
  })
  if (cb || !deasync || !deasync.loopWhile) {
    if (typeof cb === 'function') return new V(opts, cb)
    return new Promise(resolve => new V(opts, resolve))
  }
  return new V(opts)
}
