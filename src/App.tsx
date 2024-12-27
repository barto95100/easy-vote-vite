import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PollList from './components/PollList';
import PollForm from './components/PollForm';
import PollDetail from './components/PollDetail';
import About from './components/About';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminProvider } from './contexts/AdminContext';
import Header from './components/Header';

function App() {
  return (
    <AdminProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 overflow-x-hidden">
          <Header />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<PollList />} />
              <Route path="/create" element={<PollForm />} />
              <Route path="/polls/:id" element={<PollDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </div>
      </Router>
    </AdminProvider>
  );
}

export default App;
