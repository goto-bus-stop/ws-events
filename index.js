var Emitter = require('component-emitter')

module.exports = function wsEvents (sock) {
  var listeners = new Emitter()
  var onopenHandlers = []

  function onmessage (event) {
    var json, args
    try {
      json = JSON.parse(event.data)
      args = [json.t].concat(json.a)
    } catch (e) {
      onerror(e)
      return
    }
    listeners.emit.apply(listeners, args)
  }

  function onerror (err) {
    listeners.emit('error')
  }

  function onopen () {
    onopenHandlers.forEach(function (fn) {
      fn()
    })
    onopenHandlers = []
  }

  function whenOpen (fn) {
    if (sock.readyState === sock.constructor.OPEN) {
      fn()
    } else {
      onopenHandlers.push(fn)
    }
  }

  sock.onmessage = onmessage
  sock.onerror = onerror
  sock.onopen = onopen

  function emit (type) {
    var args = Array.prototype.slice.call(arguments, 1)
    whenOpen(function () {
      sock.send(JSON.stringify({ t: type, a: args }))
    })
    return events
  }

  function on (type, cb) {
    listeners.on(type, cb)
    return events
  }

  function off (type, cb) {
    listeners.off(type, cb)
    return events
  }

  var events = Object.create(sock)
  events.socket = sock
  events.emit = emit
  events.on = on
  events.off = off
  events.listeners = listeners.listeners.bind(listeners)
  events.hasListeners = listeners.hasListeners.bind(listeners)

  return events
}
