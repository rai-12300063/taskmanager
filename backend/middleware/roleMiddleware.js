const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}` 
            });
        }

        next();
    };
};

const checkCourseOwnership = async (req, res, next) => {
    try {
        const Course = require('../models/Course');
        const course = await Course.findById(req.params.id || req.params.courseId);
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Allow admin or course instructor
        if (req.user.role === 'admin' || course.instructor.id.toString() === req.user.id) {
            req.course = course;
            return next();
        }

        return res.status(403).json({ message: 'Not authorized to access this course' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    authorizeRoles,
    checkCourseOwnership
};