import React from 'react';
import { WorkflowProgress, OrderDetails, WorkerItem } from '../types/jersey';

interface WorkflowModulesProps {
  workflow?: WorkflowProgress;
  onChange: (workflow: WorkflowProgress) => void;
  order: OrderDetails;
  workers: WorkerItem[];
}

export const WorkflowModules: React.FC<WorkflowModulesProps> = ({ workflow, onChange, order, workers }) => {
  const currentWorkflow: WorkflowProgress = workflow || {
    cutting: {
      patternCut: false,
      pantsCollarCut: false,
      specialItemsSeparated: false,
    },
    sewing: {
      bodySleeveJoined: false,
      collarElasticSewed: false,
      overdeckFinished: false,
    },
  };

  const handleToggleCutting = (key: keyof WorkflowProgress['cutting']) => {
    onChange({
      ...currentWorkflow,
      cutting: {
        ...currentWorkflow.cutting,
        [key]: !currentWorkflow.cutting[key],
      },
    });
  };

  const handleToggleSewing = (key: keyof WorkflowProgress['sewing']) => {
    onChange({
      ...currentWorkflow,
      sewing: {
        ...currentWorkflow.sewing,
        [key]: !currentWorkflow.sewing[key],
      },
    });
  };

  const potongAssignments = (order.workerAssignments || []).filter((a) => a.division === 'potong');
  const jahitAssignments = (order.workerAssignments || []).filter((a) => a.division === 'jahit');
  const getWorkerName = (id: number | string, fallback?: string) =>
    fallback || workers.find((w) => w.id === id)?.name || `Worker #${id}`;
  const potongPcs = potongAssignments.reduce((sum, a) => sum + Math.max(0, Number(a.quantity) || 0), 0);
  const jahitPcs = jahitAssignments.reduce((sum, a) => sum + Math.max(0, Number(a.quantity) || 0), 0);
  const totalPcs = order.players?.length || 0;

  // Status computation for Cutting
  const cuttingCompleted = [
    currentWorkflow.cutting.patternCut,
    currentWorkflow.cutting.pantsCollarCut,
    currentWorkflow.cutting.specialItemsSeparated,
  ].filter(Boolean).length;

  let cuttingStatusBadge = {
    label: 'MENUNGGU',
    bg: 'bg-slate-200 text-slate-700',
  };
  if (cuttingCompleted === 3) {
    cuttingStatusBadge = { label: 'SELESAI', bg: 'bg-emerald-200 text-emerald-900' };
  } else if (cuttingCompleted > 0) {
    cuttingStatusBadge = { label: 'PROSES', bg: 'bg-blue-200 text-blue-800' };
  }

  // Status computation for Sewing
  const sewingCompleted = [
    currentWorkflow.sewing.bodySleeveJoined,
    currentWorkflow.sewing.collarElasticSewed,
    currentWorkflow.sewing.overdeckFinished,
  ].filter(Boolean).length;

  let sewingStatusBadge = {
    label: 'MENUNGGU',
    bg: 'bg-slate-200 text-slate-700',
  };
  if (sewingCompleted === 3) {
    sewingStatusBadge = { label: 'SELESAI', bg: 'bg-emerald-200 text-emerald-900' };
  } else if (sewingCompleted > 0) {
    sewingStatusBadge = { label: 'PROSES', bg: 'bg-amber-200 text-amber-800' };
  }

  return (
    <div className="mb-6">
      <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="font-black text-slate-900">{order.teamName || 'TANPA NAMA TIM'}</span>
            <span className="ml-2 font-mono text-slate-500">{order.spkNumber}</span>
          </div>
          <span className="bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded font-bold">Status Order: {order.status}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
            Potong: {potongPcs}/{totalPcs} pcs
          </span>
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
            Jahit: {jahitPcs}/{totalPcs} pcs
          </span>
        </div>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
          <div className="bg-blue-50/50 rounded p-2">
            <b className="text-blue-900">Pekerja Potong:</b>{' '}
            {potongAssignments.length ? potongAssignments.map((a) => `${getWorkerName(a.workerId, a.workerName)} (${a.quantity} pcs)`).join(', ') : 'Belum ditugaskan'}
          </div>
          <div className="bg-emerald-50/50 rounded p-2">
            <b className="text-emerald-900">Pekerja Jahit:</b>{' '}
            {jahitAssignments.length ? jahitAssignments.map((a) => `${getWorkerName(a.workerId, a.workerName)} (${a.quantity} pcs)`).join(', ') : 'Belum ditugaskan'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      {/* Divisi Potong (Cutting) */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-xs shadow-2xs">
        <div className="flex justify-between items-center mb-2.5">
          <h3 className="font-bold text-blue-900 uppercase flex items-center gap-1.5">
            ✂️ Pekerjaan Divisi Potong (Cutting)
          </h3>
          <span
            id="statusPotong"
            className={`${cuttingStatusBadge.bg} px-2 py-0.5 rounded text-[10px] font-bold tracking-wide`}
          >
            {cuttingStatusBadge.label} ({cuttingCompleted}/3)
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-2 bg-white p-2 rounded border border-blue-100 hover:border-blue-300 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={currentWorkflow.cutting.patternCut}
              onChange={() => handleToggleCutting('patternCut')}
              className="accent-blue-600 rounded cursor-pointer"
            />
            <span className={currentWorkflow.cutting.patternCut ? 'line-through text-slate-400 font-medium' : 'text-slate-800 font-medium'}>
              Potong Pola Baju (Depan, Belakang, Lengan)
            </span>
          </label>

          <label className="flex items-center gap-2 bg-white p-2 rounded border border-blue-100 hover:border-blue-300 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={currentWorkflow.cutting.pantsCollarCut}
              onChange={() => handleToggleCutting('pantsCollarCut')}
              className="accent-blue-600 rounded cursor-pointer"
            />
            <span className={currentWorkflow.cutting.pantsCollarCut ? 'line-through text-slate-400 font-medium' : 'text-slate-800 font-medium'}>
              Potong Pola Celana & Kerah
            </span>
          </label>

          <label className="flex items-center gap-2 bg-white p-2 rounded border border-blue-100 hover:border-blue-300 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={currentWorkflow.cutting.specialItemsSeparated}
              onChange={() => handleToggleCutting('specialItemsSeparated')}
              className="accent-blue-600 rounded cursor-pointer"
            />
            <span className={currentWorkflow.cutting.specialItemsSeparated ? 'line-through text-slate-400 font-medium' : 'text-slate-800 font-medium'}>
              Pemisahan Item Khusus (Kiper / Tanpa Celana)
            </span>
          </label>
        </div>
      </div>

      {/* Divisi Jahit (Sewing) */}
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg text-xs shadow-2xs">
        <div className="flex justify-between items-center mb-2.5">
          <h3 className="font-bold text-emerald-900 uppercase flex items-center gap-1.5">
            🪡 Pekerjaan Divisi Jahit (Sewing)
          </h3>
          <span
            id="statusJahit"
            className={`${sewingStatusBadge.bg} px-2 py-0.5 rounded text-[10px] font-bold tracking-wide`}
          >
            {sewingStatusBadge.label} ({sewingCompleted}/3)
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-2 bg-white p-2 rounded border border-emerald-100 hover:border-emerald-300 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={currentWorkflow.sewing.bodySleeveJoined}
              onChange={() => handleToggleSewing('bodySleeveJoined')}
              className="accent-emerald-600 rounded cursor-pointer"
            />
            <span className={currentWorkflow.sewing.bodySleeveJoined ? 'line-through text-slate-400 font-medium' : 'text-slate-800 font-medium'}>
              Sambung Badan & Pasang Lengan
            </span>
          </label>

          <label className="flex items-center gap-2 bg-white p-2 rounded border border-emerald-100 hover:border-emerald-300 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={currentWorkflow.sewing.collarElasticSewed}
              onChange={() => handleToggleSewing('collarElasticSewed')}
              className="accent-emerald-600 rounded cursor-pointer"
            />
            <span className={currentWorkflow.sewing.collarElasticSewed ? 'line-through text-slate-400 font-medium' : 'text-slate-800 font-medium'}>
              Pasang Kerah/Rib & Jahit Celana/Karet
            </span>
          </label>

          <label className="flex items-center gap-2 bg-white p-2 rounded border border-emerald-100 hover:border-emerald-300 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={currentWorkflow.sewing.overdeckFinished}
              onChange={() => handleToggleSewing('overdeckFinished')}
              className="accent-emerald-600 rounded cursor-pointer"
            />
            <span className={currentWorkflow.sewing.overdeckFinished ? 'line-through text-slate-400 font-medium' : 'text-slate-800 font-medium'}>
              Overdeck & Finishing Jahitan
            </span>
          </label>
        </div>
      </div>

      </div>
    </div>
  );
};
