const express = require('express');
const {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollInCourse,
    getEnrolledCourses
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles, checkCourseOwnership } = require('../middleware/roleMiddleware');

const router = express.Router();

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourse);

// Protected routes
router.post('/', protect, authorizeRoles('instructor', 'admin'), createCourse);
router.put('/:id', protect, checkCourseOwnership, updateCourse);
router.delete('/:id', protect, authorizeRoles('admin'), deleteCourse);

// Student enrollment routes
router.post('/:id/enroll', protect, enrollInCourse);
router.get('/enrolled/my', protect, getEnrolledCourses);

module.exports = router;