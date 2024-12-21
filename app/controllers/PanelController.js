const Panel = require('../models/Panel');
const Task = require('../models/Task');

let io;
const setSocketInstance = (socketIoInstance) => {
    io = socketIoInstance;
};

const PanelController = {
    getPanels: async () => {
        try {
            return await Panel.find().populate('tasks');
        } catch (error) {
            throw new Error('Error al obtener los paneles: ' + error.message);
        }
    },
    createPanel: async (data) => {
        try {
            const panel = new Panel(data);
            const savedPanel = await panel.save();
            io.emit('actualizarPaneles'); // Emitir evento
            return savedPanel;
        } catch (error) {
            throw new Error('Error al crear el panel: ' + error.message);
        }
    },
    updatePanel: async (id, data) => {
        try {
            const panel = await Panel.findByIdAndUpdate(id, data, { new: true });
            if (!panel) throw new Error(`Panel con ID ${id} no encontrado`);
            io.emit('actualizarPaneles'); // Emitir evento
            return panel;
        } catch (error) {
            throw new Error('Error al actualizar el panel: ' + error.message);
        }
    },
    deletePanel: async (id) => {
        try {
            await Task.deleteMany({ panelId: id }); // Eliminar tareas asociadas
            const deletedPanel = await Panel.findByIdAndDelete(id);
            if (!deletedPanel) throw new Error(`Panel con ID ${id} no encontrado`);
            io.emit('actualizarPaneles'); // Emitir evento
            return deletedPanel;
        } catch (error) {
            throw new Error('Error al eliminar el panel: ' + error.message);
        }
    },
};

module.exports = { PanelController, setSocketInstance };
