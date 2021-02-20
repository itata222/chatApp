const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')

const app = express();
const server = http.createServer(app)
const io = socketio(server)
const publicDirectoryPath = path.join(__dirname, '../public')
const port = process.env.PORT || 4000

app.use(express.json())
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    socket.emit('message', 'Welcome')
    socket.broadcast.emit('message', 'A new user has just joined !')
    socket.on('sendMessage', (message) => {
        io.emit('message', message)
    })
    socket.on('disconnect', () => {
        io.emit('message', 'A user just left !')
    })
})

server.listen(port, () => {
    console.log('Server is up on port ' + port)
})