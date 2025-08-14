/**
 * Calculate grade based on rubric scores
 * @param {Array} rubricScores - Array of rubric scores
 * @returns {Object} Grade calculation result
 */
const calculateRubricGrade = (rubricScores) => {
    if (!rubricScores || rubricScores.length === 0) {
        return { score: 0, maxScore: 0, percentage: 0 };
    }

    const totalScore = rubricScores.reduce((sum, item) => sum + item.pointsEarned, 0);
    const maxScore = rubricScores.reduce((sum, item) => sum + item.maxPoints, 0);
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    return {
        score: totalScore,
        maxScore,
        percentage,
        breakdown: rubricScores
    };
};

/**
 * Calculate quiz grade based on question answers
 * @param {Array} questions - Array of quiz questions
 * @param {Array} answers - Array of user answers
 * @returns {Object} Grade calculation result
 */
const calculateQuizGrade = (questions, answers) => {
    if (!questions || !answers || questions.length === 0) {
        return { score: 0, maxScore: 0, percentage: 0, correctAnswers: 0, totalQuestions: 0 };
    }

    let totalScore = 0;
    let maxScore = 0;
    let correctAnswers = 0;

    const gradedAnswers = answers.map((answer, index) => {
        const question = questions[index];
        if (!question) {
            return { ...answer, isCorrect: false, pointsEarned: 0 };
        }

        maxScore += question.points;
        let isCorrect = false;
        let pointsEarned = 0;

        // Check answer based on question type
        switch (question.type) {
            case 'multiple-choice':
            case 'true-false':
                isCorrect = question.correctAnswer && 
                    answer.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
                break;
            case 'short-answer':
                // For short answers, we can do basic string matching
                if (question.correctAnswer) {
                    const userAnswer = answer.answer.toLowerCase().trim();
                    const correctAnswer = question.correctAnswer.toLowerCase().trim();
                    isCorrect = userAnswer === correctAnswer || 
                        userAnswer.includes(correctAnswer) || 
                        correctAnswer.includes(userAnswer);
                }
                break;
            case 'essay':
                // Essay questions typically require manual grading
                isCorrect = false; // Will be manually graded
                break;
        }

        if (isCorrect) {
            pointsEarned = question.points;
            correctAnswers++;
        }

        totalScore += pointsEarned;

        return {
            questionIndex: index,
            answer: answer.answer,
            isCorrect,
            pointsEarned,
            maxPoints: question.points,
            questionType: question.type
        };
    });

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    return {
        score: totalScore,
        maxScore,
        percentage,
        correctAnswers,
        totalQuestions: questions.length,
        gradedAnswers
    };
};

/**
 * Calculate weighted grade from multiple assignments
 * @param {Array} submissions - Array of graded submissions
 * @param {Array} assignments - Array of assignment data with weights
 * @returns {Object} Weighted grade calculation
 */
const calculateWeightedGrade = (submissions, assignments) => {
    if (!submissions || !assignments || assignments.length === 0) {
        return { weightedScore: 0, totalWeight: 0, percentage: 0 };
    }

    let totalWeightedScore = 0;
    let totalWeight = 0;
    const gradedAssignments = [];

    assignments.forEach(assignment => {
        const submission = submissions.find(s => 
            s.assignmentId.toString() === assignment._id.toString() && s.status === 'graded'
        );

        const weight = assignment.weight || 1; // Default weight of 1 if not specified
        totalWeight += weight;

        if (submission) {
            const assignmentScore = (submission.score / submission.maxScore) * 100;
            const weightedScore = assignmentScore * weight;
            totalWeightedScore += weightedScore;

            gradedAssignments.push({
                assignmentId: assignment._id,
                title: assignment.title,
                score: submission.score,
                maxScore: submission.maxScore,
                percentage: Math.round(assignmentScore),
                weight,
                weightedScore: Math.round(weightedScore * 100) / 100
            });
        } else {
            // Assignment not completed
            gradedAssignments.push({
                assignmentId: assignment._id,
                title: assignment.title,
                score: 0,
                maxScore: assignment.totalPoints,
                percentage: 0,
                weight,
                weightedScore: 0,
                completed: false
            });
        }
    });

    const finalPercentage = totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) / 100 : 0;

    return {
        weightedScore: Math.round(totalWeightedScore * 100) / 100,
        totalWeight,
        percentage: finalPercentage,
        breakdown: gradedAssignments,
        completedAssignments: gradedAssignments.filter(a => a.completed !== false).length,
        totalAssignments: assignments.length
    };
};

/**
 * Calculate course final grade based on all submissions
 * @param {string} courseId - Course ID
 * @param {string} userId - User ID
 * @returns {Object} Final grade calculation
 */
const calculateCourseGrade = async (courseId, userId) => {
    try {
        const Assignment = require('../models/Assignment');
        const Submission = require('../models/Submission');

        // Get all assignments for the course
        const assignments = await Assignment.find({ courseId, isActive: true });
        
        // Get all user submissions for these assignments
        const assignmentIds = assignments.map(a => a._id);
        const submissions = await Submission.find({
            assignmentId: { $in: assignmentIds },
            userId,
            status: 'graded'
        });

        // Calculate weighted grade
        const gradeResult = calculateWeightedGrade(submissions, assignments);

        return {
            ...gradeResult,
            letterGrade: getLetterGrade(gradeResult.percentage),
            gpa: getGPAFromPercentage(gradeResult.percentage)
        };
    } catch (error) {
        console.error('Error calculating course grade:', error);
        return null;
    }
};

/**
 * Convert percentage to letter grade
 * @param {number} percentage - Grade percentage
 * @returns {string} Letter grade
 */
const getLetterGrade = (percentage) => {
    if (percentage >= 97) return 'A+';
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 63) return 'D';
    if (percentage >= 60) return 'D-';
    return 'F';
};

/**
 * Convert percentage to GPA (4.0 scale)
 * @param {number} percentage - Grade percentage
 * @returns {number} GPA value
 */
const getGPAFromPercentage = (percentage) => {
    if (percentage >= 97) return 4.0;
    if (percentage >= 93) return 4.0;
    if (percentage >= 90) return 3.7;
    if (percentage >= 87) return 3.3;
    if (percentage >= 83) return 3.0;
    if (percentage >= 80) return 2.7;
    if (percentage >= 77) return 2.3;
    if (percentage >= 73) return 2.0;
    if (percentage >= 70) return 1.7;
    if (percentage >= 67) return 1.3;
    if (percentage >= 63) return 1.0;
    if (percentage >= 60) return 0.7;
    return 0.0;
};

/**
 * Calculate class statistics for instructors
 * @param {Array} submissions - Array of all submissions for an assignment
 * @returns {Object} Class statistics
 */
const calculateClassStatistics = (submissions) => {
    if (!submissions || submissions.length === 0) {
        return {
            mean: 0,
            median: 0,
            mode: 0,
            standardDeviation: 0,
            min: 0,
            max: 0,
            distribution: {}
        };
    }

    const scores = submissions.map(s => s.percentage).sort((a, b) => a - b);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    // Calculate median
    const median = scores.length % 2 === 0
        ? (scores[scores.length / 2 - 1] + scores[scores.length / 2]) / 2
        : scores[Math.floor(scores.length / 2)];

    // Calculate mode
    const frequency = {};
    scores.forEach(score => {
        frequency[score] = (frequency[score] || 0) + 1;
    });
    const mode = Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);

    // Calculate standard deviation
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);

    // Grade distribution
    const distribution = {
        'A': scores.filter(s => s >= 90).length,
        'B': scores.filter(s => s >= 80 && s < 90).length,
        'C': scores.filter(s => s >= 70 && s < 80).length,
        'D': scores.filter(s => s >= 60 && s < 70).length,
        'F': scores.filter(s => s < 60).length
    };

    return {
        mean: Math.round(mean * 100) / 100,
        median: Math.round(median * 100) / 100,
        mode: parseFloat(mode),
        standardDeviation: Math.round(standardDeviation * 100) / 100,
        min: Math.min(...scores),
        max: Math.max(...scores),
        distribution,
        totalSubmissions: submissions.length
    };
};

module.exports = {
    calculateRubricGrade,
    calculateQuizGrade,
    calculateWeightedGrade,
    calculateCourseGrade,
    getLetterGrade,
    getGPAFromPercentage,
    calculateClassStatistics
};