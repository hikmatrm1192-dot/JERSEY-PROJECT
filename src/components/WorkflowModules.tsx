import React from 'react';
import { WorkflowProgress } from '../types/jersey';

interface WorkflowModulesProps {
  workflow?: WorkflowProgress;
  onChange: (workflow: WorkflowProgress) => void;
}

export const WorkflowModules: React.FC<WorkflowModulesProps> = ({ workflow, onChange }) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      
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
  );
};
