const path = require('path');
const Panel = require(path.resolve(__dirname, '../../models/Panel.js'));
const Task = require(path.resolve(__dirname, '../../models/Task.js')); // Importar Task para acceder a sus métodos

const panelResolver = {
    Query: {
        getPanels: async () => await Panel.find().populate('tasks'),
        getPanel: async (_, { id }) => await Panel.findById(id).populate('tasks')
    },
    Mutation: {
        createPanel: async (_, { name, description }) => {
            const newPanel = new Panel({ name, description });
            return await newPanel.save();
        },
        updatePanel: async (_, { id, name, description }) => {
            const updateData = {};
            if (name) updateData.name = name;
            if (description) updateData.description = description;

            return await Panel.findByIdAndUpdate(id, updateData, { new: true });
        },
        deletePanel: async (_, { id }) => {
            try {
                console.log(`Intentando eliminar el panel con ID: ${id}`);
                
                // Primero, verificamos cuántas tareas hay antes de la eliminación
                const tasksBeforeDeletion = await Task.find({ panelId: id });
                console.log(`Tareas encontradas para el panel ${id} antes de la eliminación:`, tasksBeforeDeletion);
        
                // Eliminamos todas las tareas asociadas al panel
                const deleteTasksResult = await Task.deleteMany({ panelId: id });
                console.log(`Resultado de la eliminación de tareas para el panel ${id}:`, deleteTasksResult);
                
                if (deleteTasksResult.deletedCount === 0) {
                    console.warn(`No se encontraron tareas asociadas al panel ${id}.`);
                } else {
                    console.log(`Se eliminaron ${deleteTasksResult.deletedCount} tareas asociadas al panel ${id}.`);
                }
        
                // Luego, eliminamos el propio panel
                const deletedPanel = await Panel.findByIdAndDelete(id);
                if (!deletedPanel) throw new Error(`Panel con ID ${id} no encontrado`);
                console.log(`Panel eliminado con éxito:`, deletedPanel);
                
                return deletedPanel;
            } catch (error) {
                console.error("Error eliminando el panel y sus tareas:", error);
                throw new Error("Error eliminando el panel y sus tareas");
            }
        }
    },
    Panel: {
        tasks: async (panel) => await Task.find({ panelId: panel._id }) // Resolver para obtener las tareas
    }
};

module.exports = panelResolver;
