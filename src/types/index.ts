export interface User {
  id: string;
  email: string;
  role: 'farmer' | 'agent' | 'manufacturer';
  name: string;
  location?: string;
  farmLocation?: string;
  crops?: string;
  contact_number: string;
  organization?: string;
  licenseNumber?: string;
  createdAt: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  location?: string;
  farmLocation?: string;
  crops?: string;
  contact_number: string;
  organization?: string;
  role: 'farmer' | 'agent' | 'manufacturer';
}

export interface BatchCollection {
  id: string;
  farmer_id: string;
  species: string;
  quantity: number;
  date: string;
  gps?: {
    lat: number;
    lng: number;
  };
  photos?: string[];
  quality_check?: string;
  remarks?: string;
  temperature?: number;
  humidity?: number;
  status: 'pending_collection' | 'assigned_to_agency' | 'collected' | 'in_transit' | 'received' | 'processed';
  assigned_agency?: string;
  agency_id?: string;
}

export interface HandoffEvent {
  id: string;
  batchId: string;
  from: string;
  to: string;
  timestamp: string;
  status: 'pending' | 'completed';
}

export interface LabTest {
  id: string;
  batchId: string;
  labId: string;
  testDate: string;
  testType: string;
  parameters: {
    moisture: number;
    ash: number;
    heavyMetals: {
      lead: number;
      mercury: number;
      arsenic: number;
    };
    microbialLoad: {
      totalBacterialCount: number;
      ecoli: string;
      salmonella: string;
    };
  };
  testResult: 'passed' | 'failed';
  remarks: string;
}

export interface ProcessingRecord {
  id: string;
  batchId: string;
  processorId: string;
  processType: string;
  processDate: string;
  inputQuantity: number;
  outputQuantity: number;
  processingMethod: string;
  batchNumber: string;
  qualityGrade: string;
}

// --- Backend-integrated types ---
export interface GeoTag { latitude: number; longitude: number }

export interface FarmerRef {
  name?: string;
  contactNumber?: string;
  farmLocation?: string | GeoTag;
  crops?: string[];
}

export interface BatchDoc {
  _id: string;
  batchId: string;
  species: string;
  quantity: number;
  geoTag: GeoTag;
  status?: string;
}

export interface ProcessorRecordDoc {
  _id: string;
  createdAt?: string;
  qrCodeDataUrl?: string;
}

export interface BatchDetailsResponse {
  batch: BatchDoc & { farmer?: FarmerRef };
  processorRecords: ProcessorRecordDoc[];
  finalQR?: string;
}