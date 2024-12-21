(function () {
    class Socket {
        constructor(url) {
            this.socket = io(url);

            this.socket.on('connect', () => console.log('Conectado a WebSocket'));
            this.socket.on('disconnect', () => console.log('Desconectado de WebSocket'));
        }

        on(event, callback) {
            this.socket.on(event, callback);
        }

        emit(event, data) {
            this.socket.emit(event, data);
        }

        disconnect() {
            this.socket.disconnect();
        }
    }

    // Registrar en el espacio global
    window.Socket = new Socket('http://localhost:4000'); // URL del backend
})();
