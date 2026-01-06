import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, isAuthenticated } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/transactions', label: 'Transactions' },
    { path: '/cards', label: 'Credit Cards' },
    { path: '/savings', label: 'Savings' },
    { path: '/salary', label: 'Salary' },
    { path: '/analytics', label: 'Analytics' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <h1 className="text-2xl font-bold text-black">Finance Manager</h1>
          </div>

          <div className="flex gap-8 items-center">
            {isAuthenticated && navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive(path)
                    ? 'bg-blue-500 text-white'
                    : 'text-black hover:bg-gray-100'
                }`}
              >
                {label}
              </Link>
            ))}
            {isAuthenticated && (
              <div className="flex items-center gap-4 border-l border-gray-300 pl-4">
                <span className="text-sm text-gray-600">Hi, {user}!</span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
