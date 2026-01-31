
import React, { useState, useEffect, useMemo } from 'react';
import { ProductionTask, ProductionStats } from './types';
import { INITIAL_LINES, DEFAULT_TASK, BRANDS, SCENTS } from './constants';
import { calculateSchedule } from './services/scheduler';
import TaskRow from './components/TaskRow';

const StatCard: React.FC<{ label: string; value: string | number; sub?: string; color?: string; icon: string }> = ({ label, value, sub, color = "text-white", icon }) => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl flex flex-col gap-2 min-w-[180px]">
    <div className="flex justify-between items-center">
      <div className="text-[10px] uppercase font-black text-indigo-300 tracking-[0.2em]">{label}</div>
      <i className={`fa-solid ${icon} text-white/20`}></i>
    </div>
    <div className={`text-3xl font-black ${color} flex items-baseline gap-1`}>
      {value}
      {sub && <span className="text-xs font-medium opacity-60 ml-1">{sub}</span>}
    </div>
  </div>
);

const App: React.FC = () => {
  const [tasks, setTasks] = useState<ProductionTask[]>([]);

  useEffect(() => {
    // Standard initial load for a manufacturing environment
    const initialTasks: ProductionTask[] = [
      {
        ...DEFAULT_TASK as ProductionTask,
        id: 'task-alpha',
        lineId: INITIAL_LINES[0].id,
        brand: 'Tide',
        scent: 'Lavender Mist',
        plannedQty: 10000,
        actualQty: 1500,
        productionRate: 50,
        changeoverTime: 0,
        orderIndex: 0,
        preferredStartTime: new Date().toISOString(),
      },
      {
        ...DEFAULT_TASK as ProductionTask,
        id: 'task-beta',
        lineId: INITIAL_LINES[0].id,
        brand: 'Omo',
        scent: 'Summer Citrus',
        plannedQty: 12000,
        actualQty: 0,
        productionRate: 60,
        changeoverTime: 45,
        orderIndex: 1,
        preferredStartTime: new Date().toISOString(),
      },
      {
        ...DEFAULT_TASK as ProductionTask,
        id: 'task-gamma',
        lineId: INITIAL_LINES[1].id,
        brand: 'Ariel',
        scent: 'Ocean Breeze',
        plannedQty: 8000,
        actualQty: 0,
        productionRate: 40,
        changeoverTime: 0,
        orderIndex: 0,
        preferredStartTime: new Date().toISOString(),
      }
    ];
    setTasks(calculateSchedule(initialTasks));
  }, []);

  const stats = useMemo<ProductionStats>(() => {
    const totalPlanned = tasks.reduce((acc, t) => acc + t.plannedQty, 0);
    const totalActual = tasks.reduce((acc, t) => acc + t.actualQty, 0);
    const activeLines = new Set(tasks.filter(t => t.status === 'in-progress').map(t => t.lineId)).size;
    
    let totalRemaining = 0;
    tasks.forEach(t => {
      if (t.status !== 'completed') {
        const start = new Date(t.calculatedStartTime).getTime();
        const end = new Date(t.calculatedEndTime).getTime();
        totalRemaining += (end - start) / 60000;
      }
    });

    return {
      totalPlanned,
      totalActual,
      completionRate: totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0,
      activeLinesCount: activeLines,
      estimatedRemainingTime: Math.round(totalRemaining)
    };
  }, [tasks]);

  const addTask = () => {
    const lineId = INITIAL_LINES[0].id;
    const sameLineTasks = tasks.filter(t => t.lineId === lineId);
    const nextOrder = sameLineTasks.length;
    const lastOnLine = sameLineTasks.sort((a,b) => b.orderIndex - a.orderIndex)[0];

    const newTask: ProductionTask = {
      ...(DEFAULT_TASK as ProductionTask),
      id: `batch-${Date.now()}`,
      lineId: lineId,
      orderIndex: nextOrder,
      preferredStartTime: lastOnLine ? lastOnLine.calculatedEndTime : new Date().toISOString(),
    };
    setTasks(calculateSchedule([...tasks, newTask]));
  };

  const updateTask = (id: string, updates: Partial<ProductionTask>) => {
    const updated = tasks.map(t => t.id === id ? { ...t, ...updates } : t);
    setTasks(calculateSchedule(updated));
  };

  const deleteTask = (id: string) => {
    const filtered = tasks.filter(t => t.id !== id);
    const recalibrated = filtered.map((t, idx) => ({ ...t })); // Simple cleanup
    setTasks(calculateSchedule(recalibrated));
  };

  const moveTask = (id: string, direction: 'up' | 'down') => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const lineTasks = tasks.filter(t => t.lineId === task.lineId).sort((a,b) => a.orderIndex - b.orderIndex);
    const currentIndex = lineTasks.findIndex(t => t.id === id);
    
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === lineTasks.length - 1) return;

    const targetIdx = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const otherTask = lineTasks[targetIdx];

    const updated = tasks.map(t => {
      if (t.id === id) return { ...t, orderIndex: otherTask.orderIndex };
      if (t.id === otherTask.id) return { ...t, orderIndex: task.orderIndex };
      return t;
    });

    setTasks(calculateSchedule(updated));
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Executive Header */}
      <header className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-8 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[150px] opacity-10 -translate-y-1/2 translate-x-1/2"></div>
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-6">
              <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-4 rounded-[2rem] shadow-2xl border border-white/20">
                <i className="fa-solid fa-microchip text-4xl text-white"></i>
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight flex flex-col leading-tight">
                  <span className="text-white">COMMAND CENTER</span>
                  <span className="text-indigo-400 text-lg font-bold tracking-[0.4em] uppercase">Laundry Pod Automation</span>
                </h1>
                <div className="mt-2 flex items-center gap-4">
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    Systems Operational
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
              <StatCard label="Total Plan" value={stats.totalPlanned.toLocaleString()} sub="PCS" icon="fa-bullseye" />
              <StatCard label="Live Output" value={stats.totalActual.toLocaleString()} color="text-indigo-300" sub="PCS" icon="fa-chart-simple" />
              <StatCard label="Efficiency" value={`${stats.completionRate.toFixed(1)}%`} color="text-emerald-400" icon="fa-bolt" />
              <StatCard label="Rem. Work" value={stats.estimatedRemainingTime} sub="MINS" color="text-amber-400" icon="fa-hourglass-half" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 container mx-auto py-10 px-6">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-200/60 overflow-hidden">
          <div className="px-8 py-6 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/60 flex flex-wrap justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={addTask}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-sm tracking-wider uppercase transition-all shadow-xl shadow-indigo-200 flex items-center gap-3 active:scale-95 group"
              >
                <i className="fa-solid fa-plus-circle group-hover:rotate-90 transition-transform"></i> Add Production Batch
              </button>
              <div className="h-12 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-2">Active Lines:</span>
                <div className="flex -space-x-3">
                  {INITIAL_LINES.map((line, i) => (
                    <div key={line.id} title={line.name} className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-md cursor-help ${['bg-indigo-500', 'bg-blue-500', 'bg-slate-800'][i]}`}>
                      {line.id.split('-')[1]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4 px-5 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <i className="fa-solid fa-sync text-indigo-500 animate-spin-slow"></i>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Auto-Scheduler Sync Enabled</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/30 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="p-6 w-16 text-center">SEQ</th>
                  <th className="p-6">Production Line</th>
                  <th className="p-6">Brand & Scent Profile</th>
                  <th className="p-6">Planned Qty</th>
                  <th className="p-6">Actual Qty</th>
                  <th className="p-6 text-center">Efficiency</th>
                  <th className="p-6 text-center">Setup</th>
                  <th className="p-6">Preferred Start</th>
                  <th className="p-6">Optimized Timeline</th>
                  <th className="p-6 text-center">Run Status</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.length > 0 ? (
                  tasks
                    .sort((a,b) => a.lineId.localeCompare(b.lineId) || a.orderIndex - b.orderIndex)
                    .map(task => (
                      <TaskRow 
                        key={task.id} 
                        task={task} 
                        onUpdate={updateTask} 
                        onDelete={deleteTask} 
                        onMove={moveTask}
                      />
                    ))
                ) : (
                  <tr>
                    <td colSpan={11} className="py-40 text-center">
                      <div className="flex flex-col items-center gap-6 opacity-40">
                        <div className="w-32 h-32 bg-slate-100 rounded-[3rem] flex items-center justify-center text-slate-300 text-5xl">
                          <i className="fa-solid fa-layer-group"></i>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xl font-black text-slate-400 tracking-tight">Zero Batches Scheduled</p>
                          <p className="text-xs uppercase font-bold tracking-widest">Initialize a new production row to begin tracking.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
              Data Transmission Frequency: 2s Interval
            </div>
            <div className="flex gap-8">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span> Run</span>
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span> Done</span>
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-slate-300 rounded-full"></span> Queue</span>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="py-12 text-center">
        <div className="flex justify-center gap-8 mb-4">
          <i className="fa-solid fa-shield-halved text-slate-300 text-xl"></i>
          <i className="fa-solid fa-server text-slate-300 text-xl"></i>
          <i className="fa-solid fa-network-wired text-slate-300 text-xl"></i>
        </div>
        <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em]">
          INTELLIGENT MANUFACTURING OS v3.2.1-PRODUCTION
        </div>
        <div className="mt-2 text-slate-400/60 text-[9px] font-bold">
          SECURE ENCRYPTED ENVIRONMENT &copy; 2024 GLOBAL FMCG SYSTEMS
        </div>
      </footer>
    </div>
  );
};

export default App;
