import React from 'react';
import { Users, AlertTriangle, FileText, CheckCircle2, Scissors } from 'lucide-react';
import { WorkerItem, OrderStatus, DivisionStatus } from '../types/jersey';

interface WorkerAssignmentModuleProps {
  workers: WorkerItem[];
  assignedWorkerIds?: (number | string)[];
  orderStatus: OrderStatus;
  cuttingStatus?: DivisionStatus;
  sewingStatus?: DivisionStatus;
  workerNotes?: string;
  onToggleWorker: (id: number | string) => void;
  onChangeCuttingStatus: (status: DivisionStatus) => void;
  onChangeSewingStatus: (status: DivisionStatus) => void;
  onChangeWorkerNotes: (notes: string) => void;
  onOpenManageModal?: () => void;
}

const DIVISION_STATUS_OPTIONS: DivisionStatus[] = [
  'Belum Mulai',
  'Sedang Dikerjakan',
  'Selesai',
];

export const WorkerAssignmentModule: React.FC<WorkerAssignmentModuleProps> = ({
  workers,
  assignedWorkerIds = [],
  orderStatus,
  cuttingStatus = 'Belum Mulai',
  sewingStatus = 'Belum Mulai',
  workerNotes = '',
  onToggleWorker,
  onChangeCuttingStatus,
  onChangeSewingStatus,
  onChangeWorkerNotes,
  onOpenManageModal,
}) => {
  // Hanya tampilkan pekerja dengan status aktif (active !== false)
  const activeCutters = workers.filter(
    (w) => w.role === 'potong' && w.active !== false
  );
  const activeSewers = workers.filter(
    (w) => w.role === 'jahit' && w.active !== false
  );

  const selectedCuttersCount = activeCutters.filter((w) =>
    assignedWorkerIds.includes(w.id)
  ).length;
  const selectedSewersCount = activeSewers.filter((w) =>
    assignedWorkerIds.includes(w.id)
  ).length;

  // Awareness Warnings
  const isCuttingWarning =
    orderStatus === 'Proses Potong' && selectedCuttersCount === 0;
  const isSewingWarning =
    orderStatus === 'Proses Jahit' && selectedSewersCount === 0;

  return (
    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-6 text-xs shadow-2xs">
      {/* Header Modul */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 text-white p-1.5 rounded-lg shadow-2xs">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-black text-slate-800 text-sm tracking-wide uppercase">
              PENUGASAN PRODUKSI & TANGGUNG JAWAB BENGKEL
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              Ditentukan oleh Akok berdasarkan ketersediaan tukang potong dan jahit
            </p>
          </div>
        </div>

        {onOpenManageModal && (
          <button
            type="button"
            onClick={onOpenManageModal}
            className="no-print bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <span>⚙️ Kelola Master Pekerja</span>
          </button>
        )}
      </div>

      {/* Guide Banner jika Status "Bahan Diterima" */}
      {orderStatus === 'Bahan Diterima' && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 p-3 rounded-lg mb-4 flex items-start gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">📦 Bahan Cetak Fisik Telah Diterima: </span>
            <span>
              Silakan tentukan penanggung jawab Potong & Jahit di bawah sebelum memulai proses produksi.
            </span>
          </div>
        </div>
      )}

      {/* Awareness Warning: Potong dimulai tanpa pekerja */}
      {isCuttingWarning && (
        <div className="bg-amber-50 border-2 border-amber-400 text-amber-950 p-3 rounded-lg mb-4 flex items-start gap-2 text-xs shadow-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="font-bold">
            ⚠️ Pekerja potong belum dipilih. Silakan pilih penanggung jawab potong agar tercatat di SPK.
          </div>
        </div>
      )}

      {/* Awareness Warning: Jahit dimulai tanpa pekerja */}
      {isSewingWarning && (
        <div className="bg-amber-50 border-2 border-amber-400 text-amber-950 p-3 rounded-lg mb-4 flex items-start gap-2 text-xs shadow-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="font-bold">
            ⚠️ Pekerja jahit belum dipilih. Silakan pilih penanggung jawab jahit agar tercatat di SPK.
          </div>
        </div>
      )}

      {/* Grid 2 Divisi: Potong & Jahit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        
        {/* ✂️ DIVISI POTONG */}
        <div className="bg-white border border-blue-200 rounded-lg p-3.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-blue-100">
              <div className="flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-blue-600" />
                <h3 className="font-black text-blue-900 uppercase tracking-wide text-xs">
                  ✂️ DIVISI POTONG
                </h3>
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full font-mono">
                {selectedCuttersCount} Terpilih
              </span>
            </div>

            {/* Status Pengerjaan Divisi Potong */}
            <div className="mb-3 bg-blue-50/70 p-2.5 rounded-lg border border-blue-100 flex items-center justify-between">
              <span className="font-bold text-blue-900 text-[11px] uppercase">
                Status Pengerjaan:
              </span>
              <select
                value={cuttingStatus}
                onChange={(e) => onChangeCuttingStatus(e.target.value as DivisionStatus)}
                className={`font-bold text-xs rounded px-2 py-1 border outline-none cursor-pointer ${
                  cuttingStatus === 'Selesai'
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                    : cuttingStatus === 'Sedang Dikerjakan'
                    ? 'bg-blue-100 border-blue-300 text-blue-900'
                    : 'bg-white border-slate-300 text-slate-700'
                }`}
              >
                {DIVISION_STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* List Checkbox Pekerja Potong */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-500 font-bold block mb-1">
                Pilih Penanggung Jawab Potong (Multi-Pekerja):
              </span>
              {activeCutters.length === 0 ? (
                <div className="text-slate-400 italic text-center py-3 bg-slate-50 rounded border border-dashed border-slate-200">
                  Belum ada master pekerja potong aktif.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {activeCutters.map((w) => {
                    const isChecked = assignedWorkerIds.includes(w.id);
                    return (
                      <label
                        key={w.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-blue-100/90 border-blue-400 text-blue-950 font-bold shadow-2xs ring-1 ring-blue-300'
                            : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggleWorker(w.id)}
                          className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                        />
                        <span className="font-bold uppercase tracking-wider text-xs">
                          {w.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🧵 DIVISI JAHIT */}
        <div className="bg-white border border-emerald-200 rounded-lg p-3.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-emerald-100">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🧵</span>
                <h3 className="font-black text-emerald-900 uppercase tracking-wide text-xs">
                  🧵 DIVISI JAHIT
                </h3>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full font-mono">
                {selectedSewersCount} Terpilih
              </span>
            </div>

            {/* Status Pengerjaan Divisi Jahit */}
            <div className="mb-3 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100 flex items-center justify-between">
              <span className="font-bold text-emerald-900 text-[11px] uppercase">
                Status Pengerjaan:
              </span>
              <select
                value={sewingStatus}
                onChange={(e) => onChangeSewingStatus(e.target.value as DivisionStatus)}
                className={`font-bold text-xs rounded px-2 py-1 border outline-none cursor-pointer ${
                  sewingStatus === 'Selesai'
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                    : sewingStatus === 'Sedang Dikerjakan'
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                    : 'bg-white border-slate-300 text-slate-700'
                }`}
              >
                {DIVISION_STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* List Checkbox Pekerja Jahit */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-500 font-bold block mb-1">
                Pilih Penanggung Jawab Jahit (Multi-Pekerja):
              </span>
              {activeSewers.length === 0 ? (
                <div className="text-slate-400 italic text-center py-3 bg-slate-50 rounded border border-dashed border-slate-200">
                  Belum ada master pekerja jahit aktif.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {activeSewers.map((w) => {
                    const isChecked = assignedWorkerIds.includes(w.id);
                    return (
                      <label
                        key={w.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-emerald-100/90 border-emerald-400 text-emerald-950 font-bold shadow-2xs ring-1 ring-emerald-300'
                            : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggleWorker(w.id)}
                          className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                        />
                        <span className="font-bold uppercase tracking-wider text-xs">
                          {w.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Catatan Khusus Penugasan */}
      <div className="bg-white border border-slate-200 rounded-lg p-3">
        <label className="flex items-center gap-1.5 font-bold text-slate-700 mb-1 uppercase text-[11px]">
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span>Catatan Khusus Penugasan:</span>
        </label>
        <textarea
          rows={2}
          value={workerNotes}
          onChange={(e) => onChangeWorkerNotes(e.target.value)}
          placeholder="Contoh: Ujang potong pola badan dulu. Asep dan Deni fokus jahit kerah V-neck."
          className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-medium text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
        />
      </div>
    </div>
  );
};
