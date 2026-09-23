import React from 'react';
import { OrderDetails, OrderStatus } from '../types/jersey';
import { FABRIC_OPTIONS, COLLAR_OPTIONS } from '../data/defaultOrder';

interface OrderInfoCardProps {
  order: OrderDetails;
  onChange: (field: keyof OrderDetails, value: any) => void;
}

export const OrderInfoCard: React.FC<OrderInfoCardProps> = ({ order, onChange }) => {
  return (
    <>
      {/* Detail SPK & Order Info */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 text-xs shadow-2xs">
        <div>
          <label className="block font-bold text-slate-500 mb-1 uppercase">NAMA TIM / ORDER</label>
          <input
            type="text"
            id="teamName"
            value={order.teamName}
            onChange={(e) => onChange('teamName', e.target.value.toUpperCase())}
            placeholder="FUSIXTO 2.0"
            className="w-full bg-white border border-slate-300 rounded p-1.5 font-bold text-slate-800 uppercase focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-500 mb-1 uppercase">NO. SPK</label>
          <input
            type="text"
            id="spkNo"
            value={order.spkNumber}
            readOnly
            placeholder="SPK-2026/09/001"
            className="w-full bg-slate-100 border border-slate-300 rounded p-1.5 font-mono font-bold text-slate-700 outline-none cursor-default"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-500 mb-1 uppercase">NAMA KLIEN / WA</label>
          <input
            type="text"
            id="clientContact"
            value={order.clientContact || ''}
            onChange={(e) => onChange('clientContact', e.target.value)}
            placeholder="0812..."
            className="w-full bg-white border border-slate-300 rounded p-1.5 font-semibold text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-500 mb-1 text-red-600 uppercase">DEADLINE KIRIM</label>
          <input
            type="date"
            id="deadline"
            value={order.deadlineDate}
            onChange={(e) => onChange('deadlineDate', e.target.value)}
            className="w-full bg-white border border-red-300 rounded p-1.5 font-bold text-red-600 focus:ring-1 focus:ring-red-500 outline-none cursor-pointer"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-500 mb-1 uppercase">NILAI ORDER</label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">
              Rp
            </span>
            <input
              type="number"
              id="orderValue"
              min="0"
              step="1000"
              inputMode="numeric"
              value={order.orderValue !== undefined && order.orderValue !== null ? order.orderValue : ''}
              onChange={(e) => onChange('orderValue', e.target.value === '' ? 0 : Number(e.target.value))}
              placeholder="Contoh: 8500000"
              className="w-full bg-white border border-slate-300 rounded p-1.5 pl-8 font-bold text-emerald-700 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
          {order.orderValue !== undefined && order.orderValue > 0 && (
            <span className="text-[10px] font-semibold text-emerald-600 block mt-0.5">
              Rp{Number(order.orderValue).toLocaleString('id-ID')}
            </span>
          )}
        </div>

        <div>
          <label className="block font-bold text-slate-500 mb-1 uppercase">STATUS PRODUKSI</label>
          <select
            id="orderStatus"
            value={order.status || 'Draft'}
            onChange={(e) => onChange('status', e.target.value as OrderStatus)}
            className="w-full bg-white border border-slate-300 rounded p-1.5 font-bold text-indigo-700 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer"
          >
            <option value="Draft">Draft</option>
            <option value="Bahan Diterima">Bahan Diterima</option>
            <option value="Proses Potong">Proses Potong</option>
            <option value="Proses Jahit">Proses Jahit</option>
            <option value="QC Passed">QC Passed</option>
            <option value="Selesai">Selesai / Terkirim</option>
          </select>
        </div>
      </div>

      {/* Spesifikasi Material & Pola Jahit Tambahan */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 text-xs">
        <h3 className="font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Spesifikasi Material & Pola Jahit</span>
          <span className="text-[11px] text-slate-500 font-semibold">
            ProStitch Workshop Standard
          </span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <span className="text-slate-500 block mb-1">Kain Jersey:</span>
            <select
              id="specFabric"
              value={order.fabricType}
              onChange={(e) => onChange('fabricType', e.target.value)}
              className="w-full bg-white border border-slate-300 rounded p-1 font-semibold text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              {FABRIC_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-slate-500 block mb-1">Model Leher/Kerah:</span>
            <select
              id="specCollar"
              value={order.collarType}
              onChange={(e) => onChange('collarType', e.target.value)}
              className="w-full bg-white border border-slate-300 rounded p-1 font-semibold text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              {COLLAR_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-slate-500 block mb-1">Teknik Printing:</span>
            <input
              type="text"
              id="specPrint"
              value={order.printingType}
              onChange={(e) => onChange('printingType', e.target.value)}
              placeholder="Full Print Sublimasi"
              className="w-full bg-white border border-slate-300 rounded p-1 font-semibold text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <span className="text-slate-500 block mb-1">Spesifikasi Celana:</span>
            <input
              type="text"
              value={order.pantsColor}
              onChange={(e) => onChange('pantsColor', e.target.value)}
              placeholder="Polos Non-Print + Nomor Polyflex"
              className="w-full bg-white border border-slate-300 rounded p-1 font-semibold text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>
    </>
  );
};
