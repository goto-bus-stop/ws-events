var EventEmitter2 = require('eventemitter2').EventEmitter2;

module.exports = function wsEvents (sock, opts) {
  var options = opts || {};
  
  var listeners = new EventEmitter2({
    wildcard: options.wildcard || true,
    maxListeners: options.maxListeners || 20,
    verboseMemoryLeak: options.errorOnLeak || true
  });
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
  events.listeners = listeners.listenersAny.bind(listeners)

  return events
}
