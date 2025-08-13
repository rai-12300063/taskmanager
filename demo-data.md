# Sample Learning Modules Data

This file shows example data structure for the Learning Progress Tracker application.

## Example Learning Modules

```json
[
  {
    "_id": "1",
    "userId": "user123",
    "title": "JavaScript Fundamentals",
    "description": "Learn the basics of JavaScript programming including variables, functions, and DOM manipulation",
    "category": "Programming", 
    "difficulty": "Beginner",
    "progress": 75,
    "timeSpent": 240,
    "estimatedTime": 300,
    "completed": false,
    "deadline": "2024-09-15",
    "resources": [
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
      "https://javascript.info/"
    ],
    "skillsLearned": ["Variables", "Functions", "DOM Manipulation"],
    "notes": "Great introduction to JS. Need to practice more with async/await",
    "lastStudied": "2024-08-13",
    "createdAt": "2024-08-01"
  },
  {
    "_id": "2", 
    "userId": "user123",
    "title": "Linear Algebra Basics",
    "description": "Understanding vectors, matrices, and basic linear transformations",
    "category": "Mathematics",
    "difficulty": "Intermediate", 
    "progress": 100,
    "timeSpent": 180,
    "estimatedTime": 200,
    "completed": true,
    "deadline": "2024-08-30",
    "resources": [
      "Khan Academy Linear Algebra",
      "3Blue1Brown Essence of Linear Algebra"
    ],
    "skillsLearned": ["Vector Operations", "Matrix Multiplication", "Eigenvalues"],
    "notes": "Excellent visual explanations. Ready for advanced topics",
    "lastStudied": "2024-08-12", 
    "createdAt": "2024-07-20"
  },
  {
    "_id": "3",
    "userId": "user123", 
    "title": "React Hooks Deep Dive",
    "description": "Advanced React patterns using hooks, custom hooks, and performance optimization",
    "category": "Programming",
    "difficulty": "Advanced",
    "progress": 45,
    "timeSpent": 120,
    "estimatedTime": 400,
    "completed": false,
    "deadline": "2024-10-01",
    "resources": [
      "React Documentation",
      "React Hooks Complete Guide"
    ],
    "skillsLearned": ["useState", "useEffect", "Custom Hooks"],
    "notes": "Complex but very powerful. Need more practice with useCallback",
    "lastStudied": "2024-08-10",
    "createdAt": "2024-08-05"
  },
  {
    "_id": "4",
    "userId": "user123",
    "title": "Spanish Conversation Practice", 
    "description": "Improving conversational Spanish through daily practice and grammar exercises",
    "category": "Languages",
    "difficulty": "Intermediate",
    "progress": 60,
    "timeSpent": 300,
    "estimatedTime": 500,
    "completed": false,
    "deadline": "2024-12-31",
    "resources": [
      "Duolingo",
      "SpanishPod101",
      "Language Exchange Apps"
    ],
    "skillsLearned": ["Past Tense", "Subjunctive Mood", "Common Phrases"],
    "notes": "Making good progress. Need to practice speaking more",
    "lastStudied": "2024-08-13",
    "createdAt": "2024-07-01"
  },
  {
    "_id": "5",
    "userId": "user123",
    "title": "Digital Art Fundamentals",
    "description": "Learning digital illustration techniques, color theory, and composition",
    "category": "Arts", 
    "difficulty": "Beginner",
    "progress": 25,
    "timeSpent": 90,
    "estimatedTime": 360,
    "completed": false,
    "deadline": "2024-11-15",
    "resources": [
      "Proko Art Courses",
      "Adobe Photoshop Tutorials"
    ],
    "skillsLearned": ["Basic Shapes", "Color Theory", "Layer Management"],
    "notes": "Very enjoyable! Takes time but seeing improvement",
    "lastStudied": "2024-08-11",
    "createdAt": "2024-08-08"
  }
]
```

## Analytics Data Example

```json
{
  "totalModules": 5,
  "completedModules": 1, 
  "totalTimeSpent": 930,
  "averageProgress": 61,
  "categories": {
    "Programming": {
      "total": 2,
      "completed": 0,
      "totalProgress": 120,
      "averageProgress": 60,
      "timeSpent": 360
    },
    "Mathematics": {
      "total": 1,
      "completed": 1, 
      "totalProgress": 100,
      "averageProgress": 100,
      "timeSpent": 180
    },
    "Languages": {
      "total": 1,
      "completed": 0,
      "totalProgress": 60, 
      "averageProgress": 60,
      "timeSpent": 300
    },
    "Arts": {
      "total": 1,
      "completed": 0,
      "totalProgress": 25,
      "averageProgress": 25, 
      "timeSpent": 90
    }
  },
  "recentActivity": [
    {
      "title": "JavaScript Fundamentals",
      "category": "Programming",
      "progress": 75,
      "lastStudied": "2024-08-13"
    },
    {
      "title": "Spanish Conversation Practice", 
      "category": "Languages",
      "progress": 60,
      "lastStudied": "2024-08-13"
    }
  ]
}
```

This data structure demonstrates:
- Multiple learning categories (Programming, Mathematics, Languages, Arts)
- Different difficulty levels (Beginner, Intermediate, Advanced)
- Progress tracking with percentages and time spent
- Resource management and note-taking
- Skills tracking and learning milestones
- Rich analytics for learning insights