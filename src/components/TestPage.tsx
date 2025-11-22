import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const TestPage: React.FC = () => {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Page</h1>
        <p className="text-gray-600 mb-4">
          This is a simple test page to verify routing works.
        </p>
        <div className="bg-green-50 p-4 rounded-lg mb-4">
          <p className="text-sm text-green-800">
            <strong>User:</strong> {user?.name || 'Not logged in'}
          </p>
          <p className="text-sm text-green-800">
            <strong>Role:</strong> {user?.role || 'None'}
          </p>
        </div>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default TestPage;