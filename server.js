const express = require("express");
const http = require("http");
const router = require("./router");

const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5000;

const users = [];

app.use(router);

// socket.io handling
io.on("connection", (socket)=>{

    // new user joined
    socket.on("new_user_joined", (userName)=>{
        users[socket.id] = userName;
        socket.broadcast.emit("user_joined", userName);
    });

    // message sent
    socket.on("send", (msg)=>{
        const date = new Date();
        const dnt = date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear() + '@' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        socket.emit("recieve", {
            message: msg,
            name: users[socket.id],
            timestamp: dnt
        });
    });

    // user disconnected
    socket.on("disconnect", ()=>{
        socket.broadcast.emit("user_disconnected", users[socket.id]);
        delete users[socket.id];
    });

});

server.listen(PORT, ()=>{
    console.log(`server running at port ${PORT}`);
});