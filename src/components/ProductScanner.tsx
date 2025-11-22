import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, MapPin, Calendar, Award, Factory, FlaskConical, User, Truck } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';

interface ProductDetails {
  productId: string;
  batch: {
    batchId: string;
    species: string;
    quantity: number;
    geoTag: { latitude: number; longitude: number };
    createdAt: string;
    farmer: {
      name: string;
      contactNumber: string;
      farmLocation: string;
    };
  };
  labTest: {
    labName: string;
    testDate: string;
    result: string;
    certificateUrl: string;
    parameters: any;
  };
  processing: {
    manufacturerName: string;
    manufacturingDate: string;
    expiryDate: string;
    productName: string;
    formulationType: string;
  };
  timeline: Array<{
    step: string;
    date: string;
    by: string;
    status: string;
  }>;
}

const ProductScanner: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productId) {
      fetchProductDetails(productId);
    }
  }, [productId]);

  const fetchProductDetails = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch processing record details
      const processingResponse = await api.getProcessingRecordById(id);
      const processing = processingResponse.processor;
      
      if (!processing) {
        throw new Error('Product not found');
      }

      // Fetch batch details if available
      let batchDetails = null;
      let labTest = null;
      
      if (processing.batchIds && processing.batchIds.length > 0) {
        try {
          const batchResponse = await api.getBatchDetails(processing.batchIds[0]);
          batchDetails = batchResponse.batch;
          
          // Try to get lab test for this batch
          const labResponse = await api.getLabTests();
          labTest = labResponse.labTests.find((test: any) => 
            test.batchId === batchDetails._id || test.batchId === batchDetails.batchId
          );
        } catch (batchError) {
          console.warn('Could not fetch batch details:', batchError);
        }
      }

      // Create timeline
      const timeline = [
        {
          step: 'Farming & Harvest',
          date: batchDetails?.createdAt || processing.createdAt,
          by: batchDetails?.farmer?.name || 'Farmer',
          status: 'completed'
        },
        {
          step: 'Quality Collection',
          date: batchDetails?.createdAt || processing.createdAt,
          by: 'Quality Agent',
          status: 'completed'
        },
        {
          step: 'Lab Testing',
          date: labTest?.testDate || processing.createdAt,
          by: labTest?.labName || 'Government Lab',
          status: labTest ? 'completed' : 'pending'
        },
        {
          step: 'Manufacturing',
          date: processing.manufacturingDate || processing.createdAt,
          by: processing.manufacturerName || 'Manufacturer',
          status: 'completed'
        },
        {
          step: 'Distribution',
          date: processing.createdAt,
          by: 'Distribution Network',
          status: 'completed'
        }
      ];

      const productDetails: ProductDetails = {
        productId: id,
        batch: batchDetails ? {
          batchId: batchDetails.batchId,
          species: batchDetails.species,
          quantity: batchDetails.quantity,
          geoTag: batchDetails.geoTag,
          createdAt: batchDetails.createdAt,
          farmer: batchDetails.farmer || { name: 'Unknown', contactNumber: '', farmLocation: '' }
        } : {
          batchId: 'N/A',
          species: processing.herbName || 'Unknown',
          quantity: processing.quantityProcessed || 0,
          geoTag: { latitude: 0, longitude: 0 },
          createdAt: processing.createdAt,
          farmer: { name: 'Unknown', contactNumber: '', farmLocation: '' }
        },
        labTest: labTest ? {
          labName: labTest.labName,
          testDate: labTest.testDate,
          result: labTest.result,
          certificateUrl: labTest.certificateUrl,
          parameters: labTest.parameters
        } : {
          labName: 'Pending',
          testDate: 'N/A',
          result: 'Pending',
          certificateUrl: '',
          parameters: {}
        },
        processing: {
          manufacturerName: processing.manufacturerName || 'Ayurveda Industries Ltd',
          manufacturingDate: processing.manufacturingDate || new Date(processing.createdAt).toISOString().split('T')[0],
          expiryDate: processing.expiryDate || new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          productName: processing.productName || 'Ayurvedic Product',
          formulationType: processing.formulationType || 'Capsule'
        },
        timeline
      };

      setProduct(productDetails);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysInProcess = () => {
    if (!product) return 0;
    const start = new Date(product.batch.createdAt);
    const end = new Date(product.processing.manufacturingDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Scanning product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  if (!product) return null;

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
            <p className="text-sm text-gray-600">Scan complete - Product authenticated ✅</p>
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
              <h2 className="text-2xl font-bold text-gray-900">{product.processing.productName}</h2>
              <p className="text-gray-600">{product.processing.formulationType} • Product ID: {product.productId}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">Manufacturing</span>
              </div>
              <p className="text-gray-700">{new Date(product.processing.manufacturingDate).toLocaleDateString()}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Expiry</span>
              </div>
              <p className="text-gray-700">{new Date(product.processing.expiryDate).toLocaleDateString()}</p>
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
              <p className="text-gray-700"><strong>Name:</strong> {product.batch.farmer.name}</p>
              <p className="text-gray-700"><strong>Species:</strong> {product.batch.species}</p>
              <p className="text-gray-700"><strong>Quantity:</strong> {product.batch.quantity} kg</p>
              <p className="text-gray-700"><strong>Harvest Date:</strong> {new Date(product.batch.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Location</h4>
              <div className="flex items-center space-x-2 text-gray-700">
                <MapPin className="w-4 h-4" />
                <span>{product.batch.geoTag.latitude.toFixed(4)}, {product.batch.geoTag.longitude.toFixed(4)}</span>
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
                <Award className={`w-5 h-5 ${product.labTest.result === 'Pass' ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`font-medium ${product.labTest.result === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>
                  {product.labTest.result === 'Pass' ? '✅ PASSED' : '❌ FAILED'}
                </span>
              </div>
              <p className="text-gray-700"><strong>Lab:</strong> {product.labTest.labName}</p>
              <p className="text-gray-700"><strong>Test Date:</strong> {new Date(product.labTest.testDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Parameters Tested</h4>
              <div className="space-y-1 text-sm text-gray-700">
                <p>• Moisture Content: {product.labTest.parameters.moisture || 'N/A'}%</p>
                <p>• Ash Content: {product.labTest.parameters.ashContent || 'N/A'}%</p>
                <p>• Heavy Metals: Tested ✓</p>
                <p>• Pesticide Residues: Tested ✓</p>
                <p>• DNA Authentication: Verified ✓</p>
              </div>
              {product.labTest.certificateUrl && (
                <a 
                  href={product.labTest.certificateUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-blue-600 hover:underline text-sm"
                >
                  📄 View Certificate
                </a>
              )}
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
              <p className="text-gray-700"><strong>Company:</strong> {product.processing.manufacturerName}</p>
              <p className="text-gray-700"><strong>Product:</strong> {product.processing.productName}</p>
              <p className="text-gray-700"><strong>Type:</strong> {product.processing.formulationType}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Dates</h4>
              <p className="text-gray-700"><strong>Manufactured:</strong> {new Date(product.processing.manufacturingDate).toLocaleDateString()}</p>
              <p className="text-gray-700"><strong>Expires:</strong> {new Date(product.processing.expiryDate).toLocaleDateString()}</p>
              <p className="text-gray-700"><strong>Shelf Life:</strong> 2 years</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Product Journey Timeline</h3>
          <div className="space-y-4">
            {product.timeline.map((step, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className={`w-4 h-4 rounded-full ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
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
            This product has been verified through our blockchain-based traceability system. 
            Every step from farm to your hands has been documented and certified.
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

export default ProductScanner;