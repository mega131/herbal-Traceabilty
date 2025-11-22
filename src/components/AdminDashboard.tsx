// src/components/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import BatchManager from '../utils/batchManager';

interface Batch {
  id: string;
  species: string;
  farmer: string;
  quantity: number;
  harvestDate: string;
  status: string;
}

interface User {
  id: string;
  name: string;
  role: string;
  email?: string;
  createdAt?: string;
}

const AdminDashboard: React.FC = () => {
  const { logout, user } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all available batches to show in admin view
      const batchesResponse = await api.getAvailableBatches();
      const allBatches = batchesResponse.batches || [];
      
      // Format batches for admin view
      const formattedBatches = allBatches.map((batch: any) => ({
        id: batch.batchId || batch._id,
        species: batch.species,
        farmer: batch.farmer?.name || 'Unknown',
        quantity: batch.quantity,
        harvestDate: new Date(batch.createdAt).toLocaleDateString(),
        status: batch.status || 'pending_collection'
      }));

      // Mock users data (in real app, would fetch from user management API)
      const mockUsers = [
        { id: 'FARMER_001', name: 'Rajesh Kumar', role: 'Farmer', email: 'farmer123' },
        { id: 'AGENT_001', name: 'Priya Sharma', role: 'Agent', email: 'agent123' },
        { id: 'LAB_001', name: 'Dr. Suresh Patel', role: 'Lab Analyst', email: 'lab123' },
        { id: 'MFG_001', name: 'Ayurveda Industries Ltd', role: 'Manufacturer', email: 'manufacturer123' },
        { id: 'ADMIN_001', name: 'System Administrator', role: 'Admin', email: 'admin123' }
      ];

      setBatches(formattedBatches);
      setUsers(mockUsers);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setBatches([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    alert('User removed locally. Backend API integration pending.');
  };

  const handleSimulateRecall = () => {
    alert('Recall simulation triggered locally. Backend API integration pending.');
  };

  const handleExportReports = () => {
    alert('Reports exported locally. Backend API integration pending.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <header className="bg-green-600 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <ArrowLeft className="w-5 h-5 cursor-pointer hover:text-green-200" onClick={() => window.history.back()} />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <span className="text-green-100 text-sm">Welcome, {user?.name}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-3 py-2 bg-red-500 rounded hover:bg-red-600 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* System Overview with Current Batches */}
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h3 className="font-medium text-indigo-800 mb-3">🎯 System Overview - Current Batches</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-indigo-700 mb-1">All System Batches</label>
              <select className="w-full p-2 border border-indigo-300 rounded-lg bg-white">
                <option value="">View all batches in system</option>
                <option value="BATCH-20241101-001">BATCH-20241101-001 - Ashwagandha (Farmer: Rajesh)</option>
                <option value="BATCH-20241025-002">BATCH-20241025-002 - Tulsi (Farmer: Priya)</option>
                <option value="BATCH-20241020-003">BATCH-20241020-003 - Neem (Farmer: Suresh)</option>
                <option value="BATCH-20241015-004">BATCH-20241015-004 - Brahmi (Farmer: Anita)</option>
                <option value="BATCH-20241010-005">BATCH-20241010-005 - Shankhpushpi (Farmer: Mohan)</option>
              </select>
            </div>
            <div className="text-sm text-indigo-700">
              <p><strong>Administrator:</strong> {user?.name || 'System Administrator'}</p>
              <p><strong>Total Batches:</strong> 5</p>
              <p><strong>Active Users:</strong> 5</p>
            </div>
            <div className="text-sm text-indigo-700">
              <p><strong>Pending Collection:</strong> 1</p>
              <p><strong>In Process:</strong> 2</p>
              <p><strong>Lab Approved:</strong> 2</p>
            </div>
          </div>
        </div>

        {/* Users Management */}
        <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">User Management</h2>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No users registered yet. Users will appear here after they sign up.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border border-gray-200 rounded-lg">
                <thead className="bg-green-100">
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Role</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-t border-gray-200 hover:bg-green-50 transition">
                      <td className="px-4 py-2">{u.name}</td>
                      <td className="px-4 py-2">{u.role}</td>
                      <td className="px-4 py-2">{u.email || 'N/A'}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="px-3 py-1 text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Batch Overview */}
        <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Batch Overview</h2>
          {batches.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No batches created yet. Batches will appear here after farmers add them.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border border-gray-200 rounded-lg">
                <thead className="bg-green-100">
                  <tr>
                    <th className="px-4 py-2">Batch ID</th>
                    <th className="px-4 py-2">Species</th>
                    <th className="px-4 py-2">Farmer</th>
                    <th className="px-4 py-2">Quantity</th>
                    <th className="px-4 py-2">Harvest Date</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map(batch => (
                    <tr key={batch.id} className="border-t border-gray-200 hover:bg-green-50 transition">
                      <td className="px-4 py-2">{batch.id}</td>
                      <td className="px-4 py-2">{batch.species}</td>
                      <td className="px-4 py-2">{batch.farmer}</td>
                      <td className="px-4 py-2">{batch.quantity}</td>
                      <td className="px-4 py-2">{batch.harvestDate}</td>
                      <td className="px-4 py-2">{batch.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* System Management */}
        <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col items-center p-4 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">Recall Simulation</h3>
              <button 
                onClick={handleSimulateRecall}
                className="px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition"
              >
                Simulate Recall
              </button>
            </div>
            <div className="flex flex-col items-center p-4 border border-red-200 rounded-lg">
              <h3 className="font-medium text-red-800 mb-2">Clear All Batches</h3>
              <p className="text-sm text-red-600 mb-3 text-center">⚠️ This will delete ALL batches from the system</p>
              <button 
                onClick={() => {
                  if (confirm('⚠️ WARNING: This will permanently delete ALL batches from the system.\n\nThis action cannot be undone.\n\nAre you sure you want to continue?')) {
                    const batchManager = BatchManager.getInstance();
                    batchManager.clearAllData();
                    alert('✅ All batches have been cleared from the system.\n\nThe system is now reset to a clean state.');
                    window.location.reload(); // Refresh to update all components
                  }
                }}
                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
              >
                🗑️ Clear All Batches
              </button>
            </div>
          </div>
        </section>

        {/* Compliance Reports */}
        <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 flex flex-col md:flex-row md:justify-between items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Compliance Reports</h2>
          <button 
            onClick={handleExportReports}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Export Reports
          </button>
        </section>

        {/* Alerts / Notifications */}
        <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Blockchain network operational</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Database connected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-700">No active alerts</span>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default AdminDashboard;