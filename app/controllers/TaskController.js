const Task = require('../models/Task');

// Referencia al objeto io (debe ser configurada en server.js y pasada al controlador)
let io;
const setSocketInstance = (socketIoInstance) => {
    io = socketIoInstance;
};

const TaskController = {
    getTasks: async () => {
        try {
            return await Task.find();
        } catch (error) {
            throw new Error('Error al obtener las tareas: ' + error.message);
        }
    },
    getTaskById: async (id) => {
        try {
            const task = await Task.findById(id);
            if (!task) {
                throw new Error(`Tarea con ID ${id} no encontrada`);
            }
            return task;
        } catch (error) {
            throw new Error('Error al obtener la tarea: ' + error.message);
        }
    },
    createTask: async (data) => {
        try {
            const task = new Task(data);
            const savedTask = await task.save();
            io.emit('tareaCreada', savedTask); // Emitir evento de creación
            return savedTask;
        } catch (error) {
            throw new Error('Error al crear la tarea: ' + error.message);
        }
    },
    updateTask: async (id, data) => {
        try {
            const task = await Task.findByIdAndUpdate(id, data, { new: true });
            if (!task) {
                throw new Error(`Tarea con ID ${id} no encontrada`);
            }
            io.emit('tareaActualizada', task); // Emitir evento de actualización
            return task;
        } catch (error) {
            throw new Error('Error al actualizar la tarea: ' + error.message);
        }
    },
    deleteTask: async (id) => {
        try {
            const deletedTask = await Task.findByIdAndDelete(id);
            if (!deletedTask) {
                throw new Error(`Tarea con ID ${id} no encontrada`);
            }
            io.emit('tareaEliminada', deletedTask); // Emitir evento de eliminación
            return deletedTask;
        } catch (error) {
            throw new Error('Error al eliminar la tarea: ' + error.message);
        }
    },
};

module.exports = { TaskController, setSocketInstance };
