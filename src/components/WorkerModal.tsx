import React, { useState } from 'react';
import { WorkerItem } from '../types/jersey';
import { Users, Trash2, Plus, X } from 'lucide-react';

interface WorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  workers: WorkerItem[];
  onAddWorker: (name: string, role: 'potong' | 'jahit') => void;
  onDeleteWorker: (id: number | string) => void;
}

export const WorkerModal: React.FC<WorkerModalProps> = ({
  isOpen,
  onClose,
  workers,
  onAddWorker,
  onDeleteWorker,
}) => {
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerRole, setNewWorkerRole] = useState<'potong' | 'jahit'>('potong');

  if (!isOpen) return null;

  const handleAdd = () => {
    const trimmed = newWorkerName.trim().toUpperCase();
    if (!trimmed) return;
    onAddWorker(trimmed, newWorkerRole);
    setNewWorkerName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div
      id="workerModal"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 no-print"
    >
      <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-3 border-b border-slate-200 pb-2">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Kelola Master Data Pekerja</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Input Pekerja Baru */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            id="newWorkerName"
            value={newWorkerName}
            onChange={(e) => setNewWorkerName(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder="Nama Pekerja"
            className="border border-slate-300 rounded p-1.5 text-xs flex-1 uppercase outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <select
            id="newWorkerRole"
            value={newWorkerRole}
            onChange={(e) => setNewWorkerRole(e.target.value as 'potong' | 'jahit')}
            className="border border-slate-300 rounded p-1.5 text-xs font-semibold outline-none cursor-pointer focus:ring-1 focus:ring-indigo-500"
          >
            <option value="potong">Potong</option>
            <option value="jahit">Jahit</option>
          </select>
          <button
            type="button"
            onClick={handleAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah</span>
          </button>
        </div>

        {/* Daftar Pekerja Master */}
        <div className="space-y-2 max-h-64 overflow-y-auto text-xs mb-4 pr-1">
          <p className="font-bold text-slate-500 text-[11px] uppercase tracking-wider">
            Daftar Pekerja Master ({workers.length}):
          </p>
          
          <div id="masterWorkerList" className="space-y-1.5">
            {workers.length === 0 ? (
              <div className="text-slate-400 italic text-center py-4 bg-slate-50 rounded border border-dashed border-slate-200">
                Belum ada data pekerja.
              </div>
            ) : (
              workers.map((w) => (
                <div
                  key={w.id}
                  className="flex justify-between items-center bg-slate-50 hover:bg-slate-100 p-2 rounded border border-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-black uppercase text-slate-800 tracking-wide">
                      {w.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        w.role === 'potong'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {w.role.toUpperCase()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteWorker(w.id)}
                    className="text-red-500 hover:text-red-700 font-bold flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>✕ Hapus</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-bold transition-colors"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
