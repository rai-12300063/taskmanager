const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attemptNumber: { type: Number, required: true, default: 1 },
    status: { type: String, enum: ['draft', 'submitted', 'graded'], default: 'draft' },
    submittedAt: { type: Date },
    gradedAt: { type: Date },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    // For quiz submissions
    answers: [{
        questionIndex: { type: Number, required: true },
        answer: { type: String },
        isCorrect: { type: Boolean },
        pointsEarned: { type: Number, default: 0 }
    }],
    
    // For assignment submissions
    content: { type: String },
    attachments: [{
        filename: { type: String, required: true },
        url: { type: String, required: true },
        fileType: { type: String },
        uploadedAt: { type: Date, default: Date.now }
    }],
    
    // Grading information
    score: { type: Number, default: 0 },
    maxScore: { type: Number, required: true },
    percentage: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    feedback: { type: String },
    rubricScores: [{
        criterion: { type: String, required: true },
        pointsEarned: { type: Number, required: true },
        maxPoints: { type: Number, required: true },
        feedback: { type: String }
    }],
    
    // Timing
    timeSpent: { type: Number, default: 0 }, // in minutes
    startedAt: { type: Date, default: Date.now },
    
    // Auto-save for drafts
    lastSaved: { type: Date, default: Date.now }
}, { timestamps: true });

// Compound index for user submissions
submissionSchema.index({ userId: 1, assignmentId: 1, attemptNumber: 1 }, { unique: true });

// Update percentage when score changes
submissionSchema.pre('save', function(next) {
    if (this.maxScore > 0) {
        this.percentage = Math.round((this.score / this.maxScore) * 100);
    }
    next();
});

module.exports = mongoose.model('Submission', submissionSchema);