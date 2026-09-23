import React, { useState } from 'react';
import { OrderDetails } from '../types/jersey';
import { Search, Trash2, FolderOpen, Calendar, Clock, Layers } from 'lucide-react';

interface OrderListModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderDetails[];
  currentOrderId: string;
  onSelectOrder: (id: string) => void;
  onDeleteOrder: (id: string) => void;
  onNewOrder: () => void;
}

export const OrderListModal: React.FC<OrderListModalProps> = ({
  isOpen,
  onClose,
  orders,
  currentOrderId,
  onSelectOrder,
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

  return (
    <div
      id="orderListModal"
      className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 no-print backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-2xl w-full p-5 shadow-2xl text-xs max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex justify-between items-center border-b pb-2 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-800">
              Daftar Order / SPK Konveksi
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
              placeholder="Cari tim, no. SPK, atau kontak..."
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            />
          </div>
          <button
            onClick={() => {
              onNewOrder();
              onClose();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <span>➕ Order Baru</span>
          </button>
        </div>

        {/* List Container (#orderListContainer) */}
        <div id="orderListContainer" className="space-y-2 max-h-80 overflow-y-auto mb-4 pr-1">
          {filteredOrders.length === 0 ? (
            <div className="text-slate-400 text-center py-8 border border-dashed border-slate-200 rounded-lg bg-slate-50">
              <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
              <p className="font-medium text-slate-500">
                {searchTerm ? 'Tidak ada order yang cocok dengan pencarian.' : 'Belum ada orderan yang tersimpan.'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Klik tombol "+ Order Baru" untuk memulai SPK baru.
              </p>
            </div>
          ) : (
            filteredOrders.map((o) => {
              const isSelected = o.id === currentOrderId;
              return (
                <div
                  key={o.id}
                  onClick={() => {
                    onSelectOrder(o.id);
                    onClose();
                  }}
                  className={`p-3 border rounded-lg cursor-pointer flex justify-between items-center transition-all ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-300 shadow-2xs ring-1 ring-indigo-400'
                      : 'bg-slate-50 border-slate-200 hover:bg-indigo-50/50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-slate-900 uppercase truncate text-sm">
                        {o.teamName || 'TANPA NAMA'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusBadgeStyle(
                          o.status
                        )}`}
                      >
                        {o.status || 'Draft'}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded">
                          Sedang Dibuka
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 font-mono">
                      <span>{o.spkNumber || '-'}</span>
                      <span>•</span>
                      <span className="font-sans font-semibold text-slate-700">
                        {o.players ? o.players.length : 0} Pcs
                      </span>
                      {o.clientContact && (
                        <>
                          <span>•</span>
                          <span className="font-sans text-slate-600">WA: {o.clientContact}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="font-sans text-[10px] text-slate-400">
                        Update: {o.updatedAt || '-'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Apakah Anda yakin ingin menghapus SPK "${o.teamName}" (${o.spkNumber})?`)) {
                          onDeleteOrder(o.id);
                        }
                      }}
                      className="text-red-600 font-bold hover:bg-red-100 px-2 py-1.5 rounded transition-colors cursor-pointer"
                      title="Hapus SPK ini"
                    >
                      ✕ Hapus
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t pt-3">
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
