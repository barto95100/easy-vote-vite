import { Link } from 'react-router-dom'

const Navigation = () => {
  return (
    <div>
      <Link
        to="/about"
        className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
      >
        À propos
      </Link>
      <Link 
        to="/admin/dashboard"
        className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
      >
        Administration
      </Link>
    </div>
  )
}

export default Navigation 