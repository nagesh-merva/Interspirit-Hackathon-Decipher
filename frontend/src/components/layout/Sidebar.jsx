import { NavLink } from 'react-router-dom'
import { FiHome, FiMessageSquare, FiTrendingUp, FiBell, FiSettings, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

function Sidebar({ isOpen, toggleSidebar }) {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FiHome },
    { name: 'Mentions & Comments', path: '/mentions', icon: FiMessageSquare },
    { name: 'Sentiment Trends', path: '/sentiment-trends', icon: FiTrendingUp },
    { name: 'Alerts', path: '/alerts', icon: FiBell },
    { name: 'Settings', path: '/settings', icon: FiSettings },
  ]

  return (
    <div className={`${isOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col`}>
      <div className="flex items-center justify-between h-16 px-4">
        {isOpen && (
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            SentiMeter
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white ml-auto"
        >
          {isOpen ? <FiChevronLeft className="h-5 w-5" /> : <FiChevronRight className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-md transition-colors ${isActive
                ? 'bg-blue-700 text-blue-200'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
          >
            <item.icon className={`h-5 w-5 ${isOpen ? 'mr-3' : 'mx-auto'}`} />
            {isOpen && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar