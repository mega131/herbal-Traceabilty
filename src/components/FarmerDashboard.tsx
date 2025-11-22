import React, { useState, useEffect } from 'react';
import {
  Plus, MapPin, Calendar, Package, TrendingUp, Award,
  Camera, Save, ArrowLeft, LogOut, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import BatchManager from '../utils/batchManager';

interface Batch {
  id: string;
  species: string;
  quantity: number;
  date: string;
  status: string;
  gps: { lat: number; lng: number };
  assigned_agency?: string;
  photo: string;
}

const FarmerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [collections, setCollections] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const batchManager = BatchManager.getInstance();
  const [formData, setFormData] = useState({
    species: '',
    quantity: '',
    date: '',
    gps_lat: '',
    gps_lng: '',
    photo: null as File | null
  });

  // Load farmer's batches from centralized system
  const loadFarmerBatches = () => {
    const farmerName = user?.name || 'Rajesh Kumar';
    const farmerBatches = batchManager.getBatchesByFarmer(farmerName);
    
    // Convert to component format
    const formattedBatches = farmerBatches.map(batch => ({
      id: batch.batchId,
      species: batch.species,
      quantity: batch.quantity,
      date: batch.harvestDate,
      status: batch.status,
      gps: batch.gps,
      photo: '/api/placeholder/300/200'
    }));
    
    setCollections(formattedBatches);
  };

  // Fetch real batches on component mount
  useEffect(() => {
    loadFarmerBatches();
    fetchBatches();
  }, [user?.id]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const farmerId = (user as any)?.id || (user as any)?._id;
      if (farmerId) {
        const response = await api.getFarmerBatches(farmerId);
        const formattedBatches = response.batches.map((batch: any) => ({
          id: batch.batchId,
          species: batch.species,
          quantity: batch.quantity,
          date: new Date(batch.createdAt).toISOString().split('T')[0],
          status: batch.status || 'pending_collection',
          gps: { lat: batch.geoTag.latitude, lng: batch.geoTag.longitude },
          photo: '/api/placeholder/300/200'
        }));
        // Combine API batches with local batches
        const localBatches = batchManager.getBatchesByFarmer(user?.name || 'Rajesh Kumar');
        const localFormatted = localBatches.map(batch => ({
          id: batch.batchId,
          species: batch.species,
          quantity: batch.quantity,
          date: batch.harvestDate,
          status: batch.status,
          gps: batch.gps,
          photo: '/api/placeholder/300/200'
        }));
        
        const allBatches = [...localFormatted, ...formattedBatches];
        setCollections(allBatches);
      } else {
        loadFarmerBatches();
      }
    } catch (error) {
      console.error('Failed to fetch batches:', error);
      loadFarmerBatches();
    } finally {
      setLoading(false);
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_collection': return 'bg-yellow-100 text-yellow-800';
      case 'assigned_to_agency': return 'bg-blue-100 text-blue-800';
      case 'collected': return 'bg-purple-100 text-purple-800';
      case 'in_transit': return 'bg-indigo-100 text-indigo-800';
      case 'received': return 'bg-cyan-100 text-cyan-800';
      case 'lab_approved': return 'bg-green-100 text-green-800';
      case 'lab_failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_collection': return '📋 Pending Collection';
      case 'assigned_to_agency': return '🚛 Assigned to Agency';
      case 'collected': return '📦 Collected';
      case 'in_transit': return '🚚 In Transit';
      case 'received': return '🏭 Received (Lab Testing)';
      case 'lab_approved': return '✅ Lab Approved';
      case 'lab_failed': return '❌ Lab Failed';
      default: return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFormData(prev => ({ ...prev, photo: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const farmerName = user?.name || 'Rajesh Kumar';
      
      // Create batch in centralized system
      const newBatch = batchManager.createBatch({
        species: formData.species,
        quantity: Number(formData.quantity),
        farmerName: farmerName,
        farmerLocation: 'Karnataka, India',
        harvestDate: formData.date,
        gps: { 
          lat: Number(formData.gps_lat), 
          lng: Number(formData.gps_lng) 
        }
      });

      // Try to save to backend as well
      try {
        const farmerId = (user as any)?.id || (user as any)?._id || '';
        const email = (user as any)?.email || '';
        const payload = {
          ...(farmerId ? { farmerId } : { email }),
          species: formData.species,
          quantity: Number(formData.quantity),
          latitude: Number(formData.gps_lat),
          longitude: Number(formData.gps_lng),
          photos: [],
          qualityScore: null,
          useAutoGPS: false,
        };
        await api.addBatch(payload);
      } catch (apiError) {
        console.log('API save failed, using local storage only');
      }

      alert(`✅ Batch created successfully!\n\nBatch ID: ${newBatch.batchId}\nSpecies: ${newBatch.species}\nQuantity: ${newBatch.quantity}kg`);
      
      // Refresh the display
      loadFarmerBatches();
      setShowAddForm(false);
      setFormData({ species: '', quantity: '', date: '', gps_lat: '', gps_lng: '', photo: null });
    } catch (err: any) {
      alert(err?.message || 'Failed to save batch');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your batches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-green-100 shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/')} className="text-gray-700 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Farmer Dashboard</h1>
            <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Batch</span>
            </button>
            <button
              onClick={() => {
                if (confirm('🗑️ Clear all your batches?\n\nThis will delete all batches created by you for testing purposes.')) {
                  batchManager.clearAllData();
                  alert('✅ All batches cleared!');
                  loadFarmerBatches();
                }
              }}
              className="bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm"
            >
              🗑️ Clear
            </button>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Current Batches Dropdown */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-3">📋 Your Current Batches</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Select Batch to View Details</label>
              <select 
                className="w-full p-2 border border-blue-300 rounded-lg bg-white"
                onChange={(e) => {
                  const selectedBatch = collections.find(b => b.id === e.target.value);
                  if (selectedBatch) setSelectedBatch(selectedBatch);
                }}
              >
                <option value="">Choose a batch to view details</option>
                {collections.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.id} - {batch.species} ({batch.quantity}kg) - {getStatusText(batch.status)}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-blue-700">
              <p><strong>Total Batches:</strong> {collections.length}</p>
              <p><strong>Farmer:</strong> {user?.name || 'Rajesh Kumar'}</p>
              <p><strong>Latest Batch:</strong> {collections[0]?.id || 'None'}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-green-100 p-6 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
            <Package className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Batches</p>
              <p className="text-2xl font-semibold text-gray-900">{collections.length}</p>
            </div>
          </div>
          <div className="bg-green-100 p-6 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
            <Calendar className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Collection</p>
              <p className="text-2xl font-semibold text-gray-900">{collections.filter(b => b.status === 'pending_collection').length}</p>
            </div>
          </div>
          <div className="bg-green-100 p-6 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">In Process</p>
              <p className="text-2xl font-semibold text-gray-900">{collections.filter(b => ['assigned_to_agency', 'collected', 'in_transit', 'received'].includes(b.status)).length}</p>
            </div>
          </div>
          <div className="bg-green-100 p-6 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
            <Award className="w-8 h-8 text-green-800" />
            <div>
              <p className="text-sm font-medium text-gray-600">Lab Approved</p>
              <p className="text-2xl font-semibold text-gray-900">{collections.filter(b => b.status === 'lab_approved').length}</p>
            </div>
          </div>
        </div>

        {/* My Batches */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Batches</h2>
          {collections.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No batches yet</h3>
              <p className="text-gray-600 mb-4">Start by adding your first herb batch to begin tracking.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Add Your First Batch</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map(batch => (
                <div key={batch.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-green-50">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900">{batch.species}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(batch.status)}`}>
                      {getStatusText(batch.status)}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <p><strong>Batch ID:</strong> {batch.id}</p>
                    <p><strong>Quantity:</strong> {batch.quantity} kg</p>
                    <p><strong>Date:</strong> {batch.date}</p>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{batch.gps.lat.toFixed(4)}, {batch.gps.lng.toFixed(4)}</span>
                    </div>
                    {batch.assigned_agency && <p><strong>Agency:</strong> {batch.assigned_agency}</p>}
                  </div>
                  <button
                    onClick={() => setSelectedBatch(batch)}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Add Batch Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-green-50 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Add New Batch</h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Species *</label>
                  <select name="species" value={formData.species} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" required>
                    <option value="">Select Species</option>
                    <option value="Ashwagandha">Ashwagandha</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (kg) *</label>
                  <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="Enter quantity in kg" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GPS Latitude *</label>
                  <input type="number" step="any" name="gps_lat" value={formData.gps_lat} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="12.9716" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GPS Longitude *</label>
                  <input type="number" step="any" name="gps_lng" value={formData.gps_lng} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="77.5946" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photo Upload *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload photo of the batch</p>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 mx-auto" required />
                  {formData.photo && <p className="text-sm text-green-600 mt-2">File selected: {formData.photo.name}</p>}
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                  <Save className="w-4 h-4" /> <span>Save Batch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Details Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-green-50 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Batch Details</h2>
              <button onClick={() => setSelectedBatch(null)} className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p><strong>Batch ID:</strong> {selectedBatch.id}</p>
              <p><strong>Species:</strong> {selectedBatch.species}</p>
              <p><strong>Quantity:</strong> {selectedBatch.quantity} kg</p>
              <p><strong>Date:</strong> {selectedBatch.date}</p>
              <p><strong>GPS:</strong> {selectedBatch.gps.lat.toFixed(4)}, {selectedBatch.gps.lng.toFixed(4)}</p>
              <p><strong>Status:</strong> <span className={`inline-flex px-2 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedBatch.status)}`}>{getStatusText(selectedBatch.status)}</span></p>
              {selectedBatch.assigned_agency && <p><strong>Assigned Agency:</strong> {selectedBatch.assigned_agency}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;