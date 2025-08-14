const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
        type: String, 
        enum: ['course_completion', 'streak', 'time_milestone', 'grade_excellence', 'first_course', 'skill_mastery'], 
        required: true 
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String }, // icon name or URL
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, // for course-related achievements
    
    // Achievement criteria met
    criteriaData: {
        streakDays: { type: Number },
        hoursLearned: { type: Number },
        courseGrade: { type: Number },
        skillName: { type: String },
        coursesCompleted: { type: Number }
    },
    
    unlockedAt: { type: Date, default: Date.now },
    isVisible: { type: Boolean, default: true },
    
    // Certificate information (for course completions)
    certificate: {
        certificateId: { type: String },
        certificateUrl: { type: String },
        issueDate: { type: Date },
        expiryDate: { type: Date },
        verificationCode: { type: String }
    },
    
    // Achievement metadata
    rarity: { type: String, enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'], default: 'common' },
    points: { type: Number, default: 0 }, // gamification points
    shareUrl: { type: String },
    sharedAt: { type: Date }
}, { timestamps: true });

// Ensure unique achievements per user per type per course
achievementSchema.index({ userId: 1, type: 1, courseId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Achievement', achievementSchema);