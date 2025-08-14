const express = require('express');
const {
    getCourseProgress,
    updateModuleProgress,
    addBookmark,
    removeBookmark,
    startLearningSession,
    endLearningSession,
    getLearningAnalytics
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Progress tracking routes
router.get('/course/:courseId', getCourseProgress);
router.put('/course/:courseId/module', updateModuleProgress);

// Bookmark routes
router.post('/course/:courseId/bookmark', addBookmark);
router.delete('/course/:courseId/bookmark/:bookmarkId', removeBookmark);

// Learning session routes
router.post('/course/:courseId/session/start', startLearningSession);
router.put('/session/:sessionId/end', endLearningSession);

// Analytics routes
router.get('/analytics', getLearningAnalytics);

module.exports = router;