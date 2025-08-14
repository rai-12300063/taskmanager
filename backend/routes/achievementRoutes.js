const express = require('express');
const {
    getUserAchievements,
    generateCertificate,
    verifyCertificate,
    shareAchievement,
    getLeaderboard
} = require('../controllers/achievementController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/verify', verifyCertificate);
router.get('/leaderboard', getLeaderboard);

// Protected routes
router.use(protect);

// User achievement routes
router.get('/my', getUserAchievements);
router.post('/:id/share', shareAchievement);

// Certificate routes
router.post('/certificates/course/:courseId', generateCertificate);

module.exports = router;