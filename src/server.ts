import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { createServer } from "node:http"
import express from "express"
import WebSocket, { WebSocketServer } from "ws"

let connections = {
  active: 0,
  top: 0
}

const app = express()
app.set("view engine", "pug")
app.set("views", resolve(dirname(fileURLToPath(import.meta.url)), "../views"))
app.get("/favicon.ico", (_, res) => res.sendStatus(204))
app.get("/", (_req, res) => {
  res.render("index", {
    title: "Stats",
    connections,
    mem: Object.fromEntries(
      Object.entries(process.memoryUsage()).map(([key, value]) => [
        key,
        `${(value / 1_000_000).toFixed(2)} MB`
      ])
    )
  })
})

const server = createServer(app)
const wss = new WebSocketServer({ server })

wss.on("connection", ws => {
  connections.active = wss.clients.size
  if (connections.active > connections.top) {
    connections.top = connections.active
  }

  ws.on("error", ev => console.log("WS Error", ev))

  ws.on("message", (data, binary) => {
    wss.clients.forEach(client => {
      // if (client !== ws && client.readyState === WebSocket.OPEN) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data, { binary })
      }
    })
  })

  ws.on("upgrade", () => {
    console.log("WS Upgrade")
  })

  ws.on("close", () => {
    connections.active = wss.clients.size
  })
})

wss.on("error", err => console.log("WSS Error", err))

server.listen(Number(process.env.PORT), () => {
  console.log("Server is running on port", process.env.PORT)
})
