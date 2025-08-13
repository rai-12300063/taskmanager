import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import Analytics from '../components/Analytics';
import { useAuth } from '../context/AuthContext';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [activeTab, setActiveTab] = useState('modules'); // 'modules' or 'analytics'
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axiosInstance.get('/api/tasks', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTasks(response.data);
      } catch (error) {
        alert('Failed to fetch learning modules.');
      }
    };

    if (user) {
      fetchTasks();
    }
  }, [user]);

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'completed':
        return task.completed;
      case 'in-progress':
        return !task.completed && task.progress > 0;
      case 'not-started':
        return task.progress === 0;
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Learning Progress Tracker</h1>
          <p className="text-gray-600">Track your learning journey and monitor your progress across different subjects.</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('modules')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'modules' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Learning Modules
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Analytics Dashboard
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'modules' ? (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div>
                  <label className="text-sm font-medium text-gray-700 mr-2">Filter:</label>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                  >
                    <option value="all">All Modules</option>
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div className="text-sm text-gray-600">
                  Showing {filteredTasks.length} of {tasks.length} modules
                </div>
              </div>
            </div>

            <TaskForm
              tasks={tasks}
              setTasks={setTasks}
              editingTask={editingTask}
              setEditingTask={setEditingTask}
            />
            <TaskList 
              tasks={filteredTasks} 
              setTasks={setTasks} 
              setEditingTask={setEditingTask} 
            />
          </>
        ) : (
          <Analytics />
        )}
      </div>
    </div>
  );
};

export default Tasks;
