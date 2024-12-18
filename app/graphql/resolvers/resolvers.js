const Task = require('../../models/Task');
const Panel = require('../../models/Panel');

const taskResolver = require('./taskResolver'); // Asegúrate de la ruta correcta
const panelResolver = require('./panelResolver');

const resolvers = {
    Query: {
        ...panelResolver.Query,
        ...taskResolver.Query, // Asume que taskResolver tiene definidas sus queries
    },
    Mutation: {
        ...panelResolver.Mutation,
        ...taskResolver.Mutation, // Asume que taskResolver tiene definidas sus mutations
    },
    Panel: panelResolver.Panel // Esto debería funcionar ahora
};

module.exports = resolvers;
