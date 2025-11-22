import React, { useState, useEffect } from 'react';
import { MapPin, Eye, Edit, LogOut, ArrowLeft, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import BatchManager from '../utils/batchManager';

interface Batch {
  id: string;
  mongoId?: string;
  species: string;
  quantity: number;
  date: string;
  status: string;
  gps: { lat: number; lng: number };
  farmerName: string;
}

const AgentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [assignedBatches, setAssignedBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const batchManager = BatchManager.getInstance();

  // Load batches available for agent collection
  const loadAgentBatches = () => {
    const agentBatches = batchManager.getBatchesForAgent();
    
    // Convert to component format
    const formattedBatches = agentBatches.map(batch => ({
      id: batch.batchId,
      mongoId: batch.id,
      species: batch.species,
      quantity: batch.quantity,
      date: batch.harvestDate,
      status: batch.status.toLowerCase().replace(/\s+/g, '_'),
      gps: batch.gps,
      farmerName: batch.farmerName
    }));
    
    setAssignedBatches(formattedBatches);
  };

  // Fetch real assigned batches on component mount
  useEffect(() => {
    loadAgentBatches();
    fetchAssignedBatches();
  }, []);

  const fetchAssignedBatches = async () => {
    try {
      setLoading(true);
      // Get available batches for assignment
      const res = await api.getAvailableBatches();
      const batches = res.batches || [];
      
      const formatted = batches.map((batch: any) => ({
        id: batch.batchId || batch._id,
        mongoId: batch._id,
        species: batch.species,
        quantity: batch.quantity,
        date: new Date(batch.createdAt).toISOString().split('T')[0],
        status: (batch.status || 'pending_collection').toLowerCase().replace(/\s+/g, '_'),
        gps: { lat: batch.geoTag?.latitude || 0, lng: batch.geoTag?.longitude || 0 },
        farmerName: batch.farmer?.name || 'Unknown Farmer'
      }));
      // Combine API batches with local batches
      const localBatches = batchManager.getBatchesForAgent();
      const localFormatted = localBatches.map(batch => ({
        id: batch.batchId,
        mongoId: batch.id,
        species: batch.species,
        quantity: batch.quantity,
        date: batch.harvestDate,
        status: batch.status.toLowerCase().replace(/\s+/g, '_'),
        gps: batch.gps,
        farmerName: batch.farmerName
      }));
      
      const allBatches = [...localFormatted, ...formatted];
      setAssignedBatches(allBatches);
    } catch (error) {
      console.error('Failed to fetch assigned batches:', error);
      loadAgentBatches();
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_collection': return 'bg-yellow-100 text-yellow-800';
      case 'assigned_to_agency': return 'bg-blue-100 text-blue-800';
      case 'collected': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'received': return 'bg-indigo-100 text-indigo-800';
      case 'lab_approved': return 'bg-green-200 text-green-900';
      case 'lab_failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_collection': return 'Pending Collection';
      case 'assigned_to_agency': return 'Assigned to Agency';
      case 'collected': return 'Collected';
      case 'in_transit': return 'In Transit';
      case 'received': return 'Received (Ready for Lab)';
      case 'lab_approved': return 'Lab Approved ✅';
      case 'lab_failed': return 'Lab Failed ❌';
      default: return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const handleStatusUpdate = async () => {
    if (selectedBatch && statusUpdate) {
      try {
        const agentName = user?.name || 'Priya Sharma';
        
        // Update in centralized system
        const success = batchManager.updateBatchStatus(
          selectedBatch.id, 
          statusUpdate as any, 
          agentName
        );
        
        if (success) {
          // Try to update backend as well
          try {
            const batchId = selectedBatch.mongoId || selectedBatch.id;
            await api.updateBatchStatus(batchId, {
              status: statusUpdate, 
              remarks: `Status updated by ${agentName}` 
            });
          } catch (apiError) {
            console.log('API update failed, using local storage only');
          }
          
          // Update local state and refresh
          selectedBatch.status = statusUpdate;
          setSelectedBatch(null);
          setStatusUpdate('');
          alert(`✅ Status updated successfully!\n\nBatch: ${selectedBatch.id}\nNew Status: ${statusUpdate}\nFarmer will be notified.`);
          loadAgentBatches();
        } else {
          alert('Failed to update batch status');
        }
      } catch (error: any) {
        alert(error?.message || 'Failed to update status');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assigned batches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-green-600 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/')} className="text-white hover:text-gray-200">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-white">Agent Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
              <User className="w-5 h-5 text-green-700" />
              <span className="text-green-700 font-medium">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Available Batches Dropdown */}
        <div className="bg-purple-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-purple-800 mb-3">🚛 Available Batches for Collection</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-1">Select Batch to Process</label>
              <select 
                className="w-full p-2 border border-purple-300 rounded-lg bg-white"
                onChange={(e) => {
                  const selectedBatch = assignedBatches.find(b => b.id === e.target.value);
                  if (selectedBatch) setSelectedBatch(selectedBatch);
                }}
              >
                <option value="">Choose a batch to process</option>
                {assignedBatches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.id} - {batch.species} ({batch.quantity}kg) - Farmer: {batch.farmerName} - {getStatusText(batch.status)}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-purple-700">
              <p><strong>Agent:</strong> {user?.name || 'Priya Sharma'}</p>
              <p><strong>Available Batches:</strong> {assignedBatches.length}</p>
              <p><strong>Pending Collection:</strong> {assignedBatches.filter(b => b.status === 'pending_collection').length}</p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Assigned Batches</h2>
        {assignedBatches.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No batches assigned</h3>
            <p className="text-gray-600 mb-4">You don't have any batches assigned to you yet. Check back later for new assignments.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedBatches.map(batch => (
              <div key={batch.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{batch.species}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(batch.status)}`}>
                    {getStatusText(batch.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-600"><strong>Batch ID:</strong> {batch.id}</p>
                <p className="text-sm text-gray-600"><strong>Farmer:</strong> {batch.farmerName}</p>
                <p className="text-sm text-gray-600"><strong>Quantity:</strong> {batch.quantity} kg</p>
                <p className="text-sm text-gray-600"><strong>Date:</strong> {batch.date}</p>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{batch.gps.lat.toFixed(4)}, {batch.gps.lng.toFixed(4)}</span>
                </div>
                <button
                  onClick={() => setSelectedBatch(batch)}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 mt-3"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Batch Details Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Batch Details</h2>
              <button onClick={() => setSelectedBatch(null)} className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p><strong>Batch ID:</strong> {selectedBatch.id}</p>
              <p><strong>Species:</strong> {selectedBatch.species}</p>
              <p><strong>Quantity:</strong> {selectedBatch.quantity} kg</p>
              <p><strong>Date:</strong> {selectedBatch.date}</p>
              <p><strong>Farmer:</strong> {selectedBatch.farmerName}</p>
              <p><strong>GPS:</strong> {selectedBatch.gps.lat.toFixed(4)}, {selectedBatch.gps.lng.toFixed(4)}</p>
              <p><strong>Status:</strong> <span className={`inline-flex px-2 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedBatch.status)}`}>{getStatusText(selectedBatch.status)}</span></p>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                <select
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select Status</option>
                  <option value="assigned_to_agency">Assign to Agency</option>
                  <option value="in_transit">In Transit</option>
                  <option value="collected">Collected</option>
                  <option value="received">✅ Send to Lab for Testing</option>
                </select>
                <button
                  onClick={handleStatusUpdate}
                  className="mt-3 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Update Status</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;