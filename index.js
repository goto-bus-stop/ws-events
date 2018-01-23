var EventEmitter2 = require('eventemitter2').EventEmitter2;

module.exports = function wsEvents (sock, opts) {
  var options = opts || {};
  var logger = options.logger || console.log;

  var listeners = new EventEmitter2({
    wildcard: options.wildcard || true,
    maxListeners: options.maxListeners || 20,
    verboseMemoryLeak: options.errorOnLeak || true
  });
  var onopenHandlers = []

  function emit ( e ){

    logger("Event Emitter :: Emit " + e);

    var event = arguments[0];
    var args = Array.prototype.slice.call(arguments, 1)

    return events.socket.send(JSON.stringify( [ event, args ] ));

  }

  function onmessage( packet ) {

    console.log( 'd:', packet.data );

    var json, event, args;
    try {
      json = JSON.parse(packet.data)
    } catch (e) {
      onerror(e)
      return
    }

    return process( json )

  }

  function onmessagehandler( data ){

    console.log('mh:', data)

    var json, event, args;
    try {
      json = JSON.parse(data)
    } catch (e) {
      onerror(e)
      return
    }
    return process( json )

  }

  function process( data ){

    var event = data[0];
    var args = data[1];

    console.log( 'p:', event, args, [ event ].concat( args ) );
    listeners.emit.apply(listeners, [ event ].concat( args ) );

  }

  function onerror (err) {
    listeners.emit('error', err)
  }
  function on( e ){
    logger("Event Emitter :: Handler added " + e);
    return listeners.on.apply( listeners, arguments );
  }
  function off( e ){
    logger("Event Emitter :: Handler removed " + e);
    return listeners.off.apply( listeners, arguments );
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
  if(sock.on){
    sock.on('message', onmessagehandler);
  }
  
  var events = Object.create(sock)
  events.socket = sock
  events.emit = emit
  events.on = on
  events.off = off
  events.listeners = listeners.listenersAny.bind(listeners)

  return events
}
