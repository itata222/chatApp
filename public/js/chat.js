const socket = io()

socket.on('message', (message) => {
    console.log(message)
})

const button = document.querySelector('#increment')
const inputText = document.getElementById('formInput');
const formSocket = document.getElementById('formSocket')
formSocket.addEventListener('submit', (event) => {
    event.preventDefault();
    console.log('Clicked!')
    socket.emit('sendMessage', inputText.value)
})