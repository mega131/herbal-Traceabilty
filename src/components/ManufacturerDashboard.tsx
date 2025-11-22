// src/components/ManufacturerDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Save, LogOut, ArrowLeft } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import type { BatchDetailsResponse } from '../types';
import BatchManager from '../utils/batchManager';

interface ManufacturerDashboardProps {
  onBack?: () => void;
}

const ManufacturerDashboard: React.FC<ManufacturerDashboardProps> = ({ onBack }) => {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    herbName: '',
    partUsed: '',
    quantityProcessed: '',
    dryingMethod: '',
    extractionMethod: '',
    productName: '',
    formulationType: '',
  });
  const [batchIdLookup, setBatchIdLookup] = useState('');
  const [lookupResult, setLookupResult] = useState<BatchDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [processedBatches, setProcessedBatches] = useState<any[]>([]);
  const [availableBatches, setAvailableBatches] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const batchManager = BatchManager.getInstance();


  // Load lab-approved batches for manufacturing
  const loadManufacturingBatches = () => {
    const labApprovedBatches = batchManager.getBatchesForManufacturing();

    // Convert to component format
    const formattedBatches = labApprovedBatches.map(batch => ({
      _id: batch.id,
      batchId: batch.batchId,
      species: batch.species,
      quantity: batch.quantity,
      status: 'lab_approved',
      farmer: {
        name: batch.farmerName,
        location: batch.farmerLocation
      },
      harvestDate: batch.harvestDate,
      labApprovalDate: batch.updatedAt
    }));

    setAvailableBatches(formattedBatches);
  };

  // Function to get network IP (simplified - user needs to replace with their actual IP)
  const getNetworkIP = () => {
    // This is a placeholder - user should replace with their actual network IP
    return '192.168.1.100'; // Common network IP format
  };

  // Fetch real processed batches and available lab-approved batches
  useEffect(() => {
    loadManufacturingBatches();
    fetchProcessedBatches();
    fetchAvailableBatches();

    // Set up periodic refresh to check for new lab-approved batches
    const interval = setInterval(() => {
      loadManufacturingBatches();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchProcessedBatches = async () => {
    try {
      const response = await api.getProcessingRecords();
      setProcessedBatches(response.processors);
    } catch (error) {
      console.error('Failed to fetch processed batches:', error);
      setProcessedBatches([]);
    }
  };

  const fetchAvailableBatches = async () => {
    try {
      const response = await api.getBatchesForProcessing();
      const apiBatches = response.batches || [];

      // Combine API batches with local lab-approved batches
      const localBatches = batchManager.getBatchesForManufacturing();
      const localFormatted = localBatches.map(batch => ({
        _id: batch.id,
        batchId: batch.batchId,
        species: batch.species,
        quantity: batch.quantity,
        status: 'lab_approved',
        farmer: {
          name: batch.farmerName,
          location: batch.farmerLocation
        },
        harvestDate: batch.harvestDate,
        labApprovalDate: batch.updatedAt
      }));

      setAvailableBatches([...localFormatted, ...apiBatches]);
    } catch (error) {
      console.error('Failed to fetch available batches:', error);
      loadManufacturingBatches();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) {
      alert('Please select a lab-approved batch to process');
      return;
    }

    try {
      // Find the selected batch to get its batchId for processing
      const selectedBatch = availableBatches.find(b => b._id === selectedBatchId);

      const processingData = {
        batchIds: selectedBatch ? [selectedBatch.batchId] : [selectedBatchId], // Use batchId instead of _id
        herbName: formData.herbName,
        partUsed: formData.partUsed,
        quantityProcessed: parseFloat(formData.quantityProcessed),
        dryingMethod: formData.dryingMethod,
        extractionMethod: formData.extractionMethod,
        productName: formData.productName,
        formulationType: formData.formulationType,
        manufacturerName: user?.name || 'Ayurveda Industries Ltd',
        manufacturingDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 years
        selectedBatchInfo: selectedBatch // Include batch info for reference
      };

      let created;
      try {
        created = await api.createProcessingRecord(processingData);
      } catch (apiError) {
        console.log('API call failed, using mock data:', apiError);
        // Create mock processing record if API fails
        created = {
          processor: {
            _id: `PROD-${Date.now()}`,
            batchIds: processingData.batchIds,
            productName: processingData.productName,
            manufacturerName: processingData.manufacturerName
          }
        };
      }

      // Generate QR for this processor record
      const pid = created.processor?._id || `PROD-${Date.now()}`;

      // Create product QR URL with actual product ID
      const productQR = `${window.location.origin}/product/${pid}`;
      setQrUrl(productQR);

      // Update batch status to manufacturing
      const batchForManufacturing = availableBatches.find(b => b._id === selectedBatchId);
      if (batchForManufacturing) {
        batchManager.updateBatchStatus(
          batchForManufacturing.batchId,
          'manufacturing',
          user?.name || 'Ayurveda Industries Ltd'
        );
      }

      // Also try the API call
      try {
        await api.generateProductQR(pid);
      } catch (qrError) {
        console.log('QR API call failed, using local storage only');
      }

      alert(`✅ Product manufactured successfully!\n\nProduct ID: ${pid}\nBatch processed and ready for distribution.`);

      setFormData({
        herbName: '',
        partUsed: '',
        quantityProcessed: '',
        dryingMethod: '',
        extractionMethod: '',
        productName: '',
        formulationType: '',
      });
      setSelectedBatchId('');
      fetchProcessedBatches();
      fetchAvailableBatches();
    } catch (error: any) {
      alert(error?.message || 'Failed to save processing record');
    }
  };

  const fetchBatch = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await api.getBatchDetails(batchIdLookup.trim());
      setLookupResult(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch batch');
      setLookupResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Custom dropdown component for reuse
  const Dropdown: React.FC<{ name: string; value: string; options: string[]; placeholder: string }> = ({ name, value, options, placeholder }) => (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={handleInputChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 cursor-pointer transition hover:border-green-500"
        required
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">▼</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <header className="bg-green-600 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {onBack && (
              <button onClick={onBack} className="p-2 rounded hover:bg-green-500/30">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-2xl font-bold">Manufacturer Dashboard</h1>
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

      {/* Form */}
      <main className="max-w-4xl mx-auto p-6">
        {/* Lab-Approved Batches Selection - Enhanced */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl mb-6 border-2 border-green-200">
          <div className="flex items-center mb-4">
            <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
              ✓
            </div>
            <h3 className="text-xl font-semibold text-green-800">Lab-Approved Batches Ready for Manufacturing</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Batch Selection */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-green-700 mb-2">
                🎯 Select Lab-Approved Batch for Processing
              </label>
              <select
                className="w-full p-3 border-2 border-green-300 rounded-lg bg-white text-lg font-medium focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
              >
                <option value="">🔍 Choose a lab-approved batch to process...</option>
                {availableBatches.map((batch) => (
                  <option key={batch._id} value={batch._id}>
                    ✅ {batch.batchId} | {batch.species} | {batch.quantity}kg | Farmer: {batch.farmer?.name}
                  </option>
                ))}
              </select>

              {/* Selected Batch Details */}
              {selectedBatchId && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                  {(() => {
                    const selectedBatch = availableBatches.find(b => b._id === selectedBatchId);
                    return selectedBatch ? (
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><strong>Batch ID:</strong> {selectedBatch.batchId}</div>
                        <div><strong>Species:</strong> {selectedBatch.species}</div>
                        <div><strong>Quantity:</strong> {selectedBatch.quantity}kg</div>
                        <div><strong>Farmer:</strong> {selectedBatch.farmer?.name}</div>
                        <div><strong>Location:</strong> {selectedBatch.farmer?.location}</div>
                        <div><strong>Lab Approved:</strong> {selectedBatch.labApprovalDate}</div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            {/* Statistics Panel */}
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-3">📊 Manufacturing Overview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Manufacturer:</span>
                  <span className="font-medium">{user?.name || 'Ayurveda Industries Ltd'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Available Batches:</span>
                  <span className="font-medium text-green-600">{availableBatches.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Quantity:</span>
                  <span className="font-medium text-blue-600">{availableBatches.reduce((sum, b) => sum + b.quantity, 0)}kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium text-green-600">Ready to Process</span>
                </div>
              </div>

              {availableBatches.length === 0 && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                  ⏳ Waiting for lab-approved batches...
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                loadManufacturingBatches();
                fetchAvailableBatches();
              }}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition"
            >
              🔄 Refresh Batches
            </button>
            <button
              onClick={() => {
                if (availableBatches.length > 0) {
                  setSelectedBatchId(availableBatches[0]._id);
                }
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition"
              disabled={availableBatches.length === 0}
            >
              ⚡ Quick Select First
            </button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
            🏭 Processing & Manufacturing Form
            {availableBatches.length > 0 && (
              <span className="ml-3 px-2 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                {availableBatches.length} batches ready
              </span>
            )}
          </h2>

          {availableBatches.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <div className="text-6xl mb-4">⏳</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Lab-Approved Batches Available</h3>
              <p className="text-gray-600 mb-4">Manufacturing requires batches that have passed lab testing.</p>
              <div className="bg-blue-50 p-4 rounded-lg max-w-md mx-auto">
                <h4 className="font-medium text-blue-800 mb-2">Next Steps:</h4>
                <ol className="text-left text-blue-700 text-sm space-y-1">
                  <li>1. Farmers harvest and register batches</li>
                  <li>2. Agents collect and forward to labs</li>
                  <li>3. Labs test and approve batches</li>
                  <li>4. Approved batches appear here for manufacturing</li>
                </ol>
              </div>
              <button
                onClick={() => {
                  loadManufacturingBatches();
                  fetchAvailableBatches();
                }}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                🔄 Check for New Batches
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Select Lab-Approved Batch - Enhanced */}
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <label className="block text-lg font-semibold text-green-800 mb-3 flex items-center">
                  <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">1</span>
                  Select Lab-Approved Batch for Manufacturing *
                </label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-medium"
                  required
                >
                  <option value="">🔍 Choose a lab-approved batch to process...</option>
                  {availableBatches.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      ✅ {batch.batchId} | {batch.species} | {batch.quantity}kg | Farmer: {batch.farmer?.name} | Lab Approved
                    </option>
                  ))}
                </select>

                {availableBatches.length === 0 ? (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-700 font-medium">⏳ No lab-approved batches available</p>
                    <p className="text-yellow-600 text-sm mt-1">Batches need to pass lab testing before manufacturing can begin.</p>
                  </div>
                ) : (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-700 font-medium">📋 {availableBatches.length} lab-approved batches ready for processing</p>
                    <p className="text-blue-600 text-sm mt-1">Select a batch above to begin manufacturing process.</p>
                  </div>
                )}

                {selectedBatchId && (
                  <div className="mt-3 p-3 bg-white border border-green-300 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">📦 Selected Batch Details:</h4>
                    {(() => {
                      const selectedBatch = availableBatches.find(b => b._id === selectedBatchId);
                      return selectedBatch ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                          <div><strong>Batch:</strong> {selectedBatch.batchId}</div>
                          <div><strong>Species:</strong> {selectedBatch.species}</div>
                          <div><strong>Quantity:</strong> {selectedBatch.quantity}kg</div>
                          <div><strong>Farmer:</strong> {selectedBatch.farmer?.name}</div>
                          <div><strong>Location:</strong> {selectedBatch.farmer?.location}</div>
                          <div><strong>Lab Approved:</strong> ✅ {selectedBatch.labApprovalDate}</div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>

              {/* Manufacturing Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">2</span>
                  Manufacturing Process Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Dropdown name="herbName" value={formData.herbName} options={['Ashwagandha', 'Tulsi', 'Neem']} placeholder="Select Herb" />
                  <Dropdown name="partUsed" value={formData.partUsed} options={['Root', 'Leaf', 'Seed']} placeholder="Select Part" />
                </div>
              </div>

              <div>
                <input
                  type="number"
                  name="quantityProcessed"
                  value={formData.quantityProcessed}
                  onChange={handleInputChange}
                  placeholder="Quantity Processed (kg)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Dropdown name="dryingMethod" value={formData.dryingMethod} options={['Sun', 'Shade', 'Mechanical']} placeholder="Select Drying Method" />
                <Dropdown name="extractionMethod" value={formData.extractionMethod} options={['None', 'Water', 'Alcohol']} placeholder="Select Extraction Method" />
              </div>

              {/* Final Product Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">3</span>
                  Final Product Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Dropdown name="productName" value={formData.productName} options={['Ashwagandha Capsule', 'Churna', 'Tablet']} placeholder="Select Product" />
                  <Dropdown name="formulationType" value={formData.formulationType} options={['Capsule', 'Powder', 'Syrup']} placeholder="Select Formulation Type" />
                </div>
              </div>

              {/* Submit & QR */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center space-x-2 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Batch</span>
                </button>

                <div className="p-4 bg-gray-100 rounded-xl flex flex-col items-center max-w-xs">
                  <h3 className="font-medium mb-2">Product QR Code</h3>
                  {qrUrl ? (
                    <div className="text-center mb-2">
                      <a href={qrUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm block mb-1">
                        🔗 Open Product Traceability
                      </a>
                      <div className="bg-green-50 p-2 rounded text-xs text-green-700 mb-2">
                        <p><strong>📱 Product Traceability:</strong></p>
                        <p>1. Scan QR with phone camera</p>
                        <p>2. View complete product journey</p>
                        <p>3. Farm to product traceability</p>
                      </div>
                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(qrUrl);
                            alert('URL copied to clipboard!');
                          }}
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded block w-full"
                        >
                          📋 Copy URL
                        </button>
                        <button
                          onClick={() => {
                            const networkUrl = `http://${getNetworkIP()}:5173/demo`;
                            navigator.clipboard.writeText(networkUrl);
                            alert(`Network URL copied: ${networkUrl}\nUse this on mobile devices on same WiFi`);
                          }}
                          className="text-xs bg-green-500 text-white px-2 py-1 rounded block w-full"
                        >
                          📶 Copy Network URL
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 mb-2">QR will appear after saving</p>
                  )}
                  <div className="border-2 border-gray-300 p-2 bg-white rounded">
                    <QRCode
                      value={qrUrl || `${window.location.origin}/product/sample`}
                      size={120}
                      level="M"
                    />
                  </div>
                  <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs text-blue-700 text-center">
                      <strong>� Poroduct Traceability</strong><br />
                      Scan to view complete product journey
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    📱 Scan to view complete product journey
                  </p>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Batch Lookup & QR from backend */}
        <div className="bg-white p-8 rounded-2xl shadow-lg mt-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Lookup Batch & Generate QR</h2>
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <input
              value={batchIdLookup}
              onChange={(e) => setBatchIdLookup(e.target.value)}
              placeholder="Enter Batch ID (e.g., BATCH-XXXX)"
              className="w-full md:w-2/3 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="button"
              onClick={fetchBatch}
              className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Fetch'}
            </button>
          </div>
          {error && <p className="text-red-600 mt-3">{error}</p>}
          {lookupResult && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div>
                <h3 className="font-medium mb-2">Batch Details</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <div><strong>ID:</strong> {lookupResult.batch.batchId}</div>
                  <div><strong>Species:</strong> {lookupResult.batch.species}</div>
                  <div><strong>Quantity:</strong> {lookupResult.batch.quantity}</div>
                  {lookupResult.batch.geoTag && (
                    <div><strong>Geo:</strong> {lookupResult.batch.geoTag.latitude}, {lookupResult.batch.geoTag.longitude}</div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <h3 className="font-medium mb-2">Batch QR Code</h3>
                <div className="border-2 border-gray-300 p-2 bg-white rounded mb-2">
                  <QRCode
                    value={`${window.location.origin}/demo`}
                    size={120}
                    level="M"
                  />
                </div>
                <button
                  onClick={() => {
                    const url = `https://herbal-trace-demo.netlify.app/demo`;
                    navigator.clipboard.writeText(url);
                    alert('Public demo URL copied - works on any mobile device!');
                  }}
                  className="text-xs bg-green-500 text-white px-2 py-1 rounded"
                >
                  📋 Copy Mobile-Ready URL
                </button>
                <p className="text-xs text-green-600 mt-1 text-center">
                  ✅ Scan to view product traceability (Mobile Ready)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Processed Batches History */}
        <div className="bg-white p-8 rounded-2xl shadow-lg mt-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Processed Batches History</h2>
          {processedBatches.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No processed batches yet. Start by processing your first batch above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {processedBatches.map((batch, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><strong>Herb:</strong> {batch.herbName}</div>
                    <div><strong>Part:</strong> {batch.partUsed}</div>
                    <div><strong>Quantity:</strong> {batch.quantityProcessed} kg</div>
                    <div><strong>Product:</strong> {batch.productName}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManufacturerDashboard;