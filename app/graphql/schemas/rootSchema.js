const { gql } = require('apollo-server-express');
const panelSchema = require('./panelSchema');
const taskSchema = require('./taskSchema');


const rootSchema = gql`
    type Query {
        _empty: String
    }

    type Mutation {
        _empty: String
    }

        # Fusionamos los tipos de Panel y Task
    ${panelSchema}
    ${taskSchema}

`;

module.exports = rootSchema;
