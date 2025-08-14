const LearningProgress = require('../models/LearningProgress');
const LearningSession = require('../models/LearningSession');
const User = require('../models/User');

/**
 * Calculate completion percentage for a course
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @param {Object} courseData - Course data with syllabus
 * @returns {number} Completion percentage (0-100)
 */
const calculateCompletionPercentage = (modulesCompleted, totalModules) => {
    if (totalModules === 0) return 0;
    return Math.round((modulesCompleted.length / totalModules) * 100);
};

/**
 * Calculate learning streak for a user
 * @param {string} userId - User ID
 * @returns {Object} Streak information
 */
const calculateLearningStreak = async (userId) => {
    try {
        const sessions = await LearningSession.find({
            userId,
            duration: { $gt: 0 } // Only count sessions with actual learning time
        }).sort({ sessionDate: -1 });

        if (sessions.length === 0) {
            return { currentStreak: 0, longestStreak: 0 };
        }

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get unique learning dates
        const learningDates = [...new Set(sessions.map(session => {
            const date = new Date(session.sessionDate);
            date.setHours(0, 0, 0, 0);
            return date.getTime();
        }))].sort((a, b) => b - a);

        // Calculate current streak
        let expectedDate = today.getTime();
        for (const dateTime of learningDates) {
            if (dateTime === expectedDate || dateTime === expectedDate - 24 * 60 * 60 * 1000) {
                currentStreak++;
                expectedDate = dateTime - 24 * 60 * 60 * 1000;
            } else {
                break;
            }
        }

        // Calculate longest streak
        tempStreak = 1;
        for (let i = 1; i < learningDates.length; i++) {
            const currentDate = learningDates[i];
            const previousDate = learningDates[i - 1];
            
            if (previousDate - currentDate === 24 * 60 * 60 * 1000) {
                tempStreak++;
            } else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 1;
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak);

        return { currentStreak, longestStreak };
    } catch (error) {
        console.error('Error calculating learning streak:', error);
        return { currentStreak: 0, longestStreak: 0 };
    }
};

/**
 * Calculate total learning time for a user
 * @param {string} userId - User ID
 * @param {string} period - Time period ('week', 'month', 'all')
 * @returns {number} Total learning time in minutes
 */
const calculateLearningTime = async (userId, period = 'all') => {
    try {
        let dateFilter = {};
        const now = new Date();
        
        switch (period) {
            case 'week':
                dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
                break;
            case 'month':
                dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
                break;
            case 'year':
                dateFilter = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
                break;
        }

        const filter = { userId };
        if (Object.keys(dateFilter).length > 0) {
            filter.sessionDate = dateFilter;
        }

        const sessions = await LearningSession.find(filter);
        return sessions.reduce((total, session) => total + session.duration, 0);
    } catch (error) {
        console.error('Error calculating learning time:', error);
        return 0;
    }
};

/**
 * Update user learning statistics
 * @param {string} userId - User ID
 */
const updateUserLearningStats = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        // Calculate total learning hours
        const totalMinutes = await calculateLearningTime(userId, 'all');
        user.totalLearningHours = Math.round(totalMinutes / 60);

        // Calculate streaks
        const streakData = await calculateLearningStreak(userId);
        user.currentStreak = streakData.currentStreak;
        user.longestStreak = streakData.longestStreak;

        // Update last learning date
        const latestSession = await LearningSession.findOne({ userId })
            .sort({ sessionDate: -1 });
        if (latestSession) {
            user.lastLearningDate = latestSession.sessionDate;
        }

        await user.save();
    } catch (error) {
        console.error('Error updating user learning stats:', error);
    }
};

/**
 * Get learning progress summary for a user
 * @param {string} userId - User ID
 * @returns {Object} Progress summary
 */
const getProgressSummary = async (userId) => {
    try {
        const progressRecords = await LearningProgress.find({ userId })
            .populate('courseId', 'title category difficulty');

        const summary = {
            totalCourses: progressRecords.length,
            completedCourses: progressRecords.filter(p => p.isCompleted).length,
            inProgressCourses: progressRecords.filter(p => !p.isCompleted && p.completionPercentage > 0).length,
            averageCompletion: 0,
            totalTimeSpent: 0,
            categoriesStudied: new Set(),
            difficultyLevels: {
                beginner: 0,
                intermediate: 0,
                advanced: 0
            }
        };

        if (progressRecords.length > 0) {
            summary.averageCompletion = Math.round(
                progressRecords.reduce((sum, p) => sum + p.completionPercentage, 0) / progressRecords.length
            );
            summary.totalTimeSpent = progressRecords.reduce((sum, p) => sum + p.totalTimeSpent, 0);

            progressRecords.forEach(progress => {
                if (progress.courseId) {
                    summary.categoriesStudied.add(progress.courseId.category);
                    const difficulty = progress.courseId.difficulty.toLowerCase();
                    if (summary.difficultyLevels[difficulty] !== undefined) {
                        summary.difficultyLevels[difficulty]++;
                    }
                }
            });
        }

        summary.categoriesStudied = Array.from(summary.categoriesStudied);

        return summary;
    } catch (error) {
        console.error('Error getting progress summary:', error);
        return null;
    }
};

module.exports = {
    calculateCompletionPercentage,
    calculateLearningStreak,
    calculateLearningTime,
    updateUserLearningStats,
    getProgressSummary
};