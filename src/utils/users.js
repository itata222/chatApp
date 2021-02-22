const users = [];

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if (!username || !room)
        return { error: 'username and room are required!' }

    const existingUser = users.find((user) => {
        return user.username === username && user.room === room
    })

    if (existingUser)
        return { error: 'username already exist in this room' }

    const newUser = { id, username, room }
    users.push(newUser)
    return { newUser }
}

const removeUser = (id) => {
    const indexUser = users.findIndex((user) => user.id === id)
    if (indexUser !== -1) {
        return users.splice(indexUser, 1)[0]
    }
}

const getUser = (id) => {
    const userToFind = users.find((user) => user.id === id)
    return userToFind
}

const getUsersInRoom = (room) => {
    const usersInroom = users.filter((user) => user.room === room)
    return usersInroom
}

module.exports = {
    addUser,
    removeUser,
    getUsersInRoom,
    getUser
}