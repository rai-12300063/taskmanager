const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Course = require('../models/Course');

// Get assignments for a course
const getCourseAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({ 
            courseId: req.params.courseId,
            isActive: true 
        }).sort({ moduleIndex: 1, createdAt: 1 });

        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single assignment
const getAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id)
            .populate('courseId', 'title');

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // For students, don't include correct answers unless they've submitted
        if (req.user.role === 'student') {
            const submission = await Submission.findOne({
                assignmentId: req.params.id,
                userId: req.user.id,
                status: 'graded'
            });

            if (!submission && !assignment.showCorrectAnswers) {
                assignment.questions.forEach(question => {
                    question.correctAnswer = undefined;
                    question.explanation = undefined;
                });
            }
        }

        res.json(assignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create assignment (instructor/admin only)
const createAssignment = async (req, res) => {
    try {
        const {
            courseId,
            title,
            description,
            type,
            moduleIndex,
            dueDate,
            maxAttempts,
            timeLimit,
            totalPoints,
            passingScore,
            instructions,
            questions,
            rubric,
            autoGrade,
            showCorrectAnswers,
            shuffleQuestions
        } = req.body;

        // Verify user has access to the course
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructor.id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to create assignments for this course' });
        }

        const assignment = await Assignment.create({
            courseId,
            title,
            description,
            type,
            moduleIndex,
            dueDate,
            maxAttempts: maxAttempts || 1,
            timeLimit,
            totalPoints,
            passingScore,
            instructions,
            questions: questions || [],
            rubric: rubric || [],
            autoGrade: autoGrade || false,
            showCorrectAnswers: showCorrectAnswers !== undefined ? showCorrectAnswers : true,
            shuffleQuestions: shuffleQuestions || false,
            createdBy: req.user.id
        });

        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update assignment (instructor/admin only)
const updateAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Verify user has access
        const course = await Course.findById(assignment.courseId);
        if (course.instructor.id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this assignment' });
        }

        const updateFields = [
            'title', 'description', 'dueDate', 'maxAttempts', 'timeLimit',
            'totalPoints', 'passingScore', 'instructions', 'questions',
            'rubric', 'autoGrade', 'showCorrectAnswers', 'shuffleQuestions', 'isActive'
        ];

        updateFields.forEach(field => {
            if (req.body[field] !== undefined) {
                assignment[field] = req.body[field];
            }
        });

        const updatedAssignment = await assignment.save();
        res.json(updatedAssignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete assignment (admin only)
const deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        await assignment.remove();
        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Submit assignment
const submitAssignment = async (req, res) => {
    try {
        const { answers, content, attachments } = req.body;
        const assignmentId = req.params.id;

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Check if user has attempts left
        const existingSubmissions = await Submission.find({
            assignmentId,
            userId: req.user.id
        });

        if (existingSubmissions.length >= assignment.maxAttempts) {
            return res.status(400).json({ message: 'Maximum attempts exceeded' });
        }

        const attemptNumber = existingSubmissions.length + 1;

        // Auto-grade if it's a quiz with correct answers
        let score = 0;
        let gradedAnswers = [];

        if (assignment.type === 'quiz' && assignment.autoGrade && answers) {
            gradedAnswers = answers.map((answer, index) => {
                const question = assignment.questions[index];
                if (!question) return { ...answer, isCorrect: false, pointsEarned: 0 };

                const isCorrect = question.correctAnswer && 
                    answer.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
                
                const pointsEarned = isCorrect ? question.points : 0;
                score += pointsEarned;

                return {
                    questionIndex: index,
                    answer: answer.answer,
                    isCorrect,
                    pointsEarned
                };
            });
        }

        const submission = await Submission.create({
            assignmentId,
            userId: req.user.id,
            attemptNumber,
            status: assignment.autoGrade ? 'graded' : 'submitted',
            submittedAt: new Date(),
            gradedAt: assignment.autoGrade ? new Date() : undefined,
            answers: gradedAnswers,
            content,
            attachments: attachments || [],
            score,
            maxScore: assignment.totalPoints,
            passed: score >= (assignment.passingScore / 100) * assignment.totalPoints
        });

        res.status(201).json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get submissions for an assignment (instructor/admin only)
const getAssignmentSubmissions = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Verify user has access
        const course = await Course.findById(assignment.courseId);
        if (course.instructor.id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view submissions' });
        }

        const submissions = await Submission.find({ assignmentId: req.params.id })
            .populate('userId', 'name email')
            .sort({ submittedAt: -1 });

        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Grade submission (instructor/admin only)
const gradeSubmission = async (req, res) => {
    try {
        const { score, feedback, rubricScores } = req.body;
        
        const submission = await Submission.findById(req.params.submissionId);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        const assignment = await Assignment.findById(submission.assignmentId);
        const course = await Course.findById(assignment.courseId);
        
        if (course.instructor.id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to grade this submission' });
        }

        submission.score = score;
        submission.feedback = feedback;
        submission.rubricScores = rubricScores || [];
        submission.status = 'graded';
        submission.gradedAt = new Date();
        submission.gradedBy = req.user.id;
        submission.passed = score >= (assignment.passingScore / 100) * assignment.totalPoints;

        const updatedSubmission = await submission.save();
        res.json(updatedSubmission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user's submissions for an assignment
const getUserSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({
            assignmentId: req.params.id,
            userId: req.user.id
        }).sort({ attemptNumber: -1 });

        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCourseAssignments,
    getAssignment,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    submitAssignment,
    getAssignmentSubmissions,
    gradeSubmission,
    getUserSubmissions
};