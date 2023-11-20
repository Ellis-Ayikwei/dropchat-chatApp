const chatform = document.getElementById('chat-form')

const socket=io();



socket.on('message', message =>{
    console.log(message);
});


//message submit


chatform.addEventListener('submit', (e) => {
    e.preventDefault();


    const msg = e.target.elements.msg.value;

    socket.emit('chatMessage', msg);
})