import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { createServer } from "node:http"
import express from "express"
import WebSocket, { WebSocketServer } from "ws"

const port = Number(process.env.PORT)
const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
app.set("views", resolve(__dirname, "views"))
app.set("view engine", "pug")

app.get("/favicon.ico", (_req, res) => {
  res.sendStatus(204)
})

app.get("/", (_req, res) => {
  res.render("index", { title: "Stats" })
})

const server = createServer(app)
const wss = new WebSocketServer({ server })

wss.on("connection", ws => {
  console.log("Connection")

  ws.on("error", ev => console.log("WS Error", ev))

  ws.on("message", (data, binary) => {
    console.log("Message", String(data))
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`re:${data}`, { binary })
      }
    })
  })

  const id = setInterval(() => {
    ws.send(JSON.stringify(process.memoryUsage()), err => {
      if (err) {
        console.log("Error sending message", err)
      }
    })
  }, 1_000)

  ws.on("close", () => {
    console.log("stopping client interval")
    clearInterval(id)
  })
})

wss.on("error", err => console.log("WSS Error", err))

server.listen(port, () => {
  console.log("Server running on port", port)
})
