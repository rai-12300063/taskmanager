/*
const express = require('express');
const { getTasks, addTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect, getTasks).post(protect, addTask);
router.route('/:id').put(protect, updateTask).delete(protect, deleteTask);

module.exports = router;
*/

const express = require("express")
const {getTasks,addTask, updateTask, deleteTask} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router()
router.get("/", protect, getTasks)
router.post("/", protect, addTask)
router.put("/", protect, updateTask);
router.delete("/", protect, deleteTask);
module.exports = router;