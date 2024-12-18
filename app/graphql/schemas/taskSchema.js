const { gql } = require('apollo-server-express');

const taskSchema = gql`
    type Task {
        id: ID!
        title: String!
        description: String
        completed: Boolean
        responsible: String
        createdAt: String
        updatedAt: String
        panelId: ID!
        status: String! # Campo obligatorio para el estado
        files: [String] # Lista de archivos asociados

    }

    extend type Query {
        getTasks: [Task] # Obtener todas las tareas
        getTask(id: ID!): Task # Obtener una tarea por ID
    }

    extend type Mutation {
        createTask(
            title: String!,
            description: String,
            panelId: ID!,
            responsible: String!,
            status: String! # Estado obligatorio
        ): Task

        updateTask(
            id: ID!,
            title: String,
            description: String,
            completed: Boolean,
            responsible: String,
            status: String
            files: [String] # para actualizar archivos
        ): Task

        deleteTask(id: ID!): Task

        # Nueva mutación para agregar un archivo a una tarea
        addFileToTask(
            taskId: ID!,
            fileName: String!
        ): Task
    }
`;

module.exports = taskSchema;
