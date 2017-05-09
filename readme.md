# ws-events

Minimal Events for WebSockets.

## Example

`ws-events` decorates a WebSocket instance. It works in node.js and in
the browser with [browserify](https://browserify.org).

On the server side:

```js
const wsEvents = require('ws-events')
const Server = require('ws').Server

const wss = new Server()
wss.on('connection', (ws) => {
  const events = wsEvents(ws)
  events.emit('hello', {
    any: 'json'
  })

  events.on('world', (arg) => {
    console.log(arg)
  })
})
```

On the client side:

```js
const wsEvents = require('ws-events')
const ws = wsEvents(new WebSocket('ws://localhost'))

ws.on('hello', (data) => {
  // data.any === 'json'
  ws.emit('world', 'Hello from a browser \\o')
})
```

## API

### events = wsEvents(socket)

Create a `ws-events` emitter. The emitter _wraps_ the passed-in socket, so all
native WebSocket methods can still be used.

`socket` is a standard WebSocket instance.

```js
const socket = wsEvents(new WebSocket(...))
socket.addEventListener('open', () => {
  // Using a ws-events method.
  socket.emit('ya ya')
  // Using a native method.
  socket.close()
})
```

### events.on(eventName, cb): this

Register an event handler.

### events.off(eventName, cb): this

Remove an event handler.

### events.off(eventName): this

Remove all handlers for the given event.

### events.off(): this

Remove all handlers for all events.

### events.emit(eventName, ...arguments): this

Emit an event. When emitting on the server, the handlers on the client will
fire. When emitting on the client, the handlers on the server will fire.

### events.hasListeners(eventName): bool

Check if there are any handlers for an event.

### events.listeners(eventName): Array&lt;function>

Return the listeners for an event.

## License

[MIT](./LICENSE).
