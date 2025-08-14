const mongoose = require('mongoose');

const learningSessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    sessionDate: { type: Date, default: Date.now },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    duration: { type: Number, default: 0 }, // in minutes
    moduleIndex: { type: Number },
    activitiesCompleted: [{
        type: { type: String, enum: ['reading', 'video', 'quiz', 'assignment', 'discussion'], required: true },
        name: { type: String, required: true },
        timeSpent: { type: Number, required: true }, // in minutes
        completed: { type: Boolean, default: false }
    }],
    notesAdded: { type: Number, default: 0 },
    bookmarksAdded: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    sessionQuality: { type: String, enum: ['poor', 'fair', 'good', 'excellent'] },
    sessionNotes: { type: String },
    deviceType: { type: String, enum: ['desktop', 'tablet', 'mobile'], default: 'desktop' },
    ipAddress: { type: String },
    userAgent: { type: String }
}, { timestamps: true });

// Index for efficient querying
learningSessionSchema.index({ userId: 1, sessionDate: -1 });
learningSessionSchema.index({ courseId: 1, sessionDate: -1 });

// Calculate duration before saving
learningSessionSchema.pre('save', function(next) {
    if (this.endTime && this.startTime) {
        this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60)); // minutes
    }
    next();
});

module.exports = mongoose.model('LearningSession', learningSessionSchema);