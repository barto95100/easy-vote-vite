import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et titre - toujours visible */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3">
              <img src="/easyvote.svg" alt="EasyVote" className="h-8 w-auto" />
              <span className="text-xl font-bold text-indigo-600">EasyVote</span>
            </Link>
          </div>

          {/* Navigation desktop - caché sur mobile */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link 
              to="/create" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nouveau sondage
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-gray-900">À propos</Link>
            <Link to="/admin" className="text-gray-600 hover:text-gray-900">Admin</Link>
          </nav>

          {/* Navigation mobile */}
          <div className="flex md:hidden items-center space-x-2">
            <Link 
              to="/create" 
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="h-5 w-5 mr-1.5" />
              <span className="inline">Sondage</span>
            </Link>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Menu</span>
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {isMenuOpen && (
          <div className="md:hidden py-2 space-y-1 border-t border-gray-200">
            <Link 
              to="/about"
              className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              À propos
            </Link>
            <Link 
              to="/admin"
              className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Admin
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 