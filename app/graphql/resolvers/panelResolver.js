
const  PanelController  = require('../../controllers/PanelController');



const panelResolver = {
    Query: {
        getPanels: async () => await PanelController.getPanels(),
        getPanel: async (_, { id }) => await PanelController.getPanelById(id),
    },
    Mutation: {
        createPanel: async (_, { name, description }) => await PanelController.createPanel({ name, description }),
        updatePanel: async (_, { id, name, description }) => await PanelController.updatePanel(id, { name, description }),
        deletePanel: async (_, { id }) => await PanelController.deletePanel(id),
    },
    Panel: {
        tasks: async (panel) => await PanelController.getTasksForPanel(panel._id),
    },
};

module.exports = panelResolver;
