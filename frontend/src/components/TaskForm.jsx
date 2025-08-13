import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const TaskForm = ({ tasks, setTasks, editingTask, setEditingTask }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    deadline: '', 
    category: 'General',
    difficulty: 'Beginner',
    estimatedTime: 60,
    resources: [],
    skillsLearned: []
  });

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description,
        deadline: editingTask.deadline ? editingTask.deadline.split('T')[0] : '',
        category: editingTask.category || 'General',
        difficulty: editingTask.difficulty || 'Beginner',
        estimatedTime: editingTask.estimatedTime || 60,
        resources: editingTask.resources || [],
        skillsLearned: editingTask.skillsLearned || []
      });
    } else {
      setFormData({ 
        title: '', 
        description: '', 
        deadline: '', 
        category: 'General',
        difficulty: 'Beginner',
        estimatedTime: 60,
        resources: [],
        skillsLearned: []
      });
    }
  }, [editingTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        const response = await axiosInstance.put(`/api/tasks/${editingTask._id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTasks(tasks.map((task) => (task._id === response.data._id ? response.data : task)));
      } else {
        const response = await axiosInstance.post('/api/tasks', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTasks([...tasks, response.data]);
      }
      setEditingTask(null);
      setFormData({ 
        title: '', 
        description: '', 
        deadline: '', 
        category: 'General',
        difficulty: 'Beginner',
        estimatedTime: 60,
        resources: [],
        skillsLearned: []
      });
    } catch (error) {
      alert('Failed to save learning module.');
    }
  };

  const categories = ['General', 'Programming', 'Mathematics', 'Science', 'Languages', 'Business', 'Arts', 'Health'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">
        {editingTask ? 'Edit Learning Module' : 'Add Learning Module'}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Module Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full p-2 border rounded focus:border-blue-500"
          required
        />
        
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full p-2 border rounded focus:border-blue-500"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full mb-4 p-2 border rounded focus:border-blue-500 mt-4"
        rows="3"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="date"
          value={formData.deadline}
          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          className="w-full p-2 border rounded focus:border-blue-500"
        />
        
        <select
          value={formData.difficulty}
          onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
          className="w-full p-2 border rounded focus:border-blue-500"
        >
          {difficulties.map(diff => (
            <option key={diff} value={diff}>{diff}</option>
          ))}
        </select>
        
        <input
          type="number"
          placeholder="Estimated time (minutes)"
          value={formData.estimatedTime}
          onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) })}
          className="w-full p-2 border rounded focus:border-blue-500"
          min="1"
        />
      </div>

      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors">
        {editingTask ? 'Update Learning Module' : 'Add Learning Module'}
      </button>
    </form>
  );
};

export default TaskForm;
