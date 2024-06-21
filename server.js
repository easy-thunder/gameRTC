const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/room/:roomId', (req, res) => {
    res.render('room');
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join-room', (roomId, userId) => {
        console.log('User ' + userId + ' joined room ' + roomId);
        socket.join(roomId);
        socket.to(roomId).emit('userConnected', userId);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server started on port 3000');
});