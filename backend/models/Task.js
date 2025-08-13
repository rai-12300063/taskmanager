
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    deadline: { type: Date },
    // Learning Progress Tracker specific fields
    category: { type: String, default: 'General' }, // e.g., 'Programming', 'Math', 'Science'
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    progress: { type: Number, min: 0, max: 100, default: 0 }, // Progress percentage
    timeSpent: { type: Number, default: 0 }, // Time spent in minutes
    estimatedTime: { type: Number, default: 60 }, // Estimated time in minutes
    resources: [{ type: String }], // Links to learning resources
    notes: { type: String }, // Personal learning notes
    skillsLearned: [{ type: String }], // Array of skills acquired
    createdAt: { type: Date, default: Date.now },
    lastStudied: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);
