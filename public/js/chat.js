const socket = io()

const buttonSocket = document.querySelector('#increment')
const inputText = document.getElementById('formInput');
const formSocket = document.getElementById('formSocket')
const locationButton = document.getElementById('send-location')
const messagesContainer = document.getElementById('messages')

const messageTemplate = document.getElementById('message-template').innerHTML
const locationMessageTemplate = document.getElementById('location-message-template').innerHTML
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


const autoScroll = () => {
    // New message element
    const $newMessage = messagesContainer.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = messagesContainer.offsetHeight

    // Height of messages container
    const containerHeight = messagesContainer.scrollHeight

    // How far have I scrolled?
    const scrollOffset = messagesContainer.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        'username': message.username,
        'message': message.text,
        'createdAt': moment(message.createdAt).format('HH:mm a')
    })
    messagesContainer.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, { room, users })
    document.querySelector('#sidebar').innerHTML = html
})

socket.on('locationMessage', (location) => {
    console.log(location)
    const html = Mustache.render(locationMessageTemplate, {
        'username': location.username,
        'location': location.url,
        'createdAt': moment(location.createdAt).format('HH:mm a')
    })
    messagesContainer.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

formSocket.addEventListener('submit', (event) => {
    event.preventDefault();
    buttonSocket.setAttribute('disabled', 'disabled')
    console.log('Clicked!')
    socket.emit('sendMessage', inputText.value, (error) => {
        buttonSocket.removeAttribute('disabled')
        inputText.value = "";
        inputText.focus()
        if (error)
            console.log(error)
        console.log('Delivered!')
    })
})

locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('GeoLocation is not supported by your browser')
    }
    locationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            'latitude': position.coords.latitude,
            'longitude': position.coords.longitude
        }, () => {
            console.log('Location shared!')
            locationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = "/"
    }
})