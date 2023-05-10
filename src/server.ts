import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { createServer } from "node:http"
import express from "express"
import WebSocket, { WebSocketServer } from "ws"

/** Sessions */
// const ids = new Map<string, any>()

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
  // if (ids.has(ws)) {

  ws.on("error", ev => console.log("WS Error", ev))

  ws.on("message", (data, binary) => {
    // const msg = JSON.parse(String(data))
    // if (!ids.has(msg.id)) {
    //   ids.set(msg.id, msg)
    //   // const client = ids.get(msg.id)
    //   // client.send(data, { binary })
    // }

    // console.log("Message", String(data))

    wss.clients.forEach(client => {
      // if (client !== ws && client.readyState === WebSocket.OPEN) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data, { binary })
        // client.send(`re:${data}`, { binary })
      }
    })
  })

  // const id = setInterval(() => {
  //   ws.send(JSON.stringify(process.memoryUsage()), err => {
  //     if (err) {
  //       console.log("Error sending message", err)
  //     }
  //   })
  // }, 1_000)

  ws.on("upgrade", () => {
    console.log("WS Upgrade")
  })

  ws.on("close", () => {
    console.log("WS Close")
    // console.log("stopping client interval")
    // clearInterval(id)
  })
})

wss.on("error", err => console.log("WSS Error", err))

server.listen(Number(process.env.PORT), () => {
  console.log("Server running on port", process.env.PORT)
})
