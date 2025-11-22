import React, { useState, useEffect } from "react";
import { ArrowLeft, LogOut, FileText } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";

interface LabTest {
  batchId: string;
  labName: string;
  analystId: string;
  testDate: string;
  moisture: string;
  pesticide_ppm: { [chemical: string]: string };
  heavyMetals_ppm: { [metal: string]: string };
  ashContent: string;
  dnaBarcode: {
    matched: boolean;
    confidence: string;
    referenceId: string;
  };
  notes: string;
  result: "Pass" | "Fail" | "Conditional";
  failReasons?: string[];
  certificateUrl?: string;
  qrCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

const LabDashboard: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { logout } = useAuth();
  const [tests, setTests] = useState<LabTest[]>([]);
  const [batchesForTesting, setBatchesForTesting] = useState<any[]>([]);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  const emptyTest: LabTest = {
    batchId: "",
    labName: "",
    analystId: "",
    testDate: new Date().toISOString().split("T")[0],
    moisture: "",
    pesticide_ppm: {},
    heavyMetals_ppm: {},
    ashContent: "",
    dnaBarcode: { matched: true, confidence: "", referenceId: "" },
    notes: "",
    result: "Pass",
    failReasons: [],
    certificateUrl: "",
    qrCode: "",
  };

  const [formData, setFormData] = useState<LabTest>({ ...emptyTest });
  // Persist single analyst id per lab user for convenience
  useEffect(() => {
    const savedAnalyst = localStorage.getItem('labAnalystId');
    if (savedAnalyst) {
      setFormData((prev) => ({ ...prev, analystId: savedAnalyst }));
    }
  }, []);

  useEffect(() => {
    if (formData.analystId) {
      localStorage.setItem('labAnalystId', formData.analystId);
    }
  }, [formData.analystId]);

  // Fetch real lab tests on component mount
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Lab Dashboard: Starting initialization...');
        
        await fetchTests();
        console.log('Lab Dashboard: Tests fetched');
        
        await fetchReadyBatches();
        console.log('Lab Dashboard: Ready batches fetched');
        
      } catch (error: any) {
        console.error('Failed to initialize lab dashboard:', error);
        setError(`Initialization failed: ${error?.message || 'Unknown error'}`);
        setTests([]);
        setBatchesForTesting([]);
      } finally {
        setLoading(false);
        console.log('Lab Dashboard: Initialization complete');
      }
    };
    
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Lab Dashboard: Loading timeout, forcing completion');
        setLoading(false);
        setError('Loading timeout - please refresh the page');
      }
    }, 10000); // 10 second timeout
    
    initializeDashboard();
    
    return () => clearTimeout(timeoutId);
  }, []);

  const fetchTests = async () => {
    try {
      const response = await api.getLabTests();
      setTests(response.labTests || []);
    } catch (error) {
      console.error('Failed to fetch lab tests:', error);
      // Provide mock data if API fails
      setTests([]);
    }
  };

  const fetchReadyBatches = async () => {
    try {
      const res = await api.getBatchesForTesting();
      setBatchesForTesting(res.batches || []);
    } catch (e) {
      console.error('Failed to fetch ready batches:', e);
      // Provide mock data if API fails
      setBatchesForTesting([
        {
          _id: 'mock-batch-1',
          batchId: 'BATCH-DEMO123',
          species: 'Ashwagandha',
          quantity: 100,
          status: 'received'
        }
      ]);
    }
  };

  const handleInputChange = (key: keyof LabTest, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handlePesticideChange = (chem: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      pesticide_ppm: { ...prev.pesticide_ppm, [chem]: value },
    }));
  };

  const handleHeavyMetalChange = (metal: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      heavyMetals_ppm: { ...prev.heavyMetals_ppm, [metal]: value },
    }));
  };

  const handleSubmit = async () => {
    try {
      // Auto-determine PASS/FAIL based on parameters
      let autoResult = "Pass";
      let failReasons: string[] = [];

      // Check moisture (FAIL if >12%)
      const moisture = parseFloat(formData.moisture) || 0;
      if (moisture > 12) {
        autoResult = "Fail";
        failReasons.push("Moisture content exceeds 12%");
      }

      // Check ash content (FAIL if >8%)
      const ashContent = parseFloat(formData.ashContent) || 0;
      if (ashContent > 8) {
        autoResult = "Fail";
        failReasons.push("Ash content exceeds 8%");
      }

      // Check pesticides
      const pesticides = formData.pesticide_ppm;
      if (parseFloat(pesticides.DDT || '0') > 0.1) {
        autoResult = "Fail";
        failReasons.push("DDT exceeds 0.1 ppm");
      }
      if (parseFloat(pesticides.Chlordane || '0') > 0.05) {
        autoResult = "Fail";
        failReasons.push("Chlordane exceeds 0.05 ppm");
      }
      if (parseFloat(pesticides.Aldrin || '0') > 0.05) {
        autoResult = "Fail";
        failReasons.push("Aldrin exceeds 0.05 ppm");
      }
      if (parseFloat(pesticides.Heptachlor || '0') > 0.05) {
        autoResult = "Fail";
        failReasons.push("Heptachlor exceeds 0.05 ppm");
      }

      // Check heavy metals
      const metals = formData.heavyMetals_ppm;
      if (parseFloat(metals.Lead || '0') > 10) {
        autoResult = "Fail";
        failReasons.push("Lead exceeds 10 ppm");
      }
      if (parseFloat(metals.Cadmium || '0') > 0.3) {
        autoResult = "Fail";
        failReasons.push("Cadmium exceeds 0.3 ppm");
      }
      if (parseFloat(metals.Mercury || '0') > 1) {
        autoResult = "Fail";
        failReasons.push("Mercury exceeds 1 ppm");
      }
      if (parseFloat(metals.Arsenic || '0') > 3) {
        autoResult = "Fail";
        failReasons.push("Arsenic exceeds 3 ppm");
      }

      // Generate certificate URL and QR code
      const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
      const certificateUrl = `${window.location.origin}/certificate/${certificateId}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(certificateUrl)}`;

      const testData = {
        batchId: formData.batchId,
        labName: formData.labName,
        analystId: formData.analystId,
        testDate: formData.testDate,
        parameters: {
          moisture: moisture,
          pesticide_ppm: formData.pesticide_ppm,
          heavyMetals_ppm: formData.heavyMetals_ppm,
          ashContent: ashContent,
          dnaBarcode: formData.dnaBarcode
        },
        result: autoResult,
        failReasons: failReasons,
        certificateUrl: certificateUrl,
        qrCode: qrCodeUrl,
        notes: formData.notes,
        certificateId: certificateId
      };

      await api.createLabTest(testData);
      
      if (autoResult === "Pass") {
        alert(`✅ Lab test PASSED!\n\nCertificate ID: ${certificateId}\nAll parameters within acceptable limits.`);
      } else {
        alert(`❌ Lab test FAILED!\n\nReasons:\n${failReasons.join('\n')}\n\nCertificate ID: ${certificateId}`);
      }
      
      setFormData({ ...emptyTest });
      setSelectedTest(null);
      fetchTests(); // Refresh the list
    } catch (error: any) {
      alert(error?.message || 'Failed to save lab test');
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case "Pass":
        return "bg-green-100 text-green-800";
      case "Fail":
        return "bg-red-100 text-red-800";
      case "Conditional":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const downloadCertificate = (test: any) => {
    const certificateData = {
      certificateId: test.certificateId || `CERT-${Date.now()}`,
      batchId: test.batchId,
      labName: test.labName,
      analystId: test.analystId,
      testDate: test.testDate,
      result: test.result,
      parameters: test.parameters || {},
      failReasons: test.failReasons || [],
      issuedDate: new Date().toISOString()
    };

    // Create downloadable certificate content
    const certificateContent = `
GOVERNMENT OF INDIA
AYURVEDIC HERB QUALITY CERTIFICATE

Certificate ID: ${certificateData.certificateId}
Batch ID: ${certificateData.batchId}
Lab: ${certificateData.labName}
Analyst: ${certificateData.analystId}
Test Date: ${certificateData.testDate}
Result: ${certificateData.result}

PARAMETERS TESTED:
- Moisture Content: ${certificateData.parameters.moisture || 'N/A'}%
- Ash Content: ${certificateData.parameters.ashContent || 'N/A'}%
- Heavy Metals: ${JSON.stringify(certificateData.parameters.heavyMetals_ppm || {})}
- Pesticides: ${JSON.stringify(certificateData.parameters.pesticide_ppm || {})}

${certificateData.result === 'Fail' ? `FAILURE REASONS:\n${certificateData.failReasons.join('\n')}` : 'ALL PARAMETERS WITHIN ACCEPTABLE LIMITS'}

Issued Date: ${new Date(certificateData.issuedDate).toLocaleDateString()}

This is a digitally generated certificate.
Verify at: ${test.certificateUrl}
    `;

    const blob = new Blob([certificateContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certificate_${certificateData.certificateId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lab tests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-green-600 shadow-md border-b border-green-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {onBack && (
                <button onClick={onBack} className="p-2 hover:bg-green-500 rounded-lg">
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
              )}
              <h1 className="text-xl font-semibold text-white">Lab Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDebugMode(!debugMode)}
                className="text-xs bg-yellow-500 text-white px-2 py-1 rounded"
              >
                Debug: {debugMode ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-white hover:text-gray-200"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {debugMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-yellow-800 mb-2">Debug Information</h3>
            <div className="text-sm text-yellow-700 space-y-1">
              <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              <p><strong>Error:</strong> {error || 'None'}</p>
              <p><strong>Tests Count:</strong> {tests.length}</p>
              <p><strong>Batches for Testing:</strong> {batchesForTesting.length}</p>
              <p><strong>Selected Test:</strong> {selectedTest ? 'Yes' : 'No'}</p>
              <p><strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}</p>
            </div>
          </div>
        )}
        
        {!selectedTest && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">Lab Tests</h2>
              <button
                onClick={() => setSelectedTest({ ...emptyTest })}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                New Test
              </button>
            </div>
            {tests.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No lab tests yet</h3>
                <p className="text-gray-600 mb-4">Start by creating your first lab test to begin quality analysis.</p>
                <button
                  onClick={() => setSelectedTest({ ...emptyTest })}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <FileText className="w-5 h-5" />
                  <span>Create First Test</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tests.map((test) => (
                  <div
                    key={test.batchId + test.testDate}
                    className="bg-green-100 p-5 rounded-xl shadow-md hover:shadow-lg cursor-pointer transition transform hover:-translate-y-1"
                    onClick={() => setSelectedTest(test)}
                  >
                    <h3 className="font-bold text-gray-900 text-lg">{test.batchId}</h3>
                    <p className="text-sm text-gray-800">{test.labName}</p>
                    <p className="text-xs text-gray-600 mt-1">Analyst: {test.analystId}</p>
                    <span
                      className={`inline-flex px-3 py-1 mt-3 text-sm font-medium rounded-full ${getResultColor(
                        test.result
                      )}`}
                    >
                      {test.result}
                    </span>
                    {test.certificateUrl && (
                      <div className="mt-2 space-y-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadCertificate(test);
                          }}
                          className="text-xs text-blue-600 hover:underline block"
                        >
                          📄 Download Certificate
                        </button>
                        <a 
                          href={test.certificateUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-green-600 hover:underline block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          🔗 View Online
                        </a>
                      </div>
                    )}
                    {test.qrCode && (
                      <div className="mt-1">
                        <a 
                          href={test.qrCode} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-purple-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          📱 View QR Code
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTest && (
          <div className="bg-green-100 rounded-xl shadow-md p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedTest.batchId ? `Edit Test - ${selectedTest.batchId}` : "New Lab Test"}
            </h2>

            {/* Batch & Lab Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <select
                  value={formData.batchId}
                  onChange={(e) => handleInputChange("batchId", e.target.value)}
                  className="p-2 border rounded w-full"
                >
                  <option value="">Select Batch for Testing</option>
                  {batchesForTesting.map((b) => (
                    <option key={b._id} value={b._id}>{b.batchId} - {b.species} ({b.quantity}kg)</option>
                  ))}
                </select>
              </div>
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
                <option value="Central Council for Research in Ayurveda, New Delhi">CCRAS New Delhi</option>
                <option value="Regional Research Institute, Bangalore">RRI Bangalore</option>
                <option value="Pharmacopoeia Commission for Indian Medicine, Ghaziabad">PCIM Ghaziabad</option>
              </select>
              <input
                type="text"
                placeholder="Analyst ID"
                value={formData.analystId}
                onChange={(e) => handleInputChange("analystId", e.target.value)}
                className="p-2 border rounded w-full"
              />
              <input
                type="date"
                placeholder="Test Date"
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

              {/* Pesticides Table */}
              <div>
                <p className="font-semibold mb-2">Pesticide Residues (ppm) - Critical Parameters</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">DDT (ppm)</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="Max 0.1 ppm"
                      value={formData.pesticide_ppm.DDT || ''}
                      onChange={(e) => handlePesticideChange('DDT', e.target.value)}
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
                      value={formData.pesticide_ppm.Chlordane || ''}
                      onChange={(e) => handlePesticideChange('Chlordane', e.target.value)}
                      className="p-2 border rounded w-full"
                    />
                    <p className="text-xs text-red-500">FAIL if &gt;0.05 ppm</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aldrin (ppm)</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="Max 0.05 ppm"
                      value={formData.pesticide_ppm.Aldrin || ''}
                      onChange={(e) => handlePesticideChange('Aldrin', e.target.value)}
                      className="p-2 border rounded w-full"
                    />
                    <p className="text-xs text-red-500">FAIL if &gt;0.05 ppm</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heptachlor (ppm)</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="Max 0.05 ppm"
                      value={formData.pesticide_ppm.Heptachlor || ''}
                      onChange={(e) => handlePesticideChange('Heptachlor', e.target.value)}
                      className="p-2 border rounded w-full"
                    />
                    <p className="text-xs text-red-500">FAIL if &gt;0.05 ppm</p>
                  </div>
                </div>
              </div>

              {/* Heavy Metals Table */}
              <div>
                <p className="font-semibold mb-2">Heavy Metal Content (ppm) - Critical Parameters</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lead (Pb) ppm</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Max 10 ppm"
                      value={formData.heavyMetals_ppm.Lead || ''}
                      onChange={(e) => handleHeavyMetalChange('Lead', e.target.value)}
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
                      value={formData.heavyMetals_ppm.Cadmium || ''}
                      onChange={(e) => handleHeavyMetalChange('Cadmium', e.target.value)}
                      className="p-2 border rounded w-full"
                    />
                    <p className="text-xs text-red-500">FAIL if &gt;0.3 ppm</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mercury (Hg) ppm</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Max 1 ppm"
                      value={formData.heavyMetals_ppm.Mercury || ''}
                      onChange={(e) => handleHeavyMetalChange('Mercury', e.target.value)}
                      className="p-2 border rounded w-full"
                    />
                    <p className="text-xs text-red-500">FAIL if &gt;1 ppm</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Arsenic (As) ppm</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Max 3 ppm"
                      value={formData.heavyMetals_ppm.Arsenic || ''}
                      onChange={(e) => handleHeavyMetalChange('Arsenic', e.target.value)}
                      className="p-2 border rounded w-full"
                    />
                    <p className="text-xs text-red-500">FAIL if &gt;3 ppm</p>
                  </div>
                </div>
              </div>

              {/* DNA Barcode */}
              <div className="space-y-2">
                <p className="font-semibold">DNA Barcode</p>
                <label className="flex items-center space-x-2">
                  <span>Matched</span>
                  <input
                    type="checkbox"
                    checked={formData.dnaBarcode.matched}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dnaBarcode: { ...prev.dnaBarcode, matched: e.target.checked },
                      }))
                    }
                  />
                </label>
                <input
                  type="text"
                  placeholder="Confidence"
                  value={formData.dnaBarcode.confidence}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dnaBarcode: { ...prev.dnaBarcode, confidence: e.target.value },
                    }))
                  }
                  className="p-2 border rounded w-full"
                />
                <input
                  type="text"
                  placeholder="Reference ID"
                  value={formData.dnaBarcode.referenceId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dnaBarcode: { ...prev.dnaBarcode, referenceId: e.target.value },
                    }))
                  }
                  className="p-2 border rounded w-full"
                />
              </div>

              <textarea
                placeholder="Notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="p-2 border rounded w-full"
              />
            </div>

            {/* Result */}
            <div className="space-y-2">
              <label>Result:</label>
              <select
                value={formData.result}
                onChange={(e) => handleInputChange("result", e.target.value)}
                className="p-2 border rounded w-full"
              >
                <option value="Pass">Pass ✅</option>
                <option value="Fail">Fail ❌</option>
                <option value="Conditional">Conditional ⚠</option>
              </select>

              {formData.result === "Fail" && (
                <textarea
                  placeholder="Fail Reasons (comma separated)"
                  value={formData.failReasons?.join(",")}
                  onChange={(e) =>
                    handleInputChange("failReasons", e.target.value.split(","))
                  }
                  className="p-2 border rounded w-full"
                />
              )}
            </div>

            {/* Certificate & QR - Auto Generated */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">📄 Certificate & QR Code</p>
              <p className="text-xs text-blue-600 mt-1">Certificate URL and QR code will be automatically generated when you save the test results.</p>
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
                Save
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LabDashboard;