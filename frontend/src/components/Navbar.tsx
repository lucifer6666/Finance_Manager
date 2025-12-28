import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/transactions', label: 'Transactions' },
    { path: '/cards', label: 'Credit Cards' },
    { path: '/savings', label: 'Savings' },
    { path: '/salary', label: 'Salary' },
    { path: '/analytics', label: 'Analytics' },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <h1 className="text-2xl font-bold text-black">Finance Manager</h1>
          </div>

          <div className="flex gap-8">
            {navLinks.map(({ path, label }) => (
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
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
