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
  constructor (roomId, cb) {
    super()

    const self = this

    // Hide EventEmitter properties from enumeration
    Object.defineProperty(self, '_events', { value: self._events, enumerable: false, configurable: false, writable: false })
    Object.defineProperty(self, '_maxListeners', { value: self._events, enumerable: false, configurable: false, writable: false })

    // Define numerated contructor debug object
    Object.defineProperty(self, '_debug', {
      value: _debug('V:constructor-' + consCounter++),
      writable: true
    })

    self._debug('constructor %s', roomId)

    let proxy

    const ws = new _WebSocket('wss://api.vars.online')

    Object.defineProperty(this, '_socket', { value: ws })

    ws.on('data', onMessage)
    ws.on('close', onClose)
    ws.on('error', onError)
    ws.on('connect', () => {
      self._debug('Socket opened')

      if (!roomId) {
        self._debug('Requesting new roomId...')
        self._requestedRoomId = true
        send({ type: 'requestRoomId' })
      } else {
        Object.defineProperty(self, '_roomId', { value: roomId })
        send({ type: 'startWithId', data: roomId })
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
          if (typeof key === 'symbol') return obj[key]
          const treeKey = tree.concat([key]).join('.')
          if (!key.startsWith('_')) self._debug('get %s', treeKey)
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
    function send (data, sendingWs = ws) {
      self._debug('Sending %o', data)
      sendingWs.send(JSON.stringify(data))
    }
    function initWithId (id) {
      self._debug('Init with id: %s', id)
      Object.defineProperty(self, '_roomId', { value: id })
      init()
    }
    function init () {
      Object.defineProperty(self, '_debug', {
        value: _debug('v' + instanceCounter++ + ':' + self._roomId)
      })
      proxy = new Proxy(self, handler())
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
            self[ setKey ] = message.data
            self.emit('set', { key: message.key, value: message.data })
          } catch (e) {
            self._debug('Failed to sync set')
          }
          break
        }
        case 'delete': {
          const deleteKey = message.key
          self._debug('sync delete %s', deleteKey)
          delete self[ deleteKey ]
          self.emit('delete', message.key)
          break
        }
        case 'destroy': {
          self.close()
          self.emit('destroy')
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
    function onClose (reason) {
      self._debug('Socket closed %s', reason)
      self._closed = true
    }
    function onError (err = 'Error') {
      self._debug('Socket error %s', err)
      self.close()
      throw err
    }
  }

  close () {
    this._debug('close')
    if (this._requestedRoomId) {
      this._debug('Remember to set your roomId to %s', this._roomId)
      console.log(`Remember to set your roomId to ${this._roomId}`)
    }
    if (this._socket) {
      process.nextTick(() => {
        process.nextTick(() => {
          this._socket.destroy()
        })
      })
    }
  }

  destroy () {
    this._debug('destroy')
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

module.exports = function _V (roomId = '', cb) {
  // If only callback is passed, fix params
  if (typeof roomId === 'function') {
    cb = roomId
    roomId = ''
  }
  if (cb || !deasync || !deasync.loopWhile) {
    if (typeof cb === 'function') return new V(roomId, cb)
    return new Promise(resolve => new V(roomId, resolve))
  }
  return new V(roomId)
}
