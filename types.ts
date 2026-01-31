
export enum ProductionLineStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  MAINTENANCE = 'MAINTENANCE'
}

export interface ProductionTask {
  id: string;
  lineId: string;
  brand: string;
  scent: string;
  specification: string;
  plannedQty: number; // Total units to produce
  actualQty: number; // Units already produced
  productionRate: number; // Units per minute
  changeoverTime: number; // Setup/Cleaning time in minutes
  preferredStartTime: string; // User-requested earliest start (ISO string)
  calculatedStartTime: string; // Auto-calculated actual start (ISO string)
  calculatedEndTime: string; // Auto-calculated expected finish (ISO string)
  status: 'pending' | 'in-progress' | 'completed';
  orderIndex: number; // Sequential order within a specific line
}

export interface Line {
  id: string;
  name: string;
  baseCapacity: number; // Theoretical max pods per minute
}

export interface ProductionStats {
  totalPlanned: number;
  totalActual: number;
  completionRate: number;
  activeLinesCount: number;
  estimatedRemainingTime: number; // Minutes until all tasks complete
}
