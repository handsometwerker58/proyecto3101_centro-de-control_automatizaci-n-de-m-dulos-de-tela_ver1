
import { ProductionTask } from '../types';

/**
 * Automated Production Scheduling Core
 * 1. Line Grouping: Tasks are grouped by Line ID and sorted by Order Index.
 * 2. Sequence Lag: Same-line tasks start after (Previous End + Changeover).
 * 3. Dynamic Calculation: Duration = (Planned - Actual) / Rate.
 */
export const calculateSchedule = (tasks: ProductionTask[]): ProductionTask[] => {
  const tasksByLine: Record<string, ProductionTask[]> = {};
  
  tasks.forEach(task => {
    if (!tasksByLine[task.lineId]) tasksByLine[task.lineId] = [];
    tasksByLine[task.lineId].push(task);
  });

  const processed: ProductionTask[] = [];

  Object.keys(tasksByLine).forEach(lineId => {
    const lineTasks = tasksByLine[lineId].sort((a, b) => a.orderIndex - b.orderIndex);
    let previousEndTime: Date | null = null;

    lineTasks.forEach((task, index) => {
      const remainingQty = Math.max(0, task.plannedQty - task.actualQty);
      const durationMinutes = task.productionRate > 0 ? remainingQty / task.productionRate : 0;
      
      let startTime: Date;

      if (index === 0) {
        // First task in line uses preferred user start time
        startTime = new Date(task.preferredStartTime);
      } else if (previousEndTime) {
        // Subsequent tasks start after previous end + setup time
        const autoEarliestStart = new Date(previousEndTime.getTime() + (task.changeoverTime * 60000));
        const userPreferred = new Date(task.preferredStartTime);
        
        // Use user preferred time if it's later than the sequential auto-calculated time
        startTime = userPreferred > autoEarliestStart ? userPreferred : autoEarliestStart;
      } else {
        startTime = new Date(task.preferredStartTime);
      }

      const endTime = new Date(startTime.getTime() + (durationMinutes * 60000));
      
      let status: ProductionTask['status'] = 'pending';
      if (task.actualQty >= task.plannedQty) {
        status = 'completed';
      } else if (task.actualQty > 0) {
        status = 'in-progress';
      }

      processed.push({
        ...task,
        calculatedStartTime: startTime.toISOString(),
        calculatedEndTime: endTime.toISOString(),
        status: status
      });

      previousEndTime = endTime;
    });
  });

  return processed;
};
