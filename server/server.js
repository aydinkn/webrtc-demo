const path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const EVENTS = {
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    MESSAGE: 'message',
    USER_CONNECTED: 'user-connected',
    USER_DISCONNECTED: 'user-disconnected',
    ONLINE_USERS: 'online-users'
};

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '..', 'build');
const clients = {};

app.use(express.static(publicPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

io.on(EVENTS.CONNECTION, (socket) => {
    clients[socket.id] = socket;

    const messageHandler = (id, message) => {
        const client = clients[id];

        if (!client) return;

        socket.to(id).emit(EVENTS.MESSAGE, message);
    };

    const onlineUsersHandler = () => {
        const users = Object.keys(clients).filter(cid => cid !== socket.id);
        socket.emit(EVENTS.ONLINE_USERS, users);
    }

    const disconnectHandler = () => {
        socket.removeListener(EVENTS.DISCONNECT, disconnectHandler);
        socket.removeListener(EVENTS.ONLINE_USERS, onlineUsersHandler);
        socket.removeListener(EVENTS.MESSAGE, messageHandler);
        delete clients[socket.id];
        io.emit(EVENTS.USER_DISCONNECTED, socket.id);
    };

    socket.addListener(EVENTS.DISCONNECT, disconnectHandler);
    socket.addListener(EVENTS.MESSAGE, messageHandler);
    socket.addListener(EVENTS.ONLINE_USERS, onlineUsersHandler);
    socket.broadcast.emit(EVENTS.USER_CONNECTED, socket.id);
});

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`);
});
