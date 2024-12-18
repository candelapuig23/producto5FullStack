const { gql } = require('apollo-server-express');

const panelSchema = gql`
    type Panel {
        id: ID!
        name: String!
        description: String
        createdAt: String
        updatedAt: String
        tasks: [Task]
    }

    extend type Query {
        getPanels: [Panel]
        getPanel(id: ID!): Panel
    }

    extend type Mutation {
        createPanel(name: String!, description: String): Panel
        updatePanel(id: ID!, name: String, description: String): Panel
        deletePanel(id: ID!): Panel
    }
`;

module.exports = panelSchema;
