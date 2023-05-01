import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { join } from "node:path"
import express from "express"
import { createServer } from "http"
import { WebSocketServer } from "ws"

const __dirname = dirname(fileURLToPath(import.meta.url))
const port = Number(process.env.PORT)

const app = express()
app.use(express.static(join(__dirname, "/public")))

const server = createServer(app)
const wss = new WebSocketServer({ server })

wss.on("connection", function (ws) {
  const id = setInterval(function () {
    ws.send(JSON.stringify(process.memoryUsage()), function () {
      //
      // Ignoring errors.
      //
    })
  }, 100)
  console.log("started client interval")

  ws.on("close", function () {
    console.log("stopping client interval")
    clearInterval(id)
  })
})

server.listen(port, function () {
  console.log(`Listening on http://0.0.0.0:${port}`)
})

// import express from "express"
// import WebSocket, { WebSocketServer } from "ws"

// const port = Number(process.env.PORT)

// const wss = new WebSocketServer(
//   {
//     port,
//     clientTracking: true,
//   },
//   () => {
//     console.log("WebSocket server running on port", port)
//   }
// )

// wss.on("connection", (ws) => {
//   console.log("Connection")

//   ws.on("error", (ev) => console.log("WS Error", ev))

//   ws.on("message", (data, binary) => {
//     console.log("Message", String(data))
//     wss.clients.forEach((client) => {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(`re:${data}`, { binary })
//       }
//     })
//   })
// })

// wss.on("error", (ev) => console.log("WSS Error", ev))

// export {}
