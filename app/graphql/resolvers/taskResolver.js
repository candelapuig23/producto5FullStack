
const TaskController = require('../controllers/TaskController');

const taskResolver = {
    Query: {
        getTasks: async () => await TaskController.getTasks(),
        getTask: async (_, { id }) => await TaskController.getTaskById(id),
    },
    Mutation: {
        createTask: async (_, { title, description, panelId, responsible, status }) => 
            await TaskController.createTask({ title, description, panelId, responsible, status }),
        updateTask: async (_, { id, title, description, completed, responsible, status, files }) => 
            await TaskController.updateTask(id, { title, description, completed, responsible, status, files }),
        deleteTask: async (_, { id }) => await TaskController.deleteTask(id),
        addFileToTask: async (_, { taskId, fileName }) => await TaskController.addFileToTask(taskId, fileName),
    },
};

module.exports = taskResolver;
