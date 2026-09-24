import React, { useState } from 'react';
import { OrderDetails, WorkerItem } from '../types/jersey';
import { formatRupiah, calculateOrderWages, calculateOrderFinances } from '../utils/orderCalculations';
import { Search, Trash2, FolderOpen, Calendar, Clock, Layers, Users, Scissors, ChevronRight } from 'lucide-react';

interface OrderListModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderDetails[];
  currentOrderId: string;
  workers: WorkerItem[];
  onSelectOrder: (id: string) => void;
  onAssignWorker: (order: OrderDetails) => void;
  onDeleteOrder: (id: string) => void;
  onNewOrder: () => void;
}

export const OrderListModal: React.FC<OrderListModalProps> = ({
  isOpen,
  onClose,
  orders,
  currentOrderId,
  workers,
  onSelectOrder,
  onAssignWorker,
  onDeleteOrder,
  onNewOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredOrders = orders.filter((o) => {
    const term = searchTerm.toLowerCase();
    const team = (o.teamName || '').toLowerCase();
    const spk = (o.spkNumber || '').toLowerCase();
    const client = (o.clientContact || '').toLowerCase();
    return team.includes(term) || spk.includes(term) || client.includes(term);
  });

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-slate-200 text-slate-800 border-slate-300';
      case 'Bahan Diterima':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Proses Potong':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Proses Jahit':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'QC Passed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Selesai':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    }
  };

  const getWorkerName = (id: number | string) => {
    const found = workers.find((w) => w.id === id);
    return found ? found.name : `Worker #${id}`;
  };

  return (
    <div
      id="orderListModal"
      className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 no-print backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-3xl w-full p-5 shadow-2xl text-xs max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex justify-between items-center border-b pb-2 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-800">
              Daftar Order / SPK Konveksi & Penugasan
            </h3>
            <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold text-[11px]">
              {orders.length} Tersimpan
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 font-bold text-base cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        {/* Toolbar Search & New Button */}
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari tim, no. SPK, atau kontak klien..."
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            />
          </div>
          <button
            onClick={() => {
              onNewOrder();
              onClose();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs text-xs"
          >
            <span>➕ Tambah Order</span>
          </button>
        </div>

        {/* List Container (#orderListContainer) */}
        <div id="orderListContainer" className="space-y-3 max-h-[65vh] overflow-y-auto mb-3 pr-1">
          {filteredOrders.length === 0 ? (
            <div className="text-slate-400 text-center py-8 border border-dashed border-slate-200 rounded-lg bg-slate-50">
              <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
              <p className="font-medium text-slate-500">
                {searchTerm ? 'Tidak ada order yang cocok dengan pencarian.' : 'Belum ada orderan yang tersimpan.'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Klik tombol "+ Tambah Order" untuk memulai SPK baru.
              </p>
            </div>
          ) : (
            filteredOrders.map((o) => {
              const isSelected = o.id === currentOrderId;
              const totalPcs = o.players ? o.players.length : 0;
              const finances = calculateOrderFinances(o);

              // Gather Potong & Jahit worker names
              const potongWorkers: string[] = [];
              const jahitWorkers: string[] = [];

              if (o.workerAssignments && o.workerAssignments.length > 0) {
                o.workerAssignments.forEach((a) => {
                  const name = a.workerName || getWorkerName(a.workerId);
                  if (a.division === 'potong') {
                    potongWorkers.push(`${name} (${a.quantity} pcs)`);
                  } else if (a.division === 'jahit') {
                    jahitWorkers.push(`${name} (${a.quantity} pcs)`);
                  }
                });
              } else if (o.assignedWorkerIds && o.assignedWorkerIds.length > 0) {
                // Fallback from legacy assignedWorkerIds
                o.assignedWorkerIds.forEach((wId) => {
                  const w = workers.find((item) => item.id === wId);
                  if (w) {
                    if (w.role === 'potong') potongWorkers.push(w.name);
                    else if (w.role === 'jahit') jahitWorkers.push(w.name);
                    else {
                      potongWorkers.push(w.name);
                      jahitWorkers.push(w.name);
                    }
                  }
                });
              }

              const hasAssignedWorkers = potongWorkers.length > 0 || jahitWorkers.length > 0;

              return (
                <div
                  key={o.id}
                  className={`p-3.5 border rounded-xl transition-all ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-300 shadow-xs ring-1 ring-indigo-400'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
                  }`}
                >
                  {/* Top Bar: SPK, Team, Status, Actions */}
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-slate-900 uppercase text-sm tracking-wide">
                        {o.teamName || 'TANPA NAMA'}
                      </span>
                      <span className="font-mono text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                        {o.spkNumber || '-'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusBadgeStyle(
                          o.status
                        )}`}
                      >
                        {o.status || 'Draft'}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] bg-indigo-600 text-white font-bold px-1.5 py-0.5 rounded">
                          Sedang Dibuka
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Button Tugaskan / Edit Pekerja */}
                      <button
                        type="button"
                        onClick={() => {
                          onAssignWorker(o);
                        }}
                        className={`px-2.5 py-1 rounded font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-2xs ${
                          hasAssignedWorkers
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'bg-amber-600 hover:bg-amber-700 text-white'
                        }`}
                        title="Tugaskan pekerja potong & jahit untuk order ini"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{hasAssignedWorkers ? 'Edit Penugasan' : 'Tugaskan Pekerja'}</span>
                      </button>

                      {/* Button Detail / Buka */}
                      <button
                        type="button"
                        onClick={() => {
                          onSelectOrder(o.id);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold rounded text-xs transition-colors cursor-pointer"
                        title="Buka detail order ini di editor utama"
                      >
                        Detail
                      </button>

                      {/* Hapus */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin menghapus SPK "${o.teamName}" (${o.spkNumber})?`)) {
                            onDeleteOrder(o.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded font-bold transition-colors cursor-pointer"
                        title="Hapus SPK ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Financial & Quantities Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white/80 p-2 rounded-lg border border-slate-200/80 mb-2 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-400 font-sans block text-[10px]">TOTAL PCS</span>
                      <span className="font-bold text-slate-800">{totalPcs} Pcs</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-sans block text-[10px]">NILAI ORDER (DARI KLIEN)</span>
                      <span className="font-bold text-blue-900">
                        {formatRupiah(finances.orderValue)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-sans block text-[10px]">TOTAL BIAYA (UPAH+OPS)</span>
                      <span className="font-bold text-rose-800">
                        {formatRupiah(finances.totalCost)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-sans block text-[10px]">LABA BERSIH</span>
                      <span className={`font-black ${finances.netProfit >= 0 ? 'text-emerald-800' : 'text-red-700'}`}>
                        {formatRupiah(finances.netProfit)}
                      </span>
                    </div>
                  </div>

                  {/* Worker Assignments Breakdown */}
                  <div className="text-[11px] pt-1 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
                    {hasAssignedWorkers ? (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-blue-700 font-bold">✂️ Potong:</span>
                          <span className="text-slate-800 font-semibold">
                            {potongWorkers.length > 0 ? potongWorkers.join(', ') : '-'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-700 font-bold">🧵 Jahit:</span>
                          <span className="text-slate-800 font-semibold">
                            {jahitWorkers.length > 0 ? jahitWorkers.join(', ') : '-'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-bold flex items-center gap-1 text-[11px]">
                        <span>⚠️ Belum ada pekerja ditugaskan</span>
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400">
                      Update: {o.updatedAt || '-'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t pt-2.5">
          <span className="text-[11px] text-slate-500">
            Total {orders.length} order tersimpan di browser
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold cursor-pointer transition-colors shadow-2xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
