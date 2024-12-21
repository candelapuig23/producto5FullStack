require('dotenv').config(); // Cargar variables de entorno

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const { ApolloServer } = require('apollo-server-express');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { mergeTypeDefs } = require('@graphql-tools/merge');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const http = require('http'); // Para usar Socket.IO con un servidor HTTP
const socket = require('./socket'); // Importa el módulo de configuración de Socket.IO

// Configuración y esquemas
const config = require('./config/config');
const rootSchema = require('./graphql/schemas/rootSchema');
const panelSchema = require('./graphql/schemas/panelSchema');
const taskSchema = require('./graphql/schemas/taskSchema');
const resolvers = require('./graphql/resolvers/resolvers');
const Task = require('./models/Task'); // Modelo de tareas

// Configurar Express y servidor HTTP
const app = express();
const server = http.createServer(app); // Define el servidor HTTP basado en Express

// Importar PanelController y la función para configurar io
const { PanelController, setSocketInstance } = require('./controllers/PanelController');

// Inicializa Socket.IO
const io = socket.init(server);

// Pasar la instancia de io al controlador
setSocketInstance(io);

// Configurar eventos básicos para Socket.IO
io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});


// Habilitar CORS
const corsOptions = {
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'https://studio.apollographql.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};
app.use(cors(corsOptions));

// Sirve la carpeta 'www' como base para archivos estáticos
app.use(express.static(path.join(__dirname, 'www')));

// Configurar rutas específicas para cargar archivos JS correctamente
app.use('/configFrontend.js', (req, res) => {
    res.type('application/javascript');
    res.sendFile(path.join(__dirname, 'www', 'configFrontend.js'));
});
app.use('/socket.js', (req, res) => {
    res.type('application/javascript');
    res.sendFile(path.join(__dirname, 'www', 'socket.js'));
});
app.use('/tasks.js', (req, res) => {
    res.type('application/javascript');
    res.sendFile(path.join(__dirname, 'www', 'tasks.js'));
});
app.use('/tablero.js', (req, res) => {
    res.type('application/javascript');
    res.sendFile(path.join(__dirname, 'www', 'tablero.js'));
});

// Configuración de subida de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName); // Generar un nombre único para evitar conflictos
    },
});
const upload = multer({ storage });

// Ruta para manejar la subida de archivos
app.post('/upload/:taskId', upload.single('file'), async (req, res) => {
    try {
        const { taskId } = req.params;
        const filePath = `/uploads/${req.file.filename}`; // Ruta relativa al archivo subido

        // Actualizar la tarea en la base de datos para incluir el archivo
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { $push: { files: filePath } },
            { new: true }
        );

        res.status(200).json({ message: 'Archivo subido correctamente.', task: updatedTask });
    } catch (error) {
        console.error('Error al subir el archivo:', error);
        res.status(500).json({ message: 'Error al subir el archivo.' });
    }
});

// Ruta principal
app.get('/', (req, res) => {
    res.redirect('/www/index.html'); // Redirige al archivo principal de tu frontend
});

// Ruta para servir archivos subidos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Inicio del servidor y configuración de Apollo Server
async function startServer() {
    try {
        // Conexión a MongoDB
        await mongoose.connect(config.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Conectado a MongoDB');

        // Crear el esquema de GraphQL
        const schema = makeExecutableSchema({
            typeDefs: mergeTypeDefs([rootSchema, panelSchema, taskSchema]),
            resolvers,
        });

        // Configurar Apollo Server
        const apolloServer = new ApolloServer({ 
            schema,
            introspection: true, // Para permitir herramientas como Apollo Sandbox
            context: ({ req }) => ({ req }), // Si necesitas el contexto
        });
        
        await apolloServer.start();
        apolloServer.applyMiddleware({ 
            app, 
            path: '/graphql',
            cors: corsOptions,
            
        });

        // Iniciar el servidor HTTP con Socket.IO
        const port = config.PORT || 4000;
        server.listen(port, () => {
            console.log(`🚀 Servidor listo en http://localhost:${port}${apolloServer.graphqlPath}`);
            console.log(`📂 Archivos subidos disponibles en http://localhost:${port}/uploads/`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
    }
}

startServer();
