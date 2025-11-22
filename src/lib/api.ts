import type { BatchDetailsResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Farmer APIs
  registerFarmer: (data: { name: string; email: string; password: string; location: any; contact: string }) =>
    http<{ message: string; farmer: { _id: string; name: string; email: string } }>(`/api/farmer/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  addBatch: (payload: { farmerId?: string; email?: string; species: string; quantity: number; latitude: number; longitude: number; photos?: string[]; qualityScore?: number | null; useAutoGPS?: boolean }) =>
    http<{ message: string; batch: any }>(`/api/farmer/add-batch`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getFarmerBatches: (farmerId: string) => http<{ batches: any[] }>(`/api/farmer/${farmerId}/batches`),
  getFarmerByEmail: (email: string) => http<{ farmer: any }>(`/api/farmer/lookup/by-email?email=${encodeURIComponent(email)}`),

  // Agency APIs
  registerAgency: (data: { name: string; email: string; password: string; contactNumber: string; location: any }) =>
    http<{ message: string; agency: any }>(`/api/agency/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAvailableBatches: () => http<{ batches: any[] }>(`/api/agency/available-batches`),
  assignBatch: (data: { batchId: string; agencyId: string }) =>
    http<{ message: string; batch: any }>(`/api/agency/assign-batch`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAgencyBatches: (agencyId: string) => http<{ batches: any[] }>(`/api/agency/${agencyId}/batches`),
  updateBatchStatus: (batchId: string, data: { status: string; remarks?: string }) =>
    http<{ message: string; batch: any }>(`/api/agency/batch/${batchId}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Lab APIs
  getBatchesForTesting: () => http<{ batches: any[] }>(`/api/lab/batches-for-testing`),
  createLabTest: (data: any) =>
    http<{ message: string; labTest: any }>(`/api/lab/test`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getLabTests: (labName?: string) => 
    http<{ labTests: any[] }>(`/api/lab/tests${labName ? `?labName=${labName}` : ''}`),
  getLabTestById: (testId: string) => http<{ labTest: any }>(`/api/lab/test/${testId}`),
  updateLabTest: (testId: string, data: any) =>
    http<{ message: string; labTest: any }>(`/api/lab/test/${testId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Manufacturer APIs
  getBatchesForProcessing: () => http<{ batches: any[] }>(`/api/processor/batches-for-processing`),
  createProcessingRecord: (data: any) =>
    http<{ message: string; processor: any }>(`/api/processor/record`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getProcessingRecords: () => http<{ processors: any[] }>(`/api/processor/records`),
  getProcessingRecordById: (processorId: string) => http<{ processor: any }>(`/api/processor/${processorId}`),
  generateProductQR: (processorId: string) =>
    http<{ message: string; qrData: any }>(`/api/processor/${processorId}/generate-qr`, {
      method: 'POST',
    }),

  // Batch APIs
  getBatchDetails: (batchId: string) => http<BatchDetailsResponse>(`/api/batch/${batchId}`),
};

export default api;


