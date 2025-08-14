const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['quiz', 'assignment', 'project'], required: true },
    moduleIndex: { type: Number, required: true },
    dueDate: { type: Date },
    maxAttempts: { type: Number, default: 1 },
    timeLimit: { type: Number }, // in minutes
    totalPoints: { type: Number, required: true },
    passingScore: { type: Number, required: true }, // percentage
    instructions: { type: String },
    attachments: [{
        filename: { type: String, required: true },
        url: { type: String, required: true },
        fileType: { type: String }
    }],
    // For quizzes
    questions: [{
        question: { type: String, required: true },
        type: { type: String, enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'], required: true },
        options: [{ type: String }], // for multiple choice
        correctAnswer: { type: String }, // for auto-graded questions
        points: { type: Number, required: true },
        explanation: { type: String }
    }],
    // For assignments/projects
    rubric: [{
        criterion: { type: String, required: true },
        maxPoints: { type: Number, required: true },
        description: { type: String }
    }],
    isActive: { type: Boolean, default: true },
    autoGrade: { type: Boolean, default: false },
    showCorrectAnswers: { type: Boolean, default: true },
    shuffleQuestions: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);