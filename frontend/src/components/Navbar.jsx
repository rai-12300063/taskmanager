import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold flex items-center">
          📚 Learning Progress Tracker
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm opacity-90">Welcome, {user.name}!</span>
              <Link 
                to="/tasks" 
                className="hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded transition-colors"
              >
                My Learning
              </Link>
              <Link 
                to="/profile" 
                className="hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-green-500 px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
