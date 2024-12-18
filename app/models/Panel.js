// models/Panel.js
const mongoose = require('mongoose');

const panelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }]
}, {
    timestamps: true // Esto activa createdAt y updatedAt automáticamente
});

module.exports = mongoose.model('Panel', panelSchema);
