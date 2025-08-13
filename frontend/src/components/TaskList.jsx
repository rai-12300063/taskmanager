import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const TaskList = ({ tasks, setTasks, setEditingTask }) => {
  const { user } = useAuth();
  const [updatingProgress, setUpdatingProgress] = useState({});

  const handleDelete = async (taskId) => {
    try {
      await axiosInstance.delete(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (error) {
      alert('Failed to delete learning module.');
    }
  };

  const handleProgressUpdate = async (taskId, newProgress, timeSpent = 0) => {
    try {
      setUpdatingProgress(prev => ({ ...prev, [taskId]: true }));
      const response = await axiosInstance.put(`/api/tasks/${taskId}`, 
        { progress: newProgress, timeSpent }, 
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setTasks(tasks.map((task) => (task._id === response.data._id ? response.data : task)));
    } catch (error) {
      alert('Failed to update progress.');
    } finally {
      setUpdatingProgress(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Programming': 'bg-blue-100 text-blue-800',
      'Mathematics': 'bg-purple-100 text-purple-800',
      'Science': 'bg-green-100 text-green-800',
      'Languages': 'bg-pink-100 text-pink-800',
      'Business': 'bg-indigo-100 text-indigo-800',
      'Arts': 'bg-orange-100 text-orange-800',
      'Health': 'bg-teal-100 text-teal-800',
      'General': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-800">My Learning Modules</h2>
      {tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No learning modules yet. Add your first module to start tracking your progress!</p>
        </div>
      ) : (
        tasks.map((task) => (
          <div key={task._id} className="bg-white p-6 mb-4 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{task.title}</h3>
                <div className="flex gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                    {task.category}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                    {task.difficulty}
                  </span>
                  {task.completed && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Completed
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{task.progress}%</div>
                <div className="text-xs text-gray-500">
                  {formatTime(task.timeSpent)} / {formatTime(task.estimatedTime)}
                </div>
              </div>
            </div>

            {task.description && (
              <p className="text-gray-600 mb-3">{task.description}</p>
            )}

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{task.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{width: `${Math.min(task.progress, 100)}%`}}
                ></div>
              </div>
            </div>

            {/* Quick Progress Updates */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => handleProgressUpdate(task._id, Math.min(task.progress + 10, 100), 15)}
                disabled={updatingProgress[task._id] || task.progress >= 100}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
              >
                +10% (15m)
              </button>
              <button
                onClick={() => handleProgressUpdate(task._id, Math.min(task.progress + 25, 100), 30)}
                disabled={updatingProgress[task._id] || task.progress >= 100}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
              >
                +25% (30m)
              </button>
              <button
                onClick={() => handleProgressUpdate(task._id, 100, 0)}
                disabled={updatingProgress[task._id] || task.completed}
                className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 disabled:opacity-50"
              >
                Mark Complete
              </button>
            </div>

            {task.deadline && (
              <p className="text-sm text-gray-500 mb-3">
                Deadline: {new Date(task.deadline).toLocaleDateString()}
              </p>
            )}

            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-400">
                Last studied: {task.lastStudied ? new Date(task.lastStudied).toLocaleDateString() : 'Never'}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingTask(task)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TaskList;
