import { useState } from 'react';
import AdminSettings from './AdminSettings';

const AdminPanel = () => {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <AdminSettings />
    </div>
  );
};

export default AdminPanel; 