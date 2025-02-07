const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const path = require("path");

const app = express();

const server = http.createServer(app);
const io = new Server(server);

let onlineUsers = {}

io.on("connection", (socket) => {
  // Join Room
  socket.on("joinRoom", ({username, roomName}) => {
    if (!onlineUsers[roomName]) onlineUsers[roomName] = [];
    onlineUsers[roomName].push(username);

    socket.join(roomName);
    io.emit("online-users", onlineUsers[roomName]);
    console.log(`User has join the room:${roomName}`);
 });

  // Leave Room
  socket.on("leaveRoom", ({username, roomName}) => {
    socket.leave(roomName);

    onlineUsers[roomName] = onlineUsers[roomName].filter((user) => user !== username);
    io.emit("online-users", onlineUsers[roomName]);

    console.log(`User has left the room:${roomName}`);
  });

  // Send Message
  socket.on("message", ({ room, username, message }) => {
    if (room) {
        io.to(room).emit("receive-message", {username, message});
    }
  });

  socket.on("typing", (room) => {
    io.to(room).emit("user-typing");
  });
});

app.use(express.static(path.resolve('./public')))

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

server.listen(9000, () => console.log("Server is listening on port 9000"));
