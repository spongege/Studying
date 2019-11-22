const path = require('path')
const express = require('express')
const app = express()
const server = require('http').Server(app)
const WebSocket = require('ws')

const wss = new WebSocket.Server({ server })

wss.on('connection', ws => {
  // 监听客户端消息
  console.log(wss.clients.size)
  ws.on('message', message => {
    const msg = JSON.parse(message)
    if (msg.type === 'open') {
      // 初始连接时标识会话并且保存起来
      ws.sessionId = `${msg.from}-${msg.to}`
      console.log(ws.sessionId)
    } else {
      const sessionId = `${msg.to}-${msg.from}`
      wss.clients.forEach(client => {
        if (client.sessionId === sessionId) {
          client.send(message)
        }
      })
    }
  })

  // 连接关闭
  ws.on('close', () => {
    console.log('连接关闭')
  })
})
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './client-lff.html'))
})
app.get('/2', (req, res) => {
  res.sendFile(path.join(__dirname, './client-lx.html'))
})

server.listen(9000, () => {
  console.log('http://localhost:9000')
})
