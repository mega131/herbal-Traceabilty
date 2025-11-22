// Centralized batch management system
export interface BatchData {
  id: string;
  batchId: string;
  species: string;
  quantity: number;
  farmerName: string;
  farmerLocation: string;
  harvestDate: string;
  status: 'pending_collection' | 'assigned_to_agency' | 'collected' | 'in_transit' | 'received' | 'lab_testing' | 'lab_approved' | 'lab_failed' | 'manufacturing' | 'completed';
  gps: { lat: number; lng: number };
  createdAt: string;
  updatedAt: string;
  assignedAgent?: string;
  assignedLab?: string;
  labTestId?: string;
  manufacturerId?: string;
  productId?: string;
}

class BatchManager {
  private static instance: BatchManager;
  private batches: BatchData[] = [];
  private batchCounter = 1;

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): BatchManager {
    if (!BatchManager.instance) {
      BatchManager.instance = new BatchManager();
    }
    return BatchManager.instance;
  }

  // Generate consistent batch ID
  generateBatchId(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const counter = String(this.batchCounter++).padStart(3, '0');
    return `BATCH-${year}${month}${day}-${counter}`;
  }

  // Create new batch (Farmer)
  createBatch(batchData: Omit<BatchData, 'id' | 'batchId' | 'createdAt' | 'updatedAt' | 'status'>): BatchData {
    const batch: BatchData = {
      ...batchData,
      id: `batch_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      batchId: this.generateBatchId(),
      status: 'pending_collection',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.batches.push(batch);
    this.saveToStorage();
    return batch;
  }

  // Get batches by farmer
  getBatchesByFarmer(farmerName: string): BatchData[] {
    return this.batches.filter(batch => batch.farmerName === farmerName);
  }

  // Get batches available for agent collection
  getBatchesForAgent(): BatchData[] {
    return this.batches.filter(batch => 
      ['pending_collection', 'assigned_to_agency', 'collected', 'in_transit'].includes(batch.status)
    );
  }

  // Get batches ready for lab testing
  getBatchesForLab(): BatchData[] {
    return this.batches.filter(batch => batch.status === 'received');
  }

  // Get lab-approved batches for manufacturing
  getBatchesForManufacturing(): BatchData[] {
    return this.batches.filter(batch => batch.status === 'lab_approved');
  }

  // Update batch status
  updateBatchStatus(batchId: string, status: BatchData['status'], updatedBy?: string): boolean {
    const batch = this.batches.find(b => b.batchId === batchId);
    if (batch) {
      batch.status = status;
      batch.updatedAt = new Date().toISOString();
      
      // Assign to specific roles
      if (status === 'assigned_to_agency' && updatedBy) {
        batch.assignedAgent = updatedBy;
      }
      if (status === 'lab_testing' && updatedBy) {
        batch.assignedLab = updatedBy;
      }
      if (status === 'manufacturing' && updatedBy) {
        batch.manufacturerId = updatedBy;
      }
      
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Get all batches
  getAllBatches(): BatchData[] {
    return [...this.batches];
  }

  // Get batch by ID
  getBatchById(batchId: string): BatchData | undefined {
    return this.batches.find(b => b.batchId === batchId);
  }

  // Save to localStorage
  private saveToStorage(): void {
    localStorage.setItem('herbal_batches', JSON.stringify(this.batches));
    localStorage.setItem('herbal_batch_counter', this.batchCounter.toString());
  }

  // Load from localStorage
  private loadFromStorage(): void {
    const stored = localStorage.getItem('herbal_batches');
    const counter = localStorage.getItem('herbal_batch_counter');
    
    if (stored) {
      this.batches = JSON.parse(stored);
    }
    if (counter) {
      this.batchCounter = parseInt(counter);
    }
  }

  // Clear all data (for testing)
  clearAllData(): void {
    this.batches = [];
    this.batchCounter = 1;
    localStorage.removeItem('herbal_batches');
    localStorage.removeItem('herbal_batch_counter');
  }
}

export default BatchManager;