const Achievement = require('../models/Achievement');
const LearningProgress = require('../models/LearningProgress');
const LearningSession = require('../models/LearningSession');
const User = require('../models/User');
const { calculateLearningStreak } = require('../utils/progressCalculator');

// Get user's achievements
const getUserAchievements = async (req, res) => {
    try {
        const achievements = await Achievement.find({ 
            userId: req.user.id,
            isVisible: true 
        })
        .populate('courseId', 'title')
        .sort({ unlockedAt: -1 });

        res.json(achievements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Check and award achievements
const checkAndAwardAchievements = async (userId, context = {}) => {
    try {
        const newAchievements = [];

        // Check for first course completion
        if (context.type === 'course_completion') {
            const completedCourses = await LearningProgress.countDocuments({
                userId,
                isCompleted: true
            });

            if (completedCourses === 1) {
                const achievement = await createAchievement(userId, {
                    type: 'first_course',
                    title: 'First Steps',
                    description: 'Completed your first course!',
                    icon: '🎓',
                    courseId: context.courseId,
                    points: 50,
                    rarity: 'common'
                });
                newAchievements.push(achievement);
            }

            // Course completion milestones
            const milestones = [5, 10, 25, 50, 100];
            if (milestones.includes(completedCourses)) {
                const achievement = await createAchievement(userId, {
                    type: 'course_completion',
                    title: `Course Champion ${completedCourses}`,
                    description: `Completed ${completedCourses} courses!`,
                    icon: '🏆',
                    points: completedCourses * 10,
                    rarity: completedCourses >= 50 ? 'legendary' : completedCourses >= 25 ? 'epic' : completedCourses >= 10 ? 'rare' : 'uncommon',
                    criteriaData: { coursesCompleted: completedCourses }
                });
                newAchievements.push(achievement);
            }

            // Grade excellence achievement
            const progress = await LearningProgress.findOne({
                userId,
                courseId: context.courseId
            });

            if (progress && progress.grade >= 95) {
                const achievement = await createAchievement(userId, {
                    type: 'grade_excellence',
                    title: 'Excellence Award',
                    description: 'Achieved 95%+ grade in a course',
                    icon: '⭐',
                    courseId: context.courseId,
                    points: 100,
                    rarity: 'rare',
                    criteriaData: { courseGrade: progress.grade }
                });
                newAchievements.push(achievement);
            }
        }

        // Check learning streak achievements
        if (context.type === 'learning_session') {
            const streakData = await calculateLearningStreak(userId);
            const streakMilestones = [3, 7, 14, 30, 60, 100];
            
            for (const milestone of streakMilestones) {
                if (streakData.currentStreak === milestone) {
                    const achievement = await createAchievement(userId, {
                        type: 'streak',
                        title: `${milestone}-Day Streak`,
                        description: `Maintained a ${milestone}-day learning streak!`,
                        icon: '🔥',
                        points: milestone * 5,
                        rarity: milestone >= 60 ? 'legendary' : milestone >= 30 ? 'epic' : milestone >= 14 ? 'rare' : 'uncommon',
                        criteriaData: { streakDays: milestone }
                    });
                    newAchievements.push(achievement);
                    break; // Only award one streak achievement at a time
                }
            }
        }

        // Check time milestone achievements
        if (context.type === 'time_milestone') {
            const user = await User.findById(userId);
            const timeMilestones = [10, 25, 50, 100, 250, 500, 1000]; // hours
            
            for (const milestone of timeMilestones) {
                if (user.totalLearningHours >= milestone) {
                    const existingAchievement = await Achievement.findOne({
                        userId,
                        type: 'time_milestone',
                        'criteriaData.hoursLearned': milestone
                    });

                    if (!existingAchievement) {
                        const achievement = await createAchievement(userId, {
                            type: 'time_milestone',
                            title: `${milestone}-Hour Scholar`,
                            description: `Completed ${milestone} hours of learning!`,
                            icon: '⏰',
                            points: milestone * 2,
                            rarity: milestone >= 500 ? 'legendary' : milestone >= 250 ? 'epic' : milestone >= 100 ? 'rare' : 'uncommon',
                            criteriaData: { hoursLearned: milestone }
                        });
                        newAchievements.push(achievement);
                    }
                }
            }
        }

        // Check skill mastery achievements
        if (context.type === 'skill_mastery' && context.skillName) {
            const achievement = await createAchievement(userId, {
                type: 'skill_mastery',
                title: `${context.skillName} Master`,
                description: `Mastered the skill: ${context.skillName}`,
                icon: '🎯',
                points: 75,
                rarity: 'rare',
                criteriaData: { skillName: context.skillName }
            });
            newAchievements.push(achievement);
        }

        return newAchievements;
    } catch (error) {
        console.error('Error checking achievements:', error);
        return [];
    }
};

// Create achievement helper
const createAchievement = async (userId, achievementData) => {
    try {
        // Check if achievement already exists (prevent duplicates)
        const existingAchievement = await Achievement.findOne({
            userId,
            type: achievementData.type,
            courseId: achievementData.courseId || null,
            'criteriaData.streakDays': achievementData.criteriaData?.streakDays,
            'criteriaData.hoursLearned': achievementData.criteriaData?.hoursLearned,
            'criteriaData.coursesCompleted': achievementData.criteriaData?.coursesCompleted
        });

        if (existingAchievement) {
            return null; // Achievement already exists
        }

        const achievement = await Achievement.create({
            userId,
            type: achievementData.type,
            title: achievementData.title,
            description: achievementData.description,
            icon: achievementData.icon,
            courseId: achievementData.courseId,
            criteriaData: achievementData.criteriaData || {},
            rarity: achievementData.rarity || 'common',
            points: achievementData.points || 0,
            shareUrl: `/achievements/${achievementData.type}/${userId}`
        });

        return achievement;
    } catch (error) {
        console.error('Error creating achievement:', error);
        return null;
    }
};

// Generate certificate
const generateCertificate = async (req, res) => {
    try {
        const { courseId } = req.params;
        
        const progress = await LearningProgress.findOne({
            userId: req.user.id,
            courseId,
            isCompleted: true
        }).populate('courseId');

        if (!progress) {
            return res.status(404).json({ message: 'Course not completed or not found' });
        }

        if (progress.certificateIssued) {
            return res.status(400).json({ message: 'Certificate already issued' });
        }

        // Generate certificate ID and verification code
        const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const verificationCode = Math.random().toString(36).substr(2, 12).toUpperCase();

        // Create achievement with certificate
        const achievement = await Achievement.create({
            userId: req.user.id,
            type: 'course_completion',
            title: `Certificate: ${progress.courseId.title}`,
            description: `Successfully completed ${progress.courseId.title}`,
            icon: '📜',
            courseId,
            certificate: {
                certificateId,
                certificateUrl: `/api/certificates/${certificateId}`,
                issueDate: new Date(),
                verificationCode
            },
            rarity: 'uncommon',
            points: 100
        });

        // Update progress record
        progress.certificateIssued = true;
        progress.certificateId = certificateId;
        await progress.save();

        res.json({
            message: 'Certificate generated successfully',
            achievement,
            certificateId,
            verificationCode,
            downloadUrl: `/api/certificates/${certificateId}/download`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Verify certificate
const verifyCertificate = async (req, res) => {
    try {
        const { certificateId, verificationCode } = req.query;

        const achievement = await Achievement.findOne({
            'certificate.certificateId': certificateId,
            'certificate.verificationCode': verificationCode
        })
        .populate('userId', 'name email')
        .populate('courseId', 'title instructor');

        if (!achievement) {
            return res.status(404).json({ message: 'Certificate not found or invalid verification code' });
        }

        res.json({
            valid: true,
            certificate: {
                id: achievement.certificate.certificateId,
                student: {
                    name: achievement.userId.name,
                    email: achievement.userId.email
                },
                course: {
                    title: achievement.courseId.title,
                    instructor: achievement.courseId.instructor.name
                },
                issueDate: achievement.certificate.issueDate,
                verificationCode: achievement.certificate.verificationCode
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Share achievement
const shareAchievement = async (req, res) => {
    try {
        const achievement = await Achievement.findById(req.params.id);
        
        if (!achievement) {
            return res.status(404).json({ message: 'Achievement not found' });
        }

        if (achievement.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        achievement.sharedAt = new Date();
        await achievement.save();

        res.json({
            message: 'Achievement shared successfully',
            shareUrl: achievement.shareUrl
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get achievement leaderboard
const getLeaderboard = async (req, res) => {
    try {
        const { type = 'points', period = 'all' } = req.query;
        
        let matchCondition = {};
        if (period !== 'all') {
            const now = new Date();
            let dateFilter;
            
            switch (period) {
                case 'week':
                    dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
            }
            
            if (dateFilter) {
                matchCondition.unlockedAt = { $gte: dateFilter };
            }
        }

        let aggregation = [];
        
        if (type === 'points') {
            aggregation = [
                { $match: matchCondition },
                { $group: { _id: '$userId', totalPoints: { $sum: '$points' } } },
                { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
                { $unwind: '$user' },
                { $project: { 
                    userId: '$_id', 
                    name: '$user.name', 
                    totalPoints: 1,
                    totalLearningHours: '$user.totalLearningHours',
                    currentStreak: '$user.currentStreak'
                }},
                { $sort: { totalPoints: -1 } },
                { $limit: 20 }
            ];
        } else if (type === 'streak') {
            // Get users sorted by current streak
            const users = await User.find({}, 'name currentStreak totalLearningHours')
                .sort({ currentStreak: -1 })
                .limit(20);
            
            return res.json(users.map(user => ({
                userId: user._id,
                name: user.name,
                currentStreak: user.currentStreak,
                totalLearningHours: user.totalLearningHours
            })));
        }

        const results = await Achievement.aggregate(aggregation);
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUserAchievements,
    checkAndAwardAchievements,
    generateCertificate,
    verifyCertificate,
    shareAchievement,
    getLeaderboard
};