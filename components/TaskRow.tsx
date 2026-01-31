
import React from 'react';
import { ProductionTask } from '../types';
import { BRANDS, SCENTS, INITIAL_LINES } from '../constants';

interface TaskRowProps {
  task: ProductionTask;
  onUpdate: (id: string, updates: Partial<ProductionTask>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
}

const TaskRow: React.FC<TaskRowProps> = ({ task, onUpdate, onDelete, onMove }) => {
  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const isCompleted = task.status === 'completed';

  return (
    <tr className={`hover:bg-slate-50 transition-all border-b border-slate-200 text-sm ${isCompleted ? 'opacity-50' : ''}`}>
      <td className="p-4">
        <div className="flex flex-col items-center">
          <button onClick={() => onMove(task.id, 'up')} className="text-slate-400 hover:text-indigo-600 p-1"><i className="fa-solid fa-chevron-up text-xs"></i></button>
          <span className="text-xs font-bold text-indigo-400">#{task.orderIndex + 1}</span>
          <button onClick={() => onMove(task.id, 'down')} className="text-slate-400 hover:text-indigo-600 p-1"><i className="fa-solid fa-chevron-down text-xs"></i></button>
        </div>
      </td>
      <td className="p-4">
        <select 
          value={task.lineId}
          onChange={(e) => onUpdate(task.id, { lineId: e.target.value })}
          className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none w-full shadow-sm text-xs font-semibold"
        >
          {INITIAL_LINES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </td>
      <td className="p-4">
        <div className="flex flex-col gap-0.5">
          <select 
            value={task.brand}
            onChange={(e) => onUpdate(task.id, { brand: e.target.value })}
            className="bg-transparent font-bold text-slate-800 outline-none w-full cursor-pointer hover:underline"
          >
            {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select 
            value={task.scent}
            onChange={(e) => onUpdate(task.id, { scent: e.target.value })}
            className="bg-transparent text-[10px] text-slate-500 font-medium outline-none w-full cursor-pointer hover:underline uppercase tracking-tight"
          >
            {SCENTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </td>
      <td className="p-4">
        <div className="flex flex-col gap-1">
          <input 
            type="number"
            value={task.plannedQty}
            onChange={(e) => onUpdate(task.id, { plannedQty: Number(e.target.value) })}
            className="w-24 border border-slate-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm font-mono text-center font-bold"
          />
          <div className="text-[9px] text-slate-400 uppercase font-black tracking-widest text-center">Plan</div>
        </div>
      </td>
      <td className="p-4">
        <div className="flex flex-col gap-1">
          <input 
            type="number"
            value={task.actualQty}
            onChange={(e) => onUpdate(task.id, { actualQty: Number(e.target.value) })}
            className="w-24 border border-indigo-100 rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none bg-indigo-50/50 font-mono text-center font-bold text-indigo-700"
          />
          <div className="text-[9px] text-indigo-400 uppercase font-black tracking-widest text-center">Actual</div>
        </div>
      </td>
      <td className="p-4 text-center">
        <div className="flex flex-col gap-1 items-center">
          <input 
            type="number"
            value={task.productionRate}
            onChange={(e) => onUpdate(task.id, { productionRate: Number(e.target.value) })}
            className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-center outline-none shadow-sm text-xs"
          />
          <div className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Rate/m</div>
        </div>
      </td>
      <td className="p-4 text-center">
        <div className="flex flex-col gap-1 items-center">
          <input 
            type="number"
            value={task.changeoverTime}
            onChange={(e) => onUpdate(task.id, { changeoverTime: Number(e.target.value) })}
            className="w-14 border border-slate-200 rounded-lg px-2 py-1 text-center outline-none shadow-sm text-xs bg-amber-50"
          />
          <div className="text-[9px] text-amber-500 uppercase font-black tracking-widest">Setup</div>
        </div>
      </td>
      <td className="p-4">
        <input 
          type="datetime-local"
          value={task.preferredStartTime.slice(0, 16)}
          onChange={(e) => onUpdate(task.id, { preferredStartTime: new Date(e.target.value).toISOString() })}
          className="border border-slate-200 rounded-lg px-2 py-1 outline-none text-[10px] bg-slate-50 font-bold"
        />
      </td>
      <td className="p-4 font-mono text-[10px]">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 text-white px-2 py-1 rounded shadow-sm w-[100px] text-center">{formatTime(task.calculatedStartTime)}</div>
          <i className="fa-solid fa-arrow-right text-slate-300"></i>
          <div className="bg-emerald-600 text-white px-2 py-1 rounded shadow-sm w-[100px] text-center">{formatTime(task.calculatedEndTime)}</div>
        </div>
      </td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider block text-center shadow-sm border ${
          task.status === 'completed' ? 'bg-emerald-500 text-white border-emerald-600' : 
          task.status === 'in-progress' ? 'bg-blue-500 text-white border-blue-600 animate-pulse' : 'bg-slate-100 text-slate-400 border-slate-200'
        }`}>
          {task.status.replace('-', ' ')}
        </span>
      </td>
      <td className="p-4 text-right">
        <button 
          onClick={() => onDelete(task.id)}
          className="text-slate-300 hover:text-red-500 transition-colors p-2"
          title="Delete Batch"
        >
          <i className="fa-solid fa-trash-can"></i>
        </button>
      </td>
    </tr>
  );
};

export default TaskRow;
