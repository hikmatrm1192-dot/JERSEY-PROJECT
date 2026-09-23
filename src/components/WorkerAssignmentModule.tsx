import React from 'react';
import { WorkerItem } from '../types/jersey';

interface WorkerAssignmentModuleProps {
  workers: WorkerItem[];
  assignedWorkerIds: (number | string)[];
  onToggleWorker: (id: number | string) => void;
  onOpenManageModal?: () => void;
}

export const WorkerAssignmentModule: React.FC<WorkerAssignmentModuleProps> = ({
  workers,
  assignedWorkerIds = [],
  onToggleWorker,
  onOpenManageModal,
}) => {
  const cutterWorkers = workers.filter((w) => w.role === 'potong');
  const sewerWorkers = workers.filter((w) => w.role === 'jahit');

  const activeCuttersCount = cutterWorkers.filter((w) => assignedWorkerIds.includes(w.id)).length;
  const activeSewersCount = sewerWorkers.filter((w) => assignedWorkerIds.includes(w.id)).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs">
      
      {/* Divisi Potong */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg shadow-2xs">
        <div className="flex justify-between items-center mb-2 border-b border-blue-200 pb-2">
          <h3 className="font-black text-blue-900 uppercase flex items-center gap-1.5">
            <span>✂️ PEKERJA POTONG</span>
            <span className="text-[10px] bg-blue-200 text-blue-900 px-1.5 py-0.5 rounded font-bold">
              {activeCuttersCount} Terpilih
            </span>
          </h3>
          <span className="text-[10px] text-blue-700 font-semibold">
            Pilih penanggung jawab:
          </span>
        </div>
        
        <div id="cutterList" className="grid grid-cols-2 gap-2">
          {cutterWorkers.length === 0 ? (
            <div className="col-span-2 text-slate-400 italic text-center py-2">
              Belum ada data pekerja potong.
            </div>
          ) : (
            cutterWorkers.map((w) => {
              const isChecked = assignedWorkerIds.includes(w.id);
              return (
                <label
                  key={w.id}
                  className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-blue-100/80 border-blue-400 text-blue-950 font-bold shadow-2xs'
                      : 'bg-white border-blue-100 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleWorker(w.id)}
                    className="rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                  />
                  <span className="font-bold uppercase text-slate-800 tracking-wide text-xs">
                    {w.name}
                  </span>
                </label>
              );
            })
          )}
        </div>
      </div>

      {/* Divisi Jahit */}
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg shadow-2xs">
        <div className="flex justify-between items-center mb-2 border-b border-emerald-200 pb-2">
          <h3 className="font-black text-emerald-900 uppercase flex items-center gap-1.5">
            <span>🪡 PEKERJA JAHIT</span>
            <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-bold">
              {activeSewersCount} Terpilih
            </span>
          </h3>
          <span className="text-[10px] text-emerald-700 font-semibold">
            Pilih penanggung jawab:
          </span>
        </div>

        <div id="sewerList" className="grid grid-cols-2 gap-2">
          {sewerWorkers.length === 0 ? (
            <div className="col-span-2 text-slate-400 italic text-center py-2">
              Belum ada data pekerja jahit.
            </div>
          ) : (
            sewerWorkers.map((w) => {
              const isChecked = assignedWorkerIds.includes(w.id);
              return (
                <label
                  key={w.id}
                  className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-emerald-100/80 border-emerald-400 text-emerald-950 font-bold shadow-2xs'
                      : 'bg-white border-emerald-100 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleWorker(w.id)}
                    className="rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                  />
                  <span className="font-bold uppercase text-slate-800 tracking-wide text-xs">
                    {w.name}
                  </span>
                </label>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
