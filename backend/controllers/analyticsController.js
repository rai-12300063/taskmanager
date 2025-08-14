const LearningProgress = require('../models/LearningProgress');
const LearningSession = require('../models/LearningSession');
const Course = require('../models/Course');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const { getProgressSummary } = require('../utils/progressCalculator');

// Get user dashboard analytics
const getDashboardAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get basic progress summary
        const progressSummary = await getProgressSummary(userId);
        
        // Get recent activity
        const recentSessions = await LearningSession.find({ userId })
            .populate('courseId', 'title')
            .sort({ sessionDate: -1 })
            .limit(5);

        // Get upcoming deadlines
        const enrolledCourses = await LearningProgress.find({ userId })
            .populate('courseId');
        
        const courseIds = enrolledCourses.map(p => p.courseId._id);
        const upcomingAssignments = await Assignment.find({
            courseId: { $in: courseIds },
            dueDate: { $gte: new Date() },
            isActive: true
        })
        .populate('courseId', 'title')
        .sort({ dueDate: 1 })
        .limit(5);

        // Get this week's learning time
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const thisWeekSessions = await LearningSession.find({
            userId,
            sessionDate: { $gte: weekStart }
        });

        const weeklyTime = thisWeekSessions.reduce((total, session) => total + session.duration, 0);

        // Get achievements unlocked this month
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const Achievement = require('../models/Achievement');
        const recentAchievements = await Achievement.find({
            userId,
            unlockedAt: { $gte: monthStart }
        }).limit(3);

        res.json({
            summary: progressSummary,
            recentActivity: recentSessions,
            upcomingDeadlines: upcomingAssignments,
            weeklyLearningTime: weeklyTime,
            recentAchievements,
            streakData: {
                current: req.user.currentStreak,
                longest: req.user.longestStreak
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get detailed learning analytics
const getLearningAnalytics = async (req, res) => {
    try {
        const { period = '30days', courseId } = req.query;
        const userId = req.user.id;

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

        const sessionFilter = { userId, sessionDate: dateFilter };
        if (courseId) sessionFilter.courseId = courseId;

        // Get learning sessions
        const sessions = await LearningSession.find(sessionFilter)
            .populate('courseId', 'title category');

        // Calculate daily breakdown
        const dailyData = {};
        sessions.forEach(session => {
            const date = session.sessionDate.toISOString().split('T')[0];
            if (!dailyData[date]) {
                dailyData[date] = {
                    date,
                    totalTime: 0,
                    sessionCount: 0,
                    courses: new Set()
                };
            }
            dailyData[date].totalTime += session.duration;
            dailyData[date].sessionCount += 1;
            if (session.courseId) {
                dailyData[date].courses.add(session.courseId.title);
            }
        });

        // Convert courses set to array
        Object.values(dailyData).forEach(day => {
            day.courses = Array.from(day.courses);
        });

        // Category breakdown
        const categoryData = {};
        sessions.forEach(session => {
            if (session.courseId && session.courseId.category) {
                const category = session.courseId.category;
                if (!categoryData[category]) {
                    categoryData[category] = { totalTime: 0, sessionCount: 0 };
                }
                categoryData[category].totalTime += session.duration;
                categoryData[category].sessionCount += 1;
            }
        });

        // Performance metrics
        const progressData = await LearningProgress.find({ userId })
            .populate('courseId', 'title category difficulty');

        const performanceMetrics = {
            averageCompletion: 0,
            completionRate: 0,
            totalCoursesEnrolled: progressData.length,
            totalCoursesCompleted: 0,
            averageGrade: 0
        };

        if (progressData.length > 0) {
            const completedCourses = progressData.filter(p => p.isCompleted);
            performanceMetrics.totalCoursesCompleted = completedCourses.length;
            performanceMetrics.completionRate = Math.round((completedCourses.length / progressData.length) * 100);
            performanceMetrics.averageCompletion = Math.round(
                progressData.reduce((sum, p) => sum + p.completionPercentage, 0) / progressData.length
            );

            const gradesAvailable = completedCourses.filter(p => p.grade !== undefined);
            if (gradesAvailable.length > 0) {
                performanceMetrics.averageGrade = Math.round(
                    gradesAvailable.reduce((sum, p) => sum + p.grade, 0) / gradesAvailable.length
                );
            }
        }

        res.json({
            period,
            totalTime: sessions.reduce((sum, s) => sum + s.duration, 0),
            totalSessions: sessions.length,
            dailyBreakdown: Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date)),
            categoryBreakdown: categoryData,
            performanceMetrics,
            courseProgress: progressData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get instructor analytics (instructor/admin only)
const getInstructorAnalytics = async (req, res) => {
    try {
        const instructorId = req.user.id;
        
        // Get instructor's courses
        const courses = await Course.find({ 'instructor.id': instructorId });
        const courseIds = courses.map(c => c._id);

        // Get enrollment data
        const enrollments = await LearningProgress.find({ courseId: { $in: courseIds } })
            .populate('courseId', 'title')
            .populate('userId', 'name email');

        // Get assignment submissions
        const assignments = await Assignment.find({ courseId: { $in: courseIds } });
        const assignmentIds = assignments.map(a => a._id);
        
        const submissions = await Submission.find({ assignmentId: { $in: assignmentIds } })
            .populate('assignmentId', 'title type')
            .populate('userId', 'name email');

        // Calculate course statistics
        const courseStats = courses.map(course => {
            const courseEnrollments = enrollments.filter(e => e.courseId._id.toString() === course._id.toString());
            const courseAssignments = assignments.filter(a => a.courseId.toString() === course._id.toString());
            const courseSubmissions = submissions.filter(s => 
                courseAssignments.some(a => a._id.toString() === s.assignmentId._id.toString())
            );

            return {
                course: {
                    id: course._id,
                    title: course.title,
                    category: course.category,
                    difficulty: course.difficulty
                },
                enrollmentCount: courseEnrollments.length,
                averageProgress: courseEnrollments.length > 0 
                    ? Math.round(courseEnrollments.reduce((sum, e) => sum + e.completionPercentage, 0) / courseEnrollments.length)
                    : 0,
                completionRate: courseEnrollments.length > 0
                    ? Math.round((courseEnrollments.filter(e => e.isCompleted).length / courseEnrollments.length) * 100)
                    : 0,
                assignmentCount: courseAssignments.length,
                submissionCount: courseSubmissions.length,
                averageGrade: courseSubmissions.length > 0
                    ? Math.round(courseSubmissions.reduce((sum, s) => sum + s.percentage, 0) / courseSubmissions.length)
                    : 0
            };
        });

        // Overall instructor stats
        const totalEnrollments = enrollments.length;
        const totalCompletions = enrollments.filter(e => e.isCompleted).length;
        const overallCompletionRate = totalEnrollments > 0 ? Math.round((totalCompletions / totalEnrollments) * 100) : 0;

        res.json({
            summary: {
                totalCourses: courses.length,
                totalEnrollments,
                totalCompletions,
                overallCompletionRate,
                totalAssignments: assignments.length,
                totalSubmissions: submissions.length
            },
            courseStatistics: courseStats,
            recentEnrollments: enrollments
                .sort((a, b) => new Date(b.enrollmentDate) - new Date(a.enrollmentDate))
                .slice(0, 10),
            pendingGrading: submissions
                .filter(s => s.status === 'submitted')
                .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
                .slice(0, 10)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get system-wide analytics (admin only)
const getSystemAnalytics = async (req, res) => {
    try {
        const { period = '30days' } = req.query;
        
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

        // User statistics
        const totalUsers = await User.countDocuments();
        const newUsers = await User.countDocuments({ createdAt: dateFilter });
        const activeUsers = await LearningSession.distinct('userId', { sessionDate: dateFilter });

        // Course statistics
        const totalCourses = await Course.countDocuments({ isActive: true });
        const totalEnrollments = await LearningProgress.countDocuments();
        const totalCompletions = await LearningProgress.countDocuments({ isCompleted: true });

        // Category distribution
        const coursesByCategory = await Course.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        // Learning time statistics
        const totalLearningTime = await LearningSession.aggregate([
            { $match: { sessionDate: dateFilter } },
            { $group: { _id: null, totalTime: { $sum: '$duration' } } }
        ]);

        res.json({
            period,
            userStats: {
                total: totalUsers,
                new: newUsers,
                active: activeUsers.length,
                activePercentage: totalUsers > 0 ? Math.round((activeUsers.length / totalUsers) * 100) : 0
            },
            courseStats: {
                total: totalCourses,
                totalEnrollments,
                totalCompletions,
                completionRate: totalEnrollments > 0 ? Math.round((totalCompletions / totalEnrollments) * 100) : 0
            },
            categoryDistribution: coursesByCategory,
            learningTime: totalLearningTime[0]?.totalTime || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardAnalytics,
    getLearningAnalytics,
    getInstructorAnalytics,
    getSystemAnalytics
};