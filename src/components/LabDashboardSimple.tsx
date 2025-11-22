import React, { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import BatchManager from '../utils/batchManager';

const LabDashboardSimple: React.FC = () => {
  const { logout, user } = useAuth();
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const batchManager = BatchManager.getInstance();
  const [labBatches, setLabBatches] = useState<any[]>([]);
  const [previousBatchCount, setPreviousBatchCount] = useState(0);
  const [showNewBatchAlert, setShowNewBatchAlert] = useState(false);
  const [formData, setFormData] = useState({
    batchId: "",
    labName: "",
    analystId: "",
    testDate: new Date().toISOString().split("T")[0],
    moisture: "",
    ashContent: "",
    pesticide_DDT: "",
    pesticide_Chlordane: "",
    metal_Lead: "",
    metal_Cadmium: "",
    notes: "",
    result: "Pass"
  });

  // Generate tests for current user
  const getCurrentUserTests = () => {
    const currentUser = user?.name || 'Dr. Suresh Patel';
    
    return [
      {
        batchId: "BATCH-20241025-001",
        labName: "CDRI Lucknow",
        analystId: currentUser.replace('Dr. ', '').replace(' ', '').toUpperCase(),
        testDate: "2024-10-25",
        result: "Pass",
        certificateId: "CERT-20241025-001"
      },
      {
        batchId: "BATCH-20241020-002", 
        labName: "IIIM Jammu",
        analystId: currentUser.replace('Dr. ', '').replace(' ', '').toUpperCase(),
        testDate: "2024-10-20",
        result: "Pass",
        certificateId: "CERT-20241020-002"
      }
    ];
  };

  const [userTests] = useState(getCurrentUserTests());

  // Load batches ready for lab testing
  const loadLabBatches = () => {
    console.log('Lab Dashboard: Loading batches for testing...');
    const batchesForLab = batchManager.getBatchesForLab();
    console.log('Lab Dashboard: Found batches for lab:', batchesForLab);
    
    // Convert to component format
    const formattedBatches = batchesForLab.map(batch => ({
      _id: batch.id,
      batchId: batch.batchId,
      species: batch.species,
      quantity: batch.quantity,
      status: "received",
      farmer: { 
        name: batch.farmerName, 
        location: batch.farmerLocation 
      },
      assignedLab: user?.name || 'Dr. Suresh Patel',
      receivedDate: batch.harvestDate,
      agentName: batch.assignedAgent || 'Collection Agent'
    }));
    
    console.log('Lab Dashboard: Formatted batches:', formattedBatches);
    
    // Check for new batches
    if (formattedBatches.length > previousBatchCount && previousBatchCount > 0) {
      setShowNewBatchAlert(true);
      setTimeout(() => setShowNewBatchAlert(false), 5000); // Hide after 5 seconds
    }
    
    setPreviousBatchCount(formattedBatches.length);
    setLabBatches(formattedBatches);
  };

  useEffect(() => {
    loadLabBatches();
    
    // Set up periodic refresh to check for new batches from agents
    const interval = setInterval(() => {
      console.log('Lab Dashboard: Auto-refreshing batches...');
      loadLabBatches();
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, [user]);

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const generateCertificateHTML = (certificateData: any) => {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://herbal-certs.gov.in/verify/${certificateData.certificateId}`)}`;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Ayurvedic Herb Quality Certificate</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: white; }
        .certificate { max-width: 800px; margin: 0 auto; border: 3px solid #2563eb; padding: 30px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { color: #2563eb; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .title { color: #1e40af; font-size: 20px; font-weight: bold; margin-bottom: 5px; }
        .subtitle { color: #374151; font-size: 14px; }
        .cert-id { background: #dbeafe; padding: 10px; text-align: center; margin: 20px 0; font-weight: bold; }
        .content { display: flex; gap: 30px; }
        .left-column { flex: 2; }
        .right-column { flex: 1; text-align: center; }
        .section { margin-bottom: 20px; }
        .section-title { color: #1e40af; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
        .param-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .param-item { background: #f9fafb; padding: 8px; border-radius: 4px; }
        .result-pass { color: #059669; font-weight: bold; }
        .result-fail { color: #dc2626; font-weight: bold; }
        .qr-section { border: 1px solid #d1d5db; padding: 15px; border-radius: 8px; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 15px; }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="header">
            <div class="logo">🇮🇳 GOVERNMENT OF INDIA</div>
            <div class="title">MINISTRY OF AYUSH</div>
            <div class="subtitle">Ayurvedic Herb Quality Certificate</div>
        </div>
        
        <div class="cert-id">Certificate ID: ${certificateData.certificateId}</div>
        
        <div class="content">
            <div class="left-column">
                <div class="section">
                    <div class="section-title">Batch Information</div>
                    <p><strong>Batch ID:</strong> ${certificateData.batchId}</p>
                    <p><strong>Laboratory:</strong> ${certificateData.labName}</p>
                    <p><strong>Analyst ID:</strong> ${certificateData.analystId}</p>
                    <p><strong>Test Date:</strong> ${certificateData.testDate}</p>
                    <p><strong>Issue Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                
                <div class="section">
                    <div class="section-title">Test Parameters</div>
                    <div class="param-grid">
                        <div class="param-item">
                            <strong>Moisture Content:</strong><br>
                            ${certificateData.moisture || 'N/A'}% (Std: ≤12%)
                        </div>
                        <div class="param-item">
                            <strong>Ash Content:</strong><br>
                            ${certificateData.ashContent || 'N/A'}% (Std: ≤8%)
                        </div>
                        <div class="param-item">
                            <strong>DDT:</strong><br>
                            ${certificateData.pesticide_DDT || 'N/A'} ppm (Std: ≤0.1)
                        </div>
                        <div class="param-item">
                            <strong>Chlordane:</strong><br>
                            ${certificateData.pesticide_Chlordane || 'N/A'} ppm (Std: ≤0.05)
                        </div>
                        <div class="param-item">
                            <strong>Lead (Pb):</strong><br>
                            ${certificateData.metal_Lead || 'N/A'} ppm (Std: ≤10)
                        </div>
                        <div class="param-item">
                            <strong>Cadmium (Cd):</strong><br>
                            ${certificateData.metal_Cadmium || 'N/A'} ppm (Std: ≤0.3)
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-title">Test Result</div>
                    <p class="${certificateData.result === 'Pass' ? 'result-pass' : 'result-fail'}">
                        ${certificateData.result === 'Pass' ? '✅ PASSED' : '❌ FAILED'}
                    </p>
                    ${certificateData.result === 'Fail' ? `<p><strong>Failure Reasons:</strong><br>${certificateData.failReasons?.join('<br>') || 'Parameters exceeded limits'}</p>` : '<p>All parameters are within acceptable limits as per Indian Pharmacopoeia standards.</p>'}
                    ${certificateData.notes ? `<p><strong>Notes:</strong> ${certificateData.notes}</p>` : ''}
                </div>
            </div>
            
            <div class="right-column">
                <div class="qr-section">
                    <div class="section-title">Verification QR Code</div>
                    <img src="${qrCodeUrl}" alt="Verification QR Code" style="max-width: 150px;">
                    <p style="font-size: 12px; margin-top: 10px;">
                        Scan to verify certificate authenticity
                    </p>
                    <p style="font-size: 10px; word-break: break-all;">
                        https://herbal-certs.gov.in/verify/${certificateData.certificateId}
                    </p>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Government of India | Ministry of AYUSH</strong></p>
            <p>Ayurvedic Drug Research & Quality Control Division</p>
            <p>This certificate is digitally generated and verified through blockchain technology.</p>
        </div>
    </div>
</body>
</html>`;
  };

  const downloadCertificate = (certificateData: any) => {
    const htmlContent = generateCertificateHTML(certificateData);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certificate_${certificateData.certificateId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const viewCertificate = (certificateData: any) => {
    const htmlContent = generateCertificateHTML(certificateData);
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  const handleSubmit = () => {
    // Auto-determine result based on parameters
    let autoResult = "Pass";
    let failReasons: string[] = [];

    const moisture = parseFloat(formData.moisture) || 0;
    if (moisture > 12) {
      autoResult = "Fail";
      failReasons.push("Moisture content exceeds 12%");
    }

    const ashContent = parseFloat(formData.ashContent) || 0;
    if (ashContent > 8) {
      autoResult = "Fail";
      failReasons.push("Ash content exceeds 8%");
    }

    // Check pesticides
    const ddt = parseFloat(formData.pesticide_DDT) || 0;
    if (ddt > 0.1) {
      autoResult = "Fail";
      failReasons.push("DDT exceeds 0.1 ppm");
    }

    const chlordane = parseFloat(formData.pesticide_Chlordane) || 0;
    if (chlordane > 0.05) {
      autoResult = "Fail";
      failReasons.push("Chlordane exceeds 0.05 ppm");
    }

    // Check heavy metals
    const lead = parseFloat(formData.metal_Lead) || 0;
    if (lead > 10) {
      autoResult = "Fail";
      failReasons.push("Lead exceeds 10 ppm");
    }

    const cadmium = parseFloat(formData.metal_Cadmium) || 0;
    if (cadmium > 0.3) {
      autoResult = "Fail";
      failReasons.push("Cadmium exceeds 0.3 ppm");
    }

    const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
    const certificateUrl = `https://herbal-certs.gov.in/verify/${certificateId}`;
    
    const certificateData = {
      ...formData,
      certificateId,
      certificateUrl,
      result: autoResult,
      failReasons,
      issuedDate: new Date().toISOString()
    };

    // Show certificate options
    const showCertificateOptions = () => {
      const message = autoResult === "Pass" 
        ? `✅ Lab test PASSED!\n\nCertificate ID: ${certificateId}\nAll parameters within acceptable limits.\n\nChoose an option:`
        : `❌ Lab test FAILED!\n\nReasons:\n${failReasons.join('\n')}\n\nCertificate ID: ${certificateId}\n\nChoose an option:`;
      
      if (confirm(`${message}\n\nClick OK to VIEW certificate in browser\nClick Cancel to DOWNLOAD certificate file`)) {
        viewCertificate(certificateData);
      } else {
        downloadCertificate(certificateData);
      }
    };

    // Update batch status based on test result
    if (formData.batchId) {
      const selectedBatch = labBatches.find(b => b._id === formData.batchId);
      if (selectedBatch) {
        const newStatus = autoResult === "Pass" ? 'lab_approved' : 'lab_failed';
        console.log(`Lab Dashboard: Updating batch ${selectedBatch.batchId} status to ${newStatus}`);
        batchManager.updateBatchStatus(
          selectedBatch.batchId,
          newStatus,
          user?.name || 'Dr. Suresh Patel'
        );
        
        // Add test completion notification
        const statusMessage = autoResult === "Pass" 
          ? `✅ Batch ${selectedBatch.batchId} APPROVED and ready for manufacturing!`
          : `❌ Batch ${selectedBatch.batchId} FAILED testing and marked for rejection.`;
        
        setTimeout(() => {
          alert(statusMessage + '\n\nBatch status updated in the system.');
        }, 1000);
      }
    }

    showCertificateOptions();
    
    // Reset form and refresh batches
    setFormData({
      batchId: "",
      labName: "",
      analystId: "",
      testDate: new Date().toISOString().split("T")[0],
      moisture: "",
      ashContent: "",
      pesticide_DDT: "",
      pesticide_Chlordane: "",
      metal_Lead: "",
      metal_Cadmium: "",
      notes: "",
      result: "Pass"
    });
    setSelectedTest(null);
    
    // Refresh lab batches to remove completed ones
    setTimeout(() => {
      loadLabBatches();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-green-600 shadow-md border-b border-green-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-white">Lab Dashboard</h1>
              <span className="text-green-100 text-sm">Welcome, {user?.name || 'Lab Analyst'}</span>
              <div className="flex items-center space-x-1 text-xs">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-100">Live Updates</span>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-white hover:text-gray-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* New Batch Alert */}
        {showNewBatchAlert && (
          <div className="fixed top-20 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 animate-bounce">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🔔</span>
              <div>
                <p className="font-medium">New Batch Arrived!</p>
                <p className="text-sm">Check the testing queue below</p>
              </div>
              <button 
                onClick={() => setShowNewBatchAlert(false)}
                className="ml-2 text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        {/* User Info & Assigned Batches - Enhanced */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl mb-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                🔬
              </div>
              <h3 className="text-xl font-semibold text-blue-800">Lab Testing Queue</h3>
            </div>
            <button
              onClick={() => {
                loadLabBatches();
                alert('Batches refreshed! New batches from agents will appear here.');
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition"
            >
              🔄 Refresh Batches
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Batch Selection */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-blue-700 mb-2">
                🎯 Select Batch for Lab Testing
              </label>
              <select 
                className="w-full p-3 border-2 border-blue-300 rounded-lg bg-white text-lg font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                onChange={(e) => {
                  const selectedBatch = labBatches.find(b => b._id === e.target.value);
                  if (selectedBatch) {
                    setFormData(prev => ({ ...prev, batchId: selectedBatch._id }));
                    setSelectedTest({});
                  }
                }}
              >
                <option value="">🔍 Choose a batch to test...</option>
                {labBatches.map((batch) => (
                  <option key={batch._id} value={batch._id}>
                    ✅ {batch.batchId} | {batch.species} | {batch.quantity}kg | Farmer: {batch.farmer.name} | Agent: {batch.agentName}
                  </option>
                ))}
              </select>
              
              {labBatches.length === 0 ? (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-700 font-medium">⏳ No batches ready for testing</p>
                  <p className="text-yellow-600 text-sm mt-1">Batches will appear here when agents forward them to the lab.</p>
                </div>
              ) : (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 font-medium">📋 {labBatches.length} batches ready for testing</p>
                  <p className="text-green-600 text-sm mt-1">Select a batch above to begin quality analysis.</p>
                </div>
              )}
            </div>
            
            {/* Statistics Panel */}
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-3">📊 Lab Overview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Lab Analyst:</span>
                  <span className="font-medium">{user?.name || 'Dr. Suresh Patel'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ready for Testing:</span>
                  <span className="font-medium text-blue-600">{labBatches.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tests Completed:</span>
                  <span className="font-medium text-green-600">{userTests.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium text-green-600">
                    {labBatches.length > 0 ? 'Ready to Test' : 'Waiting for Batches'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                if (labBatches.length > 0) {
                  const firstBatch = labBatches[0];
                  setFormData(prev => ({ ...prev, batchId: firstBatch._id }));
                  setSelectedTest({});
                }
              }}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition"
              disabled={labBatches.length === 0}
            >
              ⚡ Quick Test First Batch
            </button>
            <button
              onClick={() => {
                const message = labBatches.length > 0 
                  ? `Current batches ready for testing:\n${labBatches.map(b => `• ${b.batchId} - ${b.species} (${b.quantity}kg)`).join('\n')}`
                  : 'No batches currently ready for testing.\n\nBatches will appear here when:\n1. Farmers harvest and register batches\n2. Agents collect and forward to lab\n3. System assigns batches to your lab';
                alert(message);
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition"
            >
              📋 View Queue Details
            </button>
          </div>
        </div>

        {!selectedTest && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">My Lab Tests</h2>
              <button
                onClick={() => setSelectedTest({})}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                New Test
              </button>
            </div>

            {/* Mock Tests Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userTests.map((test, index) => (
                <div
                  key={index}
                  className="bg-green-100 p-5 rounded-xl shadow-md hover:shadow-lg cursor-pointer transition transform hover:-translate-y-1"
                  onClick={() => setSelectedTest(test)}
                >
                  <h3 className="font-bold text-gray-900 text-lg">{test.batchId}</h3>
                  <p className="text-sm text-gray-800">{test.labName}</p>
                  <p className="text-xs text-gray-600 mt-1">Analyst: {test.analystId}</p>
                  <span className="inline-flex px-3 py-1 mt-3 text-sm font-medium rounded-full bg-green-100 text-green-800">
                    {test.result}
                  </span>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-blue-600">📄 Certificate: {test.certificateId}</p>
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const certData = {
                            certificateId: test.certificateId,
                            batchId: test.batchId,
                            labName: test.labName,
                            analystId: test.analystId,
                            testDate: test.testDate,
                            result: test.result,
                            moisture: '10.5',
                            ashContent: '6.2',
                            pesticide_DDT: '0.02',
                            pesticide_Chlordane: '0.01',
                            metal_Lead: '2.1',
                            metal_Cadmium: '0.15',
                            notes: 'All parameters within acceptable limits'
                          };
                          viewCertificate(certData);
                        }}
                        className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                      >
                        👁️ View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const certData = {
                            certificateId: test.certificateId,
                            batchId: test.batchId,
                            labName: test.labName,
                            analystId: test.analystId,
                            testDate: test.testDate,
                            result: test.result,
                            moisture: '10.5',
                            ashContent: '6.2',
                            pesticide_DDT: '0.02',
                            pesticide_Chlordane: '0.01',
                            metal_Lead: '2.1',
                            metal_Cadmium: '0.15',
                            notes: 'All parameters within acceptable limits'
                          };
                          downloadCertificate(certData);
                        }}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                      >
                        📥 Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTest && (
          <div className="bg-green-100 rounded-xl shadow-md p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">New Lab Test</h2>

            {/* Batch & Lab Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch</label>
                <select
                  value={formData.batchId}
                  onChange={(e) => handleInputChange("batchId", e.target.value)}
                  className="p-2 border rounded w-full"
                  required
                >
                  <option value="">Select Batch for Testing</option>
                  {labBatches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.batchId} - {b.species} ({b.quantity}kg) - Farmer: {b.farmer.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Government Lab</label>
                <select
                  value={formData.labName}
                  onChange={(e) => handleInputChange("labName", e.target.value)}
                  className="p-2 border rounded w-full"
                  required
                >
                  <option value="">Select Government Lab</option>
                  <option value="Central Drug Research Institute, Lucknow">CDRI Lucknow</option>
                  <option value="Indian Institute of Integrative Medicine, Jammu">IIIM Jammu</option>
                  <option value="National Institute of Pharmaceutical Education, Mohali">NIPER Mohali</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Analyst ID"
                value={formData.analystId}
                onChange={(e) => handleInputChange("analystId", e.target.value)}
                className="p-2 border rounded w-full"
              />
              <input
                type="date"
                value={formData.testDate}
                onChange={(e) => handleInputChange("testDate", e.target.value)}
                className="p-2 border rounded w-full"
              />
            </div>

            {/* Parameters */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moisture Content (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Max 12% for Ashwagandha"
                    value={formData.moisture}
                    onChange={(e) => handleInputChange("moisture", e.target.value)}
                    className="p-2 border rounded w-full"
                  />
                  <p className="text-xs text-gray-500">Standard: ≤12% (FAIL if &gt;12%)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ash Content (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Max 8% for Ashwagandha"
                    value={formData.ashContent}
                    onChange={(e) => handleInputChange("ashContent", e.target.value)}
                    className="p-2 border rounded w-full"
                  />
                  <p className="text-xs text-gray-500">Standard: ≤8% (FAIL if &gt;8%)</p>
                </div>
              </div>

              {/* Simplified Pesticides */}
              <div>
                <p className="font-semibold mb-2">Key Pesticide Tests (ppm)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">DDT (ppm)</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="Max 0.1 ppm"
                      value={formData.pesticide_DDT}
                      onChange={(e) => handleInputChange("pesticide_DDT", e.target.value)}
                      className="p-2 border rounded w-full"
                    />
                    <p className="text-xs text-red-500">FAIL if &gt;0.1 ppm</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chlordane (ppm)</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="Max 0.05 ppm"
                      value={formData.pesticide_Chlordane}
                      onChange={(e) => handleInputChange("pesticide_Chlordane", e.target.value)}
                      className="p-2 border rounded w-full"
                    />
                    <p className="text-xs text-red-500">FAIL if &gt;0.05 ppm</p>
                  </div>
                </div>
              </div>

              {/* Simplified Heavy Metals */}
              <div>
                <p className="font-semibold mb-2">Key Heavy Metal Tests (ppm)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lead (Pb) ppm</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Max 10 ppm"
                      value={formData.metal_Lead}
                      onChange={(e) => handleInputChange("metal_Lead", e.target.value)}
                      className="p-2 border rounded w-full"
                    />
                    <p className="text-xs text-red-500">FAIL if &gt;10 ppm</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cadmium (Cd) ppm</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Max 0.3 ppm"
                      value={formData.metal_Cadmium}
                      onChange={(e) => handleInputChange("metal_Cadmium", e.target.value)}
                      className="p-2 border rounded w-full"
                    />
                    <p className="text-xs text-red-500">FAIL if &gt;0.3 ppm</p>
                  </div>
                </div>
              </div>

              <textarea
                placeholder="Notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="p-2 border rounded w-full"
                rows={3}
              />
            </div>

            {/* Certificate Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">📄 Professional Certificate Generation</p>
              <div className="text-xs text-blue-600 mt-2 space-y-1">
                <p>✅ Government-formatted HTML certificate with QR code</p>
                <p>✅ View in browser or download as HTML file</p>
                <p>✅ Unique Certificate ID with verification URL</p>
                <p>✅ Auto-generated QR code for mobile verification</p>
                <p>✅ Pass/Fail determination based on Indian Pharmacopoeia standards</p>
              </div>
              <div className="mt-2 p-2 bg-white rounded border">
                <p className="text-xs text-gray-600">
                  <strong>Auto-Fail Conditions:</strong><br/>
                  • Moisture &gt; 12% | Ash &gt; 8%<br/>
                  • DDT &gt; 0.1 ppm | Chlordane &gt; 0.05 ppm<br/>
                  • Lead &gt; 10 ppm | Cadmium &gt; 0.3 ppm
                </p>
              </div>
              <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                <p className="text-xs text-green-700">
                  <strong>📱 QR Code Features:</strong><br/>
                  • Embedded verification QR in certificate<br/>
                  • Scannable with any mobile device<br/>
                  • Links to government verification portal
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setSelectedTest(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save & Generate Certificate
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LabDashboardSimple;