import WebSocket, { WebSocketServer } from "ws"

const port = Number(process.env.PORT)

const wss = new WebSocketServer(
  {
    port,
    clientTracking: true,
  },
  () => {
    console.log("WebSocket server running on port", port)
  }
)

wss.on("connection", (ws) => {
  console.log("Connection")

  ws.on("error", (ev) => console.log("WS Error", ev))

  ws.on("message", (data, binary) => {
    console.log("Message", String(data))
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`re:${data}`, { binary })
      }
    })
  })
})

wss.on("error", (ev) => console.log("WSS Error", ev))

export {}
