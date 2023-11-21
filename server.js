
const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const  formatMessage = require("./utils/messages");
const { userjoin, getCurrentUser ,userLeave,getRoomUsers} = require("./utils/users")

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const botName = 'admin';


app.use(express.static(path.join(__dirname, 'Public')));

 io.on('connection', socket =>{


socket.on('joinroom', ({username,room}) => {

    const user = userjoin(socket.id, username, room);
    socket.join(user.room)


    socket.emit('message', formatMessage( botName, 'Welcome to Drop chat' ))
    
    socket.broadcast.to(user.room).emit('message', formatMessage( botName, `${user.username} joined the chat` ));
    

    //sen users and rrom infor

    io.to(user.room).emit('roomusers', {
        room: user.room,
        users: getRoomUsers(user.room)
    });
    
    socket.on('disconnect', () =>{
const user = userLeave(socket.id);

if(user){
    
    io.to(user.room).emit('message', formatMessage( botName, `${user.username} left the chat` ))


}


io.to(user.room).emit('roomusers', {
    room: user.room,
    users: getRoomUsers(user.room)
});

    })
});





//listen for chat message 

socket.on('chatMessage', (msg) => {

    const user = getCurrentUser(socket.id);

   io.to(user.room).emit('message', formatMessage(user.username, msg));
})
 })

 

const PORT  = 3000 || process.env.PORT;
 
server.listen(PORT, () => console.log( `Server running on port ${PORT}`))