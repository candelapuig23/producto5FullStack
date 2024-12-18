// models/Task.js
const mongoose = require('mongoose');

// Definición del esquema para las tareas
const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'El título es obligatorio'],
        trim: true, // Elimina espacios en blanco al inicio y al final
    },
    description: {
        type: String,
        default: '',
        trim: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    responsible: {
        type: String,
        required: [true, 'El responsable es obligatorio'],
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    panelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Panel',
        required: [true, 'El ID del panel es obligatorio'],
    },
    status: {
        type: String,
        enum: ['por_hacer', 'en_proceso', 'finalizado'],
        default: 'por_hacer',
    },
    files: {
        type: [String], // Array de strings para almacenar las rutas de los archivos
        default: [],
    },
});

// Middleware para actualizar automáticamente el campo `updatedAt` antes de guardar
taskSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Exportar el modelo basado en el esquema definido
module.exports = mongoose.model('Task', taskSchema);
