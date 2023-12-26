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
        origin: "http://localhost:3000"
    }
})

io.on("connection", (socket) => {

    socket.on("setup", (userData) => {
        socket.join(userData._id)
        console.log(userData._id)
        socket.emit("connected")
    })

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("user joined room" + room)
    })

    socket.on('typing', (room) => socket.to(room).emit("typing"))
    socket.on('stop typing', (room) => socket.to(room).emit("stop typing"))

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

    socket.on("callUser", ({ userToCall, signalData, userData}) => {
		socket.to(userToCall).emit("callUser", { signal: signalData, from: userData});
	});

	socket.on("answerCall", ({signal, to}) => {
		socket.to(to).emit("callAccepted", {signal: signal})
	});

    socket.on("hungUp", ({to}) => {
        socket.to(to).emit("CallDisconnected")
    })
    socket.on("DeclineCall", ({to}) => {
        socket.to(to).emit("CallDeclined")
    })

    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });
})