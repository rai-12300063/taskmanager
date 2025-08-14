const Course = require('../models/Course');
const LearningProgress = require('../models/LearningProgress');

// Get all courses with pagination and filtering
const getCourses = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            category, 
            difficulty, 
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const filter = { isActive: true };
        
        if (category) filter.category = category;
        if (difficulty) filter.difficulty = difficulty;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const courses = await Course.find(filter)
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('instructor.id', 'name email');

        const total = await Course.countDocuments(filter);

        res.json({
            courses,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single course by ID
const getCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor.id', 'name email');
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new course (instructor/admin only)
const createCourse = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            difficulty,
            duration,
            estimatedCompletionTime,
            prerequisites,
            learningObjectives,
            syllabus
        } = req.body;

        const course = await Course.create({
            title,
            description,
            category,
            difficulty,
            instructor: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email
            },
            duration,
            estimatedCompletionTime,
            prerequisites: prerequisites || [],
            learningObjectives: learningObjectives || [],
            syllabus: syllabus || []
        });

        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update course (instructor/admin only)
const updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if user is instructor or admin
        if (course.instructor.id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this course' });
        }

        const {
            title,
            description,
            category,
            difficulty,
            duration,
            estimatedCompletionTime,
            prerequisites,
            learningObjectives,
            syllabus,
            isActive
        } = req.body;

        course.title = title || course.title;
        course.description = description || course.description;
        course.category = category || course.category;
        course.difficulty = difficulty || course.difficulty;
        course.duration = duration || course.duration;
        course.estimatedCompletionTime = estimatedCompletionTime || course.estimatedCompletionTime;
        course.prerequisites = prerequisites || course.prerequisites;
        course.learningObjectives = learningObjectives || course.learningObjectives;
        course.syllabus = syllabus || course.syllabus;
        course.isActive = isActive !== undefined ? isActive : course.isActive;

        const updatedCourse = await course.save();
        res.json(updatedCourse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete course (admin only)
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        await course.remove();
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Enroll in course
const enrollInCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if already enrolled
        const existingProgress = await LearningProgress.findOne({
            userId: req.user.id,
            courseId: req.params.id
        });

        if (existingProgress) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        // Create learning progress record
        const progress = await LearningProgress.create({
            userId: req.user.id,
            courseId: req.params.id
        });

        // Increment enrollment count
        course.enrollmentCount += 1;
        await course.save();

        res.status(201).json({ 
            message: 'Successfully enrolled in course',
            progress 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user's enrolled courses
const getEnrolledCourses = async (req, res) => {
    try {
        const enrollments = await LearningProgress.find({ userId: req.user.id })
            .populate('courseId')
            .sort({ enrollmentDate: -1 });

        const enrolledCourses = enrollments.map(enrollment => ({
            course: enrollment.courseId,
            progress: {
                completionPercentage: enrollment.completionPercentage,
                currentModule: enrollment.currentModule,
                totalTimeSpent: enrollment.totalTimeSpent,
                lastAccessDate: enrollment.lastAccessDate,
                isCompleted: enrollment.isCompleted,
                grade: enrollment.grade
            }
        }));

        res.json(enrolledCourses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollInCourse,
    getEnrolledCourses
};