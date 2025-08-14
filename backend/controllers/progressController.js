const LearningProgress = require('../models/LearningProgress');
const LearningSession = require('../models/LearningSession');
const Course = require('../models/Course');
const User = require('../models/User');

// Get user's progress for a specific course
const getCourseProgress = async (req, res) => {
    try {
        const progress = await LearningProgress.findOne({
            userId: req.user.id,
            courseId: req.params.courseId
        }).populate('courseId', 'title syllabus');

        if (!progress) {
            return res.status(404).json({ message: 'No progress found for this course' });
        }

        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update module completion
const updateModuleProgress = async (req, res) => {
    try {
        const { moduleIndex, timeSpent } = req.body;
        
        const progress = await LearningProgress.findOne({
            userId: req.user.id,
            courseId: req.params.courseId
        });

        if (!progress) {
            return res.status(404).json({ message: 'No enrollment found for this course' });
        }

        // Check if module already completed
        const existingModule = progress.modulesCompleted.find(
            module => module.moduleIndex === moduleIndex
        );

        if (!existingModule) {
            progress.modulesCompleted.push({
                moduleIndex,
                timeSpent: timeSpent || 0
            });
        }

        // Update current module
        progress.currentModule = Math.max(progress.currentModule, moduleIndex + 1);

        // Calculate completion percentage
        const course = await Course.findById(req.params.courseId);
        if (course && course.syllabus) {
            const totalModules = course.syllabus.length;
            progress.completionPercentage = Math.round(
                (progress.modulesCompleted.length / totalModules) * 100
            );
        }

        // Update total time spent
        progress.totalTimeSpent += timeSpent || 0;
        progress.lastAccessDate = new Date();

        // Check if course is completed
        if (progress.completionPercentage >= 100) {
            progress.isCompleted = true;
            progress.completionDate = new Date();
        }

        const updatedProgress = await progress.save();

        // Update user's total learning hours
        const user = await User.findById(req.user.id);
        user.totalLearningHours = Math.round((user.totalLearningHours * 60 + (timeSpent || 0)) / 60);
        await user.save();

        res.json(updatedProgress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add bookmark
const addBookmark = async (req, res) => {
    try {
        const { moduleIndex, topic, note } = req.body;
        
        const progress = await LearningProgress.findOne({
            userId: req.user.id,
            courseId: req.params.courseId
        });

        if (!progress) {
            return res.status(404).json({ message: 'No enrollment found for this course' });
        }

        progress.bookmarks.push({
            moduleIndex,
            topic,
            note
        });

        const updatedProgress = await progress.save();
        res.json(updatedProgress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove bookmark
const removeBookmark = async (req, res) => {
    try {
        const progress = await LearningProgress.findOne({
            userId: req.user.id,
            courseId: req.params.courseId
        });

        if (!progress) {
            return res.status(404).json({ message: 'No enrollment found for this course' });
        }

        progress.bookmarks.id(req.params.bookmarkId).remove();
        const updatedProgress = await progress.save();
        res.json(updatedProgress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Start learning session
const startLearningSession = async (req, res) => {
    try {
        const { moduleIndex, deviceType, userAgent } = req.body;
        
        const session = await LearningSession.create({
            userId: req.user.id,
            courseId: req.params.courseId,
            startTime: new Date(),
            moduleIndex,
            deviceType: deviceType || 'desktop',
            userAgent: userAgent || req.get('User-Agent'),
            ipAddress: req.ip
        });

        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// End learning session
const endLearningSession = async (req, res) => {
    try {
        const { sessionQuality, sessionNotes, activitiesCompleted } = req.body;
        
        const session = await LearningSession.findById(req.params.sessionId);
        
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        if (session.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        session.endTime = new Date();
        session.sessionQuality = sessionQuality;
        session.sessionNotes = sessionNotes;
        session.activitiesCompleted = activitiesCompleted || [];
        session.isActive = false;

        const updatedSession = await session.save();

        // Update learning progress with session time
        if (session.duration > 0) {
            const progress = await LearningProgress.findOne({
                userId: req.user.id,
                courseId: session.courseId
            });

            if (progress) {
                progress.totalTimeSpent += session.duration;
                progress.lastAccessDate = new Date();
                await progress.save();
            }
        }

        res.json(updatedSession);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get learning analytics for user
const getLearningAnalytics = async (req, res) => {
    try {
        const { period = '7days' } = req.query;
        
        let dateFilter = {};
        const now = new Date();
        
        switch (period) {
            case '7days':
                dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
                break;
            case '30days':
                dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
                break;
            case '90days':
                dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
                break;
        }

        // Get learning sessions
        const sessions = await LearningSession.find({
            userId: req.user.id,
            sessionDate: dateFilter
        }).populate('courseId', 'title category');

        // Get progress data
        const progressData = await LearningProgress.find({
            userId: req.user.id
        }).populate('courseId', 'title category difficulty');

        // Calculate analytics
        const totalTimeSpent = sessions.reduce((total, session) => total + session.duration, 0);
        const coursesEnrolled = progressData.length;
        const coursesCompleted = progressData.filter(p => p.isCompleted).length;
        const averageCompletion = progressData.length > 0 
            ? progressData.reduce((sum, p) => sum + p.completionPercentage, 0) / progressData.length 
            : 0;

        // Daily activity data
        const dailyActivity = {};
        sessions.forEach(session => {
            const date = session.sessionDate.toISOString().split('T')[0];
            if (!dailyActivity[date]) {
                dailyActivity[date] = { sessions: 0, totalTime: 0 };
            }
            dailyActivity[date].sessions += 1;
            dailyActivity[date].totalTime += session.duration;
        });

        res.json({
            summary: {
                totalTimeSpent,
                coursesEnrolled,
                coursesCompleted,
                averageCompletion: Math.round(averageCompletion)
            },
            dailyActivity,
            progressData,
            sessions: sessions.slice(0, 10) // Recent 10 sessions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCourseProgress,
    updateModuleProgress,
    addBookmark,
    removeBookmark,
    startLearningSession,
    endLearningSession,
    getLearningAnalytics
};