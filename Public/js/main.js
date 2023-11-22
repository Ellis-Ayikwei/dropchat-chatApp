const chatform = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')
//get userame and room

const {username, room } = Qs.parse(location.search,{
    ignoreQueryPrefix: true
});




const socket = io();
socket.on('connect', () => {
    console.log('Connected to server');
  })

socket.emit('joinroom', {username, room})



socket.on('roomusers', ({room, users}) => {
    console.log('Room name: ', room);
    outpuRomname(room);
    outputUsers(users);
})





socket.on('message', message =>{
    console.log('Received message:', message);
    
    outputmessage(message);


    //scroll down
chatMessages.scrollTop = chatMessages.scrollHeight

});


//message submit


chatform.addEventListener('submit', (e) => {
    e.preventDefault();


    const msg = e.target.elements.msg.value;

    socket.emit('chatMessage', msg);
    

    //clear the inout 

    e.target.elements.msg.value = '';
    e.target.elements.msg.focus;
})



//output message 
function outputmessage(message){


    const frag = document.createDocumentFragment();

   

    const div =document.createElement('div');
    div.classList.add("message");

    const currentUsername = username;

    const isCurrentUser = message.username === currentUsername;

    // Customize the displayed username based on the sender
    const displayedUsername = isCurrentUser ? "Me" : message.username;



    div.innerHTML=`<p class="meta">${displayedUsername}  <span class="time"> ${message.time} </span></p><h3 class="text">${message.text}</h3>`;
    frag.appendChild(div);
    document.querySelector('.chat-messages').appendChild(frag);

   

}












//add room name to dom 

function outpuRomname(room){
    roomName.innerText = room;


}


function outputUsers(users){
    userList.innerHTML =`${users.map(user => `<li>${user.username}</li>`).join('')}`
}