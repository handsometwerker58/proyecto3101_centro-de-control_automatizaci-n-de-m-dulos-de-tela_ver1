
import { Line, ProductionTask } from './types';

export const INITIAL_LINES: Line[] = [
  { id: 'L-001', name: 'Filling Line A (North)', baseCapacity: 60 },
  { id: 'L-002', name: 'Filling Line B (South)', baseCapacity: 50 },
  { id: 'L-003', name: 'Packing Line C (Express)', baseCapacity: 80 },
];

export const BRANDS = ['Tide', 'Ariel', 'Liby', 'Omo', 'Persil'];
export const SCENTS = ['Lavender Mist', 'Ocean Breeze', 'Cherry Blossom', 'Eucalyptus Fresh', 'Summer Citrus'];
export const SPECS = ['15g x 20 Units (Box)', '15g x 40 Units (Bag)', '20g x 10 Units (Travel Pack)'];

export const DEFAULT_TASK: Partial<ProductionTask> = {
  brand: BRANDS[0],
  scent: SCENTS[0],
  specification: SPECS[0],
  plannedQty: 5000,
  actualQty: 0,
  productionRate: 50,
  changeoverTime: 30,
  status: 'pending'
};
