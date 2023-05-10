import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { createServer } from "node:http"
import express from "express"
import WebSocket, { WebSocketServer } from "ws"

const app = express()
app.set("views", resolve(dirname(fileURLToPath(import.meta.url)), "../views"))
app.set("view engine", "pug")
app.get("/favicon.ico", (_, res) => res.sendStatus(204))

app.get("/", (_req, res) => {
  res.render("index", { title: "Stats" })
})

const server = createServer(app)
const wss = new WebSocketServer({ server })

wss.on("connection", ws => {
  console.log("Connection")

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
    console.log("WS Close")
  })
})

wss.on("error", err => console.log("WSS Error", err))

server.listen(Number(process.env.PORT), () => {
  console.log("Server running on port", process.env.PORT)
})
