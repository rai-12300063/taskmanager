import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const Analytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axiosInstance.get('/api/tasks/analytics', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setAnalytics(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-gray-600">No analytics data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Learning Analytics Dashboard</h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-500 text-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Modules</h3>
          <p className="text-3xl font-bold">{analytics.totalModules}</p>
        </div>
        
        <div className="bg-green-500 text-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Completed</h3>
          <p className="text-3xl font-bold">{analytics.completedModules}</p>
          <p className="text-sm opacity-90">
            {analytics.totalModules > 0 ? Math.round((analytics.completedModules / analytics.totalModules) * 100) : 0}% completion rate
          </p>
        </div>
        
        <div className="bg-purple-500 text-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Time Invested</h3>
          <p className="text-3xl font-bold">{formatTime(analytics.totalTimeSpent)}</p>
        </div>
        
        <div className="bg-orange-500 text-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Avg Progress</h3>
          <p className="text-3xl font-bold">{Math.round(analytics.averageProgress)}%</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Progress by Category</h2>
          {Object.keys(analytics.categories).length === 0 ? (
            <p className="text-gray-500">No categories to display</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(analytics.categories).map(([category, data]) => (
                <div key={category} className="border-b pb-3">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-700">{category}</h4>
                    <span className="text-sm text-gray-500">
                      {data.completed}/{data.total} completed
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{width: `${Math.min(data.averageProgress, 100)}%`}}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{Math.round(data.averageProgress)}% avg progress</span>
                    <span>{formatTime(data.timeSpent)} spent</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Recent Activity</h2>
          {analytics.recentActivity.length === 0 ? (
            <p className="text-gray-500">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <h5 className="font-medium text-gray-800">{activity.title}</h5>
                    <p className="text-sm text-gray-600">{activity.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-blue-600">{activity.progress}%</div>
                    <div className="text-xs text-gray-500">
                      {new Date(activity.lastStudied).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;