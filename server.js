const { Server } = require('socket.io');

const EVENTS = {
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    MESSAGE: 'message',
    USER_CONNECTED: 'user-connected',
    USER_DISCONNECTED: 'user-disconnected',
    ONLINE_USERS: 'online-users'
};

const io = new Server({ cors: { origin: '*' } });
const port = 3001;
const clients = {};

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

io.listen(port);
