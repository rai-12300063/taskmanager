const express = require('express');
const {
    getCourseAssignments,
    getAssignment,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    submitAssignment,
    getAssignmentSubmissions,
    gradeSubmission,
    getUserSubmissions
} = require('../controllers/assignmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles, checkCourseOwnership } = require('../middleware/roleMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Assignment management routes
router.get('/course/:courseId', getCourseAssignments);
router.get('/:id', getAssignment);
router.post('/', authorizeRoles('instructor', 'admin'), createAssignment);
router.put('/:id', authorizeRoles('instructor', 'admin'), updateAssignment);
router.delete('/:id', authorizeRoles('admin'), deleteAssignment);

// Student submission routes
router.post('/:id/submit', submitAssignment);
router.get('/:id/submissions/my', getUserSubmissions);

// Instructor grading routes
router.get('/:id/submissions', authorizeRoles('instructor', 'admin'), getAssignmentSubmissions);
router.put('/submissions/:submissionId/grade', authorizeRoles('instructor', 'admin'), gradeSubmission);

module.exports = router;