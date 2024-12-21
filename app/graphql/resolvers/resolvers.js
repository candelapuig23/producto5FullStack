const panelResolver = require('./panelResolver');
const taskResolver = require('./taskResolver');

const resolvers = {
    Query: {
        ...panelResolver.Query,
        ...taskResolver.Query,
    },
    Mutation: {
        ...panelResolver.Mutation,
        ...taskResolver.Mutation,
    },
 
};

module.exports = resolvers;
