const path = require('path');
const Task = require(path.resolve(__dirname, '../../models/Task.js')); // Modelo Task
const Panel = require(path.resolve(__dirname, '../../models/Panel.js')); // Modelo Panel

const taskResolver = {
    Query: {
        // Obtener todas las tareas
        getTasks: async () => {
            try {
                const tasks = await Task.find();
                return tasks.map(task => ({
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    completed: task.completed,
                    responsible: task.responsible,
                    createdAt: task.createdAt.toISOString(),
                    updatedAt: task.updatedAt.toISOString(),
                    panelId: task.panelId,
                    status: task.status, // Devuelve el estado
                    files: task.files, // Devuelve los archivos adjuntos
                }));
            } catch (error) {
                console.error("Error fetching tasks:", error);
                throw new Error("Error fetching tasks");
            }
        },

        // Obtener una tarea por ID
        getTask: async (_, { id }) => {
            try {
                const task = await Task.findById(id);
                if (!task) throw new Error(`Task with ID ${id} not found`);
                return {
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    completed: task.completed,
                    responsible: task.responsible,
                    createdAt: task.createdAt.toISOString(),
                    updatedAt: task.updatedAt.toISOString(),
                    panelId: task.panelId,
                    status: task.status, // Devuelve el estado
                    files: task.files, // Devuelve los archivos adjuntos
                };
            } catch (error) {
                console.error("Error fetching task:", error);
                throw new Error("Error fetching task");
            }
        }
    },

    Mutation: {
        // Crear una tarea
        createTask: async (_, { title, description, panelId, responsible, status }) => {
            try {
                // Validación del estado
                const validStatuses = ['por_hacer', 'en_proceso', 'finalizado'];
                if (!validStatuses.includes(status)) {
                    throw new Error(`Invalid status: ${status}`);
                }

                const newTask = new Task({ title, description, panelId, responsible, status });
                await newTask.save();

                await Panel.findByIdAndUpdate(panelId, { $push: { tasks: newTask._id } });

                return {
                    id: newTask.id,
                    title: newTask.title,
                    description: newTask.description,
                    completed: newTask.completed,
                    responsible: newTask.responsible,
                    createdAt: newTask.createdAt.toISOString(),
                    updatedAt: newTask.updatedAt.toISOString(),
                    panelId: newTask.panelId,
                    status: newTask.status,
                    files: newTask.files, // Devuelve los archivos adjuntos
                };
            } catch (error) {
                console.error("Error creating task:", error);
                throw new Error("Error creating task");
            }
        },

        // Actualizar una tarea
        updateTask: async (_, { id, title, description, completed, responsible, status, files }) => {
            try {
                const updateData = {};
                if (title) updateData.title = title;
                if (description) updateData.description = description;
                if (typeof completed !== 'undefined') updateData.completed = completed;
                if (responsible) updateData.responsible = responsible;
                if (status) updateData.status = status;
                if (files) updateData.files = files;

                const updatedTask = await Task.findByIdAndUpdate(id, updateData, { new: true });
                if (!updatedTask) throw new Error(`Task with ID ${id} not found`);

                return {
                    id: updatedTask.id,
                    title: updatedTask.title,
                    description: updatedTask.description,
                    completed: updatedTask.completed,
                    responsible: updatedTask.responsible,
                    createdAt: updatedTask.createdAt.toISOString(),
                    updatedAt: updatedTask.updatedAt.toISOString(),
                    panelId: updatedTask.panelId,
                    status: updatedTask.status,
                    files: updatedTask.files, // Devuelve los archivos adjuntos
                };
            } catch (error) {
                console.error("Error updating task:", error);
                throw new Error("Error updating task");
            }
        },

        // Agregar un archivo a una tarea
        addFileToTask: async (_, { taskId, fileName }) => {
            try {
                const task = await Task.findById(taskId);
                if (!task) throw new Error(`Task with ID ${taskId} not found`);

                task.files.push(fileName);
                await task.save();

                return {
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    completed: task.completed,
                    responsible: task.responsible,
                    createdAt: task.createdAt.toISOString(),
                    updatedAt: task.updatedAt.toISOString(),
                    panelId: task.panelId,
                    status: task.status,
                    files: task.files, // Devuelve los archivos adjuntos
                };
            } catch (error) {
                console.error("Error adding file to task:", error);
                throw new Error("Error adding file to task");
            }
        },

        // Eliminar una tarea
        deleteTask: async (_, { id }) => {
            try {
                const deletedTask = await Task.findByIdAndDelete(id);
                if (!deletedTask) throw new Error(`Task with ID ${id} not found`);
                return {
                    id: deletedTask.id,
                    title: deletedTask.title,
                    description: deletedTask.description,
                };
            } catch (error) {
                console.error("Error deleting task:", error);
                throw new Error("Error deleting task");
            }
        }
    }
};

module.exports = taskResolver;
