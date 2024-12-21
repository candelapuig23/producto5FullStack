let ioInstance;

module.exports = {
    // backend/socket.js
    init: (server) => {
    const { Server } = require('socket.io');
    ioInstance = new Server(server, {
        cors: {
            origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
            methods: ['GET', 'POST'],
        },
        serveClient: true,
    });
    return ioInstance;
},

    getIO: () => {
        if (!ioInstance) {
            throw new Error('Socket.IO no ha sido inicializado');
        }
        return ioInstance;
    },
};
