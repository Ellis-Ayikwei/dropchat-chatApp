
const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const  formatMessage = require("./utils/messages");
const { userjoin, getCurrentUser ,userLeave,getRoomUsers} = require("./utils/users");

const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { availableParallelism } = require('os');
const cluster = require('node:cluster');
const { createAdapter, setupPrimary } = require("@socket.io/cluster-adapter");
if (cluster.isPrimary) {
    const numCPUs = availableParallelism();
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork({
        PORT: 3000 + i
      });
    }
  
    return setupPrimary();
  }



async function main(){


  
    
    const db = await open({
        filename: 'chat.db',
        driver: sqlite3.Database
      });
    
      await db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          room TEXT UNIQUE,
          content TEXT,
          username TEXT
        );
      `);


     


const app = express();
const server = http.createServer(app);


const io = socketio(server, {
    connectionStateRecovery: {},
    adapter: createAdapter()


});




const botName = 'admin';





app.use(express.static(path.join(__dirname, 'Public')));

 io.on('connection', socket =>{


socket.on('joinroom', async ({username,room}) => {

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

socket.on('chatMessage', async (msg) => {
let result;

    const user = getCurrentUser(socket.id);


    console.log(user.username + ':' + msg,  'from room:' + user.room);


   try {
    result = await db.run('INSERT INTO messages (content, room, username) VALUES (?, ?, ?)', msg, user.room, user.username);
  } catch (e) {
    if (e.errno === 19) {

    } else {
      // nothing to do, just let the client retry
    }
    return;
  }
  io.to(user.room).emit('message', formatMessage(user.username, msg), result.lastID);
  
  console.log('Emitting message:', formattedMsg);

})
 })

 

const PORT  = 3000 || process.env.PORT;
 
server.listen(PORT, () => console.log( `Server running on port ${PORT}`))

}


main();