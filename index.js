const uuid = require('uuid')
const request = require('request')

class V {
  constructor (id) {
    if (!id) {
      // TODO get new ID
      id = uuid.v4()
      console.log(`Use ${id} as as your V ID`)
    }
    Object.defineProperty(this, '_id', { value: id })
    return new Proxy(this, {
      get (obj, key) {
        if (key in obj) return obj[key]
        return undefined
      },
      set (obj, key, val) {
        // console.log(obj)
        // console.log(`Set ${key}`)
        obj[key] = val
      },
      deleteProperty (obj, key, val) {
        // console.log(`Delete ${key}`)
        delete obj[key]
      },
      enumerate () {
        return this.keys()
      }
    })
  }

  var (name, initVal) {
    this._values[name] = initVal
    Object.defineProperty(this, name, {
      get () {
        let val = this._values[name]
        console.log(`Se envía ${val}`)
        return val
      },
      set (val) {
        request('http://google.com', (err, res, body) => {
          if (err) console.error(err)
          console.log('body')
        })
        console.log(`Se guardó ${val}`)
        this._values[name] = val
      },
      enumerable: true
    })
  }

  const (name, val) {
    this._values[name] = val
    Object.defineProperty(this, name, {
      get () {
        let val = this._values[name]
        console.log(`Se envía ${val}`)
        return val
      },
      enumerable: true
    })
  }
}

module.exports = V
