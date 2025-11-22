import React from 'react';
import { ArrowLeft, Package, MapPin, Calendar, Award, Factory, FlaskConical, User, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProductDemo: React.FC = () => {
  const navigate = useNavigate();

  // Demo product data
  const demoProduct = {
    productId: 'DEMO-PRODUCT-001',
    batch: {
      batchId: 'BATCH-DEMO123',
      species: 'Ashwagandha',
      quantity: 100,
      geoTag: { latitude: 12.9716, longitude: 77.5946 },
      createdAt: '2024-01-15T00:00:00Z',
      farmer: {
        name: 'Rajesh Kumar',
        contactNumber: '9876543210',
        farmLocation: 'Karnataka, India'
      }
    },
    labTest: {
      labName: 'Central Drug Research Institute, Lucknow',
      testDate: '2024-01-20T00:00:00Z',
      result: 'Pass',
      certificateUrl: 'https://herbal-certs.gov.in/certificate/CERT-DEMO123',
      parameters: {
        moisture: 10.5,
        ashContent: 6.2,
        heavyMetals_ppm: { Lead: 2.1, Cadmium: 0.15, Mercury: 0.3, Arsenic: 1.8 },
        pesticide_ppm: { DDT: 0.02, Chlordane: 0.01 }
      }
    },
    processing: {
      manufacturerName: 'Ayurveda Industries Ltd',
      manufacturingDate: '2024-01-25',
      expiryDate: '2026-01-25',
      productName: 'Ashwagandha Capsules',
      formulationType: 'Capsule'
    },
    timeline: [
      { step: 'Farming & Harvest', date: '2024-01-15', by: 'Rajesh Kumar', status: 'completed' },
      { step: 'Quality Collection', date: '2024-01-16', by: 'Priya Sharma (Agent)', status: 'completed' },
      { step: 'Lab Testing', date: '2024-01-20', by: 'CDRI Lucknow', status: 'completed' },
      { step: 'Manufacturing', date: '2024-01-25', by: 'Ayurveda Industries Ltd', status: 'completed' },
      { step: 'Distribution', date: '2024-01-26', by: 'Distribution Network', status: 'completed' }
    ]
  };

  const calculateDaysInProcess = () => {
    const start = new Date(demoProduct.batch.createdAt);
    const end = new Date(demoProduct.processing.manufacturingDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center space-x-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Verification</h1>
            <p className="text-sm text-gray-600">Demo Product - Scan complete ✅</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Product Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-green-100 p-3 rounded-full">
              <Package className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{demoProduct.processing.productName}</h2>
              <p className="text-gray-600">{demoProduct.processing.formulationType} • Product ID: {demoProduct.productId}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">Manufacturing</span>
              </div>
              <p className="text-gray-700">{new Date(demoProduct.processing.manufacturingDate).toLocaleDateString()}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Expiry</span>
              </div>
              <p className="text-gray-700">{new Date(demoProduct.processing.expiryDate).toLocaleDateString()}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Truck className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">Process Time</span>
              </div>
              <p className="text-gray-700">{calculateDaysInProcess()} days</p>
            </div>
          </div>
        </div>

        {/* Farm Origin */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-green-100 p-3 rounded-full">
              <User className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Farm Origin</h3>
              <p className="text-gray-600">Where your product was grown</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Farmer Details</h4>
              <p className="text-gray-700"><strong>Name:</strong> {demoProduct.batch.farmer.name}</p>
              <p className="text-gray-700"><strong>Species:</strong> {demoProduct.batch.species}</p>
              <p className="text-gray-700"><strong>Quantity:</strong> {demoProduct.batch.quantity} kg</p>
              <p className="text-gray-700"><strong>Harvest Date:</strong> {new Date(demoProduct.batch.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Location</h4>
              <div className="flex items-center space-x-2 text-gray-700">
                <MapPin className="w-4 h-4" />
                <span>{demoProduct.batch.geoTag.latitude.toFixed(4)}, {demoProduct.batch.geoTag.longitude.toFixed(4)}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Karnataka, India (Verified GPS coordinates)</p>
            </div>
          </div>
        </div>

        {/* Lab Testing */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <FlaskConical className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Quality Testing</h3>
              <p className="text-gray-600">Government lab certification</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Test Results</h4>
              <div className="flex items-center space-x-2 mb-2">
                <Award className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-600">✅ PASSED</span>
              </div>
              <p className="text-gray-700"><strong>Lab:</strong> {demoProduct.labTest.labName}</p>
              <p className="text-gray-700"><strong>Test Date:</strong> {new Date(demoProduct.labTest.testDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Parameters Tested</h4>
              <div className="space-y-1 text-sm text-gray-700">
                <p>• Moisture Content: {demoProduct.labTest.parameters.moisture}% ✅</p>
                <p>• Ash Content: {demoProduct.labTest.parameters.ashContent}% ✅</p>
                <p>• Heavy Metals: All within limits ✅</p>
                <p>• Pesticide Residues: All within limits ✅</p>
                <p>• DNA Authentication: Verified ✅</p>
              </div>
            </div>
          </div>
        </div>

        {/* Manufacturing */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-purple-100 p-3 rounded-full">
              <Factory className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Manufacturing</h3>
              <p className="text-gray-600">Processing and formulation details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Manufacturer</h4>
              <p className="text-gray-700"><strong>Company:</strong> {demoProduct.processing.manufacturerName}</p>
              <p className="text-gray-700"><strong>Product:</strong> {demoProduct.processing.productName}</p>
              <p className="text-gray-700"><strong>Type:</strong> {demoProduct.processing.formulationType}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Dates</h4>
              <p className="text-gray-700"><strong>Manufactured:</strong> {new Date(demoProduct.processing.manufacturingDate).toLocaleDateString()}</p>
              <p className="text-gray-700"><strong>Expires:</strong> {new Date(demoProduct.processing.expiryDate).toLocaleDateString()}</p>
              <p className="text-gray-700"><strong>Shelf Life:</strong> 2 years</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Product Journey Timeline</h3>
          <div className="space-y-4">
            {demoProduct.timeline.map((step, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{step.step}</span>
                    <span className="text-sm text-gray-500">{new Date(step.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600">By: {step.by}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badge */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-8 text-white text-center">
          <div className="text-6xl mb-4">🛡️</div>
          <h3 className="text-2xl font-bold mb-2">Verified Authentic Product</h3>
          <p className="text-green-100 mb-4">
            This is a demo of our blockchain-based traceability system. 
            Every step from farm to your hands is documented and certified.
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>Farm Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>Lab Tested</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>Quality Assured</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDemo;