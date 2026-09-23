import React, { useState } from 'react';
import { WorkerItem, WorkerRole } from '../types/jersey';
import { formatRupiah } from '../utils/orderCalculations';
import { Users, Trash2, Plus, X, CheckCircle, Power, DollarSign } from 'lucide-react';

interface WorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  workers: WorkerItem[];
  onAddWorker: (name: string, role: WorkerRole, wagePerPiece: number) => void;
  onToggleWorkerActive: (id: number | string) => void;
  onDeleteWorker: (id: number | string) => void;
}

export const WorkerModal: React.FC<WorkerModalProps> = ({
  isOpen,
  onClose,
  workers,
  onAddWorker,
  onToggleWorkerActive,
  onDeleteWorker,
}) => {
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerRole, setNewWorkerRole] = useState<WorkerRole>('potong');
  const [newWorkerWage, setNewWorkerWage] = useState<number | ''>(1000);

  if (!isOpen) return null;

  const handleRoleChange = (role: WorkerRole) => {
    setNewWorkerRole(role);
    if (newWorkerWage === 1000 || newWorkerWage === 2500 || newWorkerWage === '') {
      setNewWorkerWage(role === 'potong' ? 1000 : 2500);
    }
  };

  const handleAdd = () => {
    const trimmed = newWorkerName.trim().toUpperCase();
    if (!trimmed) return;
    const wage = typeof newWorkerWage === 'number' ? newWorkerWage : (Number(newWorkerWage) || (newWorkerRole === 'potong' ? 1000 : 2500));
    onAddWorker(trimmed, newWorkerRole, wage);
    setNewWorkerName('');
    setNewWorkerWage(newWorkerRole === 'potong' ? 1000 : 2500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div
      id="workerModal"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 no-print animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 text-xs">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-3 border-b border-slate-200 pb-2">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Master Data Pegawai Workshop</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Box Akok Admin */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2.5 mb-3.5 text-[11px] text-indigo-950 flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Akok (Admin & Pekerja Jahit):</span>
            <p className="text-slate-600 mt-0.5">
              Akok mencatat operasional sekaligus dapat ditugaskan sebagai pekerja Jahit dengan tarif upah yang terhitung otomatis.
            </p>
          </div>
        </div>
        
        {/* Form Tambah Pegawai Baru */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 space-y-2.5">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
            ➕ Tambah Pegawai Baru:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-3">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Nama Pegawai</label>
              <input
                type="text"
                id="newWorkerName"
                value={newWorkerName}
                onChange={(e) => setNewWorkerName(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder="CONTOH: BUDI / YANTO"
                className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs uppercase outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Bagian / Keahlian</label>
              <select
                id="newWorkerRole"
                value={newWorkerRole}
                onChange={(e) => handleRoleChange(e.target.value as WorkerRole)}
                className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-semibold outline-none cursor-pointer focus:ring-1 focus:ring-indigo-500"
              >
                <option value="potong">Potong</option>
                <option value="jahit">Jahit</option>
                <option value="potong_jahit">Potong & Jahit</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Tarif Default (Rp/pcs)</label>
              <input
                type="number"
                min="0"
                value={newWorkerWage}
                onChange={(e) => setNewWorkerWage(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10) || 0))}
                placeholder="1000"
                className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500 text-center"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAdd}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simpan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Daftar Pekerja Master */}
        <div className="space-y-2 max-h-60 overflow-y-auto text-xs mb-4 pr-1">
          <div className="flex justify-between items-center">
            <p className="font-bold text-slate-500 text-[11px] uppercase tracking-wider">
              Daftar Pegawai Master ({workers.length}):
            </p>
            <span className="text-[10px] text-slate-400">
              Nonaktif tidak muncul di order baru
            </span>
          </div>
          
          <div id="masterWorkerList" className="space-y-1.5">
            {workers.length === 0 ? (
              <div className="text-slate-400 italic text-center py-4 bg-slate-50 rounded border border-dashed border-slate-200">
                Belum ada data pekerja.
              </div>
            ) : (
              workers.map((w) => {
                const isActive = w.active !== false;
                const isAkok = w.name.toUpperCase().includes('AKOK');

                const getRoleBadge = (role: WorkerRole) => {
                  switch (role) {
                    case 'potong':
                      return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">POTONG</span>;
                    case 'jahit':
                      return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">JAHIT</span>;
                    case 'potong_jahit':
                      return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">POTONG & JAHIT</span>;
                  }
                };

                return (
                  <div
                    key={w.id}
                    className={`flex justify-between items-center p-2 rounded border transition-colors ${
                      isActive
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        : 'bg-slate-100/70 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-black uppercase text-slate-800 tracking-wide">
                        {w.name}
                      </span>
                      {getRoleBadge(w.role)}
                      {isAkok && (
                        <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded">
                          Admin
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-slate-500">
                        {formatRupiah(w.wagePerPiece || (w.role === 'potong' ? 1000 : 2500))}/pcs
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Toggle Aktif / Nonaktif */}
                      <button
                        type="button"
                        onClick={() => onToggleWorkerActive(w.id)}
                        className={`text-[10px] font-bold px-2 py-0.8 rounded flex items-center gap-1 transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                        title={isActive ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan kembali'}
                      >
                        <Power className="w-3 h-3" />
                        <span>{isActive ? 'Aktif' : 'Nonaktif'}</span>
                      </button>

                      {/* Hapus Worker */}
                      <button
                        type="button"
                        onClick={() => onDeleteWorker(w.id)}
                        className="text-red-500 hover:text-red-700 font-bold p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                        title="Hapus dari master (assignment lama tetap tersimpan di order)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-bold transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
