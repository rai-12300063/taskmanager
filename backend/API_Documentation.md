# Online Learning Progress Tracker API Documentation

## Overview
This API provides comprehensive learning management system functionality including course management, progress tracking, assignments, analytics, and achievements.

## Base URL
```
http://localhost:5001/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## User Roles
- `student`: Can enroll in courses, submit assignments, track progress
- `instructor`: Can create courses, assignments, grade submissions
- `admin`: Full access to all features

---

## Authentication Endpoints

### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "university": "MIT",
  "address": "123 Main St"
}
```

### POST /auth/login
Login user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### GET /auth/profile
Get user profile (requires authentication).

### PUT /auth/profile
Update user profile (requires authentication).

---

## Course Management Endpoints

### GET /courses
Get all courses with filtering and pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `category`: Filter by category
- `difficulty`: Filter by difficulty
- `search`: Search in title/description
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: asc/desc (default: desc)

**Response:**
```json
{
  "courses": [...],
  "totalPages": 10,
  "currentPage": 1,
  "total": 100
}
```

### GET /courses/:id
Get single course details.

### POST /courses
Create new course (instructor/admin only).

**Request Body:**
```json
{
  "title": "JavaScript Fundamentals",
  "description": "Learn the basics of JavaScript",
  "category": "Programming",
  "difficulty": "Beginner",
  "duration": {
    "weeks": 8,
    "hoursPerWeek": 5
  },
  "estimatedCompletionTime": 40,
  "prerequisites": ["Basic HTML"],
  "learningObjectives": ["Understand variables", "Learn functions"],
  "syllabus": [
    {
      "moduleTitle": "Introduction",
      "topics": ["Variables", "Data Types"],
      "estimatedHours": 5
    }
  ]
}
```

### PUT /courses/:id
Update course (instructor/admin only).

### DELETE /courses/:id
Delete course (admin only).

### POST /courses/:id/enroll
Enroll in course (requires authentication).

### GET /courses/enrolled/my
Get user's enrolled courses (requires authentication).

---

## Progress Tracking Endpoints

### GET /progress/course/:courseId
Get user's progress for a specific course.

### PUT /progress/course/:courseId/module
Update module completion.

**Request Body:**
```json
{
  "moduleIndex": 0,
  "timeSpent": 45
}
```

### POST /progress/course/:courseId/bookmark
Add bookmark.

**Request Body:**
```json
{
  "moduleIndex": 1,
  "topic": "Variables",
  "note": "Important concept"
}
```

### DELETE /progress/course/:courseId/bookmark/:bookmarkId
Remove bookmark.

### POST /progress/course/:courseId/session/start
Start learning session.

**Request Body:**
```json
{
  "moduleIndex": 1,
  "deviceType": "desktop"
}
```

### PUT /progress/session/:sessionId/end
End learning session.

**Request Body:**
```json
{
  "sessionQuality": "good",
  "sessionNotes": "Completed module 1",
  "activitiesCompleted": [
    {
      "type": "video",
      "name": "Introduction Video",
      "timeSpent": 15,
      "completed": true
    }
  ]
}
```

### GET /progress/analytics
Get learning analytics.

**Query Parameters:**
- `period`: 7days/30days/90days

---

## Assignment Management Endpoints

### GET /assignments/course/:courseId
Get assignments for a course.

### GET /assignments/:id
Get single assignment.

### POST /assignments
Create assignment (instructor/admin only).

**Request Body:**
```json
{
  "courseId": "course_id",
  "title": "JavaScript Quiz",
  "description": "Test your JavaScript knowledge",
  "type": "quiz",
  "moduleIndex": 1,
  "dueDate": "2024-12-31T23:59:59Z",
  "maxAttempts": 2,
  "timeLimit": 60,
  "totalPoints": 100,
  "passingScore": 70,
  "autoGrade": true,
  "questions": [
    {
      "question": "What is a variable?",
      "type": "multiple-choice",
      "options": ["A container", "A function", "A loop", "An object"],
      "correctAnswer": "A container",
      "points": 10,
      "explanation": "Variables store data values"
    }
  ]
}
```

### PUT /assignments/:id
Update assignment (instructor/admin only).

### DELETE /assignments/:id
Delete assignment (admin only).

### POST /assignments/:id/submit
Submit assignment (student).

**Request Body:**
```json
{
  "answers": [
    {
      "questionIndex": 0,
      "answer": "A container"
    }
  ],
  "content": "Essay content here",
  "attachments": []
}
```

### GET /assignments/:id/submissions/my
Get user's submissions for assignment.

### GET /assignments/:id/submissions
Get all submissions for assignment (instructor/admin only).

### PUT /assignments/submissions/:submissionId/grade
Grade submission (instructor/admin only).

**Request Body:**
```json
{
  "score": 85,
  "feedback": "Good work!",
  "rubricScores": [
    {
      "criterion": "Content Quality",
      "pointsEarned": 8,
      "maxPoints": 10,
      "feedback": "Well explained"
    }
  ]
}
```

---

## Analytics Endpoints

### GET /analytics/dashboard
Get user dashboard analytics.

**Response:**
```json
{
  "summary": {
    "totalCourses": 5,
    "completedCourses": 2,
    "averageCompletion": 65,
    "totalTimeSpent": 1200
  },
  "recentActivity": [...],
  "upcomingDeadlines": [...],
  "weeklyLearningTime": 180,
  "recentAchievements": [...]
}
```

### GET /analytics/learning
Get detailed learning analytics.

**Query Parameters:**
- `period`: 7days/30days/90days
- `courseId`: Filter by course

### GET /analytics/instructor
Get instructor analytics (instructor/admin only).

### GET /analytics/system
Get system-wide analytics (admin only).

---

## Achievement Endpoints

### GET /achievements/my
Get user's achievements.

### POST /achievements/:id/share
Share achievement.

### POST /achievements/certificates/course/:courseId
Generate certificate for completed course.

### GET /achievements/verify
Verify certificate.

**Query Parameters:**
- `certificateId`: Certificate ID
- `verificationCode`: Verification code

### GET /achievements/leaderboard
Get achievement leaderboard.

**Query Parameters:**
- `type`: points/streak
- `period`: week/month/all

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Models

### User Model
```javascript
{
  name: String,
  email: String,
  password: String,
  university: String,
  address: String,
  role: "student" | "instructor" | "admin",
  learningGoals: [String],
  skillTags: [String],
  learningPreferences: {
    preferredLearningTime: String,
    learningPace: String,
    notificationsEnabled: Boolean
  },
  totalLearningHours: Number,
  currentStreak: Number,
  longestStreak: Number,
  lastLearningDate: Date,
  joinDate: Date
}
```

### Course Model
```javascript
{
  title: String,
  description: String,
  category: String,
  difficulty: "Beginner" | "Intermediate" | "Advanced",
  instructor: {
    id: ObjectId,
    name: String,
    email: String
  },
  duration: {
    weeks: Number,
    hoursPerWeek: Number
  },
  estimatedCompletionTime: Number,
  prerequisites: [String],
  learningObjectives: [String],
  syllabus: [Object],
  isActive: Boolean,
  enrollmentCount: Number,
  rating: Number,
  ratingCount: Number
}
```

### LearningProgress Model
```javascript
{
  userId: ObjectId,
  courseId: ObjectId,
  enrollmentDate: Date,
  completionPercentage: Number,
  currentModule: Number,
  modulesCompleted: [Object],
  totalTimeSpent: Number,
  lastAccessDate: Date,
  isCompleted: Boolean,
  completionDate: Date,
  grade: Number,
  certificateIssued: Boolean
}
```

---

## Getting Started

1. Install dependencies: `npm install`
2. Set environment variables in `.env`:
   ```
   MONGO_URI=mongodb://localhost:27017/taskmanager
   JWT_SECRET=your_jwt_secret
   PORT=5001
   ```
3. Start the server: `npm start`
4. Run tests: `npm test`

## Examples

### Enroll in a Course
```javascript
// 1. Get available courses
GET /api/courses

// 2. Enroll in a course
POST /api/courses/{courseId}/enroll

// 3. Start learning session
POST /api/progress/course/{courseId}/session/start

// 4. Update progress
PUT /api/progress/course/{courseId}/module
```

### Complete an Assignment
```javascript
// 1. Get course assignments
GET /api/assignments/course/{courseId}

// 2. Get assignment details
GET /api/assignments/{assignmentId}

// 3. Submit assignment
POST /api/assignments/{assignmentId}/submit

// 4. Check submission status
GET /api/assignments/{assignmentId}/submissions/my
```