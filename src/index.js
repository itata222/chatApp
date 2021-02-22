const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser,
    removeUser,
    getUsersInRoom,
    getUser } = require('./utils/users')

const app = express();
const server = http.createServer(app)
const io = socketio(server)
const publicDirectoryPath = path.join(__dirname, '../public')
const port = process.env.PORT || 4000

app.use(express.json())
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {

    socket.on('join', ({ username, room }, callback) => {
        const { error, newUser } = addUser({ id: socket.id, username, room })

        if (error)
            return callback(error)


        socket.join(newUser.room)
        socket.emit('message', generateMessage(`Welcome ${newUser.username}`))
        socket.broadcast.to(newUser.room).emit('message', generateMessage(`${newUser.username} has just joined!`))
        io.to(room).emit('roomData', {
            room,
            users: getUsersInRoom(room)
        })

        callback()
    })
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter();
        if (filter.isProfane(message))
            return callback('Profanity is not allowed!')
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })
    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} just left !`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log('Server is up on port ' + port)
})