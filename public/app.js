const messageInput = document.querySelector("#message");
const roomName = document.querySelector("#room");
const sendBtn = document.querySelector("#sendBtn");
const joinRoomBtn = document.querySelector("#joinRoom");
const leaveRoomBtn = document.querySelector("#leaveRoom");
const messageBoxContainer = document.querySelector(".messageBox");
const messageBox = document.querySelector(".messageBox ul");
const usernameInput = document.querySelector("#username");
const changeUsernameBtn = document.querySelector("#changeUsername");
const typingIndicator = document.querySelector("#typingIndicator");
const UsersList = document.querySelector('.onlineUsers');

let currentRoom = ""; 
let username = "";

const socket = io();

// Receive messages
socket.on("receive-message", ({username, message}) => {

    const li = document.createElement("li");
    li.innerHTML = `
        <span>${username}</span>
        <p>${message}</p>
        `
    messageBox.appendChild(li);
        messageBoxContainer.scrollTop = messageBoxContainer.scrollHeight;
});

// Join Room
joinRoomBtn.addEventListener("click", () => {
    if (roomName.value.trim() !== "" && usernameInput.value.trim() !== "") {
        username = usernameInput.value.trim();
        currentRoom = roomName.value;
        socket.emit("joinRoom", {username, roomName: currentRoom});
        usernameInput.value = '';
        roomName.value = "";
    } else {
        alert("Please enter a room name and provide a username");
    }
});

// Typing Indicator
messageInput.addEventListener("input", () => {
    socket.emit("typing", currentRoom);
});

socket.on("user-typing", () => {
    typingIndicator.style.opacity = "1"; // Show typing indicator
    setTimeout(() => {
        typingIndicator.style.opacity = "0"; // Hide after 1 second
    }, 1000);
});

// Online Users
socket.on("online-users", (onlineUsers) => {
    UsersList.innerHTML = onlineUsers.map(user => `<li>${user}</li>`).join('');
})

// Leave Room
leaveRoomBtn.addEventListener("click", () => {
    if (currentRoom) {
        socket.emit("leaveRoom", {username,roomName: currentRoom});
        currentRoom = ""; 
    } else {
        alert("You are not in a room");
    }
});


// Send Message
window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement === messageInput) {
        sendMsg()
    console.log(e.key)
    }
})

sendBtn.addEventListener("click", () => {
    sendMsg();
});

function sendMsg() {
    if (currentRoom && username) {
        const message = messageInput.value.trim();

        if (message) {
            socket.emit("message", { room: currentRoom, username: username, message:message });
            messageInput.value = "";
            messageInput.focus()
        } else {
            alert("Message cannot be empty");
        }
    } else {
        alert("Join a room and enter username before sending a message");
    }
}