const Task = require('../models/Task');
const getTasks = async (
req,
res) => {
try {
const tasks = await Task.find({ userId: req.user.id });
res.json(tasks);
} catch (error) {
res.status(500).json({ message: error.message });
}
};

const addTask = async (
req,
res) => {
const { 
    title, 
    description, 
    deadline, 
    category, 
    difficulty, 
    estimatedTime, 
    resources, 
    skillsLearned 
} = req.body;
try {
const task = await Task.create({ 
    userId: req.user.id, 
    title, 
    description, 
    deadline, 
    category: category || 'General',
    difficulty: difficulty || 'Beginner',
    estimatedTime: estimatedTime || 60,
    resources: resources || [],
    skillsLearned: skillsLearned || []
});
res.status(201).json(task);
} catch (error) {
res.status(500).json({ message: error.message });
}
};

const updateTask = async (
req,
res) => {
const { 
    title, 
    description, 
    completed, 
    deadline, 
    category, 
    difficulty, 
    progress, 
    timeSpent, 
    estimatedTime, 
    resources, 
    notes, 
    skillsLearned 
} = req.body;
try {
const task = await Task.findById(req.params.id);
if (!task) return res.status(404).json({ message: 'Learning module not found' });

// Update basic fields
task.title = title || task.title;
task.description = description || task.description;
task.completed = completed ?? task.completed;
task.deadline = deadline || task.deadline;

// Update learning progress fields
task.category = category || task.category;
task.difficulty = difficulty || task.difficulty;
task.progress = progress !== undefined ? progress : task.progress;
task.timeSpent = timeSpent !== undefined ? (task.timeSpent + timeSpent) : task.timeSpent;
task.estimatedTime = estimatedTime || task.estimatedTime;
task.resources = resources || task.resources;
task.notes = notes || task.notes;
task.skillsLearned = skillsLearned || task.skillsLearned;

// Update lastStudied when progress is made
if (progress !== undefined || timeSpent !== undefined) {
    task.lastStudied = new Date();
}

// Auto-complete when progress reaches 100%
if (task.progress >= 100) {
    task.completed = true;
}

const updatedTask = await task.save();
res.json(updatedTask);
} catch (error) {
res.status(500).json({ message: error.message });
}
};

const deleteTask = async (req,res) => {
try {
const task = await Task.findById(req.params.id);
if (!task) return res.status(404).json({ message: 'Learning module not found' });
await task.remove();
res.json({ message: 'Learning module deleted' });
} catch (error) {
res.status(500).json({ message: error.message });
}
};

// New learning analytics functions
const getLearningAnalytics = async (req, res) => {
try {
const userId = req.user.id;
const tasks = await Task.find({ userId });

const analytics = {
    totalModules: tasks.length,
    completedModules: tasks.filter(task => task.completed).length,
    totalTimeSpent: tasks.reduce((total, task) => total + task.timeSpent, 0),
    averageProgress: tasks.length > 0 ? tasks.reduce((total, task) => total + task.progress, 0) / tasks.length : 0,
    categories: {},
    recentActivity: tasks
        .sort((a, b) => new Date(b.lastStudied) - new Date(a.lastStudied))
        .slice(0, 5)
        .map(task => ({
            title: task.title,
            category: task.category,
            progress: task.progress,
            lastStudied: task.lastStudied
        }))
};

// Group by categories
tasks.forEach(task => {
    if (!analytics.categories[task.category]) {
        analytics.categories[task.category] = {
            total: 0,
            completed: 0,
            totalProgress: 0,
            timeSpent: 0
        };
    }
    analytics.categories[task.category].total++;
    analytics.categories[task.category].totalProgress += task.progress;
    analytics.categories[task.category].timeSpent += task.timeSpent;
    if (task.completed) {
        analytics.categories[task.category].completed++;
    }
});

// Calculate average progress per category
Object.keys(analytics.categories).forEach(category => {
    const categoryData = analytics.categories[category];
    categoryData.averageProgress = categoryData.total > 0 ? categoryData.totalProgress / categoryData.total : 0;
});

res.json(analytics);
} catch (error) {
res.status(500).json({ message: error.message });
}
};

const getTasksByCategory = async (req, res) => {
try {
const { category } = req.params;
const tasks = await Task.find({ userId: req.user.id, category });
res.json(tasks);
} catch (error) {
res.status(500).json({ message: error.message });
}
};

module.exports = { 
    getTasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    getLearningAnalytics, 
    getTasksByCategory 
};
