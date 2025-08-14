const express = require('express');
const {
    getDashboardAnalytics,
    getLearningAnalytics,
    getInstructorAnalytics,
    getSystemAnalytics
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Student analytics routes
router.get('/dashboard', getDashboardAnalytics);
router.get('/learning', getLearningAnalytics);

// Instructor analytics routes
router.get('/instructor', authorizeRoles('instructor', 'admin'), getInstructorAnalytics);

// Admin analytics routes
router.get('/system', authorizeRoles('admin'), getSystemAnalytics);

module.exports = router;