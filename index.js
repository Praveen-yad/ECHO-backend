const express = require("express");
const dbConnect = require("./mongodb");
const cors = require('cors');
 
const port = 5000
const app = express();

dbConnect();
app.use(express.json())
app.use(cors())
app.get('/', (req,res) => {
    res.send("Hello")
})

app.use('/api/user', require("./Router/userRoutes"))
app.use('/api/chat', require("./Router/chatRoutes"))
app.use('/api/message', require("./Router/messageRoute"))

const server = app.listen(port, console.log("Server is running.."))

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors:{
        origin: "https://echo-e.vercel.app"
    }
})

io.on("connection", (socket) => {
    // console.log("connected to socket.io")

    socket.on("setup", (userDate) => {
        socket.join(userDate._id)
        console.log(userDate._id)
        socket.emit("connected")
    })

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("user joined room"+room)
    })

    socket.on('typing', (room) => socket.in(room).emit("typing"))
    socket.on('stop typing', (room) => socket.in(room).emit("stop typing"))

    socket.on("new message", (newMessageReceived) => {
        let chat = newMessageReceived.chat;
        if(!chat.users)return console.log("No user Found")

        chat.users.forEach(user => {
            if(user._id == newMessageReceived.sender._id){
                return
            }else{
                socket.in(user._id).emit("message received", newMessageReceived)
            }
        })
    });

    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });
})