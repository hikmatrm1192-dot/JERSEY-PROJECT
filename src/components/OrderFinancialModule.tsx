import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Scissors,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Receipt,
  Users,
  AlertCircle,
  PackageCheck
} from 'lucide-react';
import { OrderDetails, OperationalCost, WorkerAssignment } from '../types/jersey';
import {
  calculateOrderFinances,
  formatRupiah,
  OPERATIONAL_COST_CATEGORIES
} from '../utils/orderCalculations';

interface OrderFinancialModuleProps {
  order: OrderDetails;
  onOpenAssignModal: () => void;
  onAddOperationalCost: (cost: Omit<OperationalCost, 'id'>) => void;
  onUpdateOperationalCost: (id: string, cost: Partial<OperationalCost>) => void;
  onDeleteOperationalCost: (id: string) => void;
  onUpdateOrderValue?: (value: number) => void;
}

export const OrderFinancialModule: React.FC<OrderFinancialModuleProps> = ({
  order,
  onOpenAssignModal,
  onAddOperationalCost,
  onUpdateOperationalCost,
  onDeleteOperationalCost,
  onUpdateOrderValue,
}) => {
  // Modal / Form state for Add/Edit Operational Cost
  const [isAddingCost, setIsAddingCost] = useState(false);
  const [editingCostId, setEditingCostId] = useState<string | null>(null);

  // Form fields
  const [category, setCategory] = useState<string>('Packaging');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [amountStr, setAmountStr] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Quick edit for Nilai Order
  const [isEditingOrderValue, setIsEditingOrderValue] = useState(false);
  const [tempOrderValue, setTempOrderValue] = useState<string>(
    order.orderValue !== undefined ? String(order.orderValue) : '0'
  );

  const finances = calculateOrderFinances(order);
  const operationalCosts = order.operationalCosts ?? [];
  const assignments = order.workerAssignments ?? [];

  const potongAssignments = assignments.filter((a) => a.division === 'potong');
  const jahitAssignments = assignments.filter((a) => a.division === 'jahit');

  // Reset form
  const resetForm = () => {
    setCategory('Packaging');
    setCustomCategory('');
    setDescription('');
    setAmountStr('');
    setFormError(null);
    setIsAddingCost(false);
    setEditingCostId(null);
  };

  // Open add form
  const handleOpenAdd = () => {
    resetForm();
    setIsAddingCost(true);
  };

  // Open edit form
  const handleStartEdit = (cost: OperationalCost) => {
    setEditingCostId(cost.id);
    const isStandard = (OPERATIONAL_COST_CATEGORIES as readonly string[]).includes(cost.category);
    if (isStandard) {
      setCategory(cost.category);
      setCustomCategory('');
    } else {
      setCategory('Lain-lain');
      setCustomCategory(cost.category);
    }
    setDescription(cost.description || '');
    setAmountStr(String(cost.amount));
    setFormError(null);
    setIsAddingCost(false);
  };

  // Save cost (Add or Edit)
  const handleSaveCost = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = category === 'Lain-lain' && customCategory.trim() ? customCategory.trim() : category;

    if (!finalCategory.trim()) {
      setFormError('Pilih atau isi kategori biaya.');
      return;
    }

    const numAmount = Number(amountStr);
    if (amountStr === '' || isNaN(numAmount) || numAmount < 0) {
      setFormError('Nominal biaya harus berupa angka valid (minimal Rp0).');
      return;
    }

    if (editingCostId) {
      onUpdateOperationalCost(editingCostId, {
        category: finalCategory,
        description: description.trim(),
        amount: numAmount,
      });
    } else {
      onAddOperationalCost({
        category: finalCategory,
        description: description.trim(),
        amount: numAmount,
      });
    }

    resetForm();
  };

  // Handle save edited order value
  const handleSaveOrderValue = () => {
    const num = Number(tempOrderValue);
    if (!isNaN(num) && num >= 0 && onUpdateOrderValue) {
      onUpdateOrderValue(num);
    }
    setIsEditingOrderValue(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 mb-6 text-xs shadow-2xs">
      
      {/* Header Modul Keuangan */}
      <div className="flex flex-wrap justify-between items-center gap-3 pb-4 mb-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-600 text-white p-2 rounded-lg shadow-2xs">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-slate-900 text-sm md:text-base tracking-wide uppercase">
              RINCIAN KEUANGAN
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              Workshop Control Keuangan — Pemasukan Maklun, Biaya Produksi Upah, Biaya Operasional, & Laba Bersih
            </p>
          </div>
        </div>

        {/* SPK Badge */}
        <div className="flex items-center gap-2">
          <span className="font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-bold border border-slate-200">
            {order.spkNumber}
          </span>
          <span className="font-black text-slate-800 uppercase px-2 py-1 bg-slate-50 rounded border border-slate-200">
            {order.teamName}
          </span>
        </div>
      </div>

      {/* Grid 3 Kolom Komponen Keuangan: Pemasukan, Biaya Upah, Biaya Operasional */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        
        {/* 1. PEMASUKAN: NILAI ORDER */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h3 className="font-black text-slate-800 uppercase text-xs tracking-wider">
                  PEMASUKAN
                </h3>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Dari Klien
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 mb-2">
              <div className="flex justify-between items-start">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Nilai Order</span>
                {onUpdateOrderValue && !isEditingOrderValue && (
                  <button
                    type="button"
                    onClick={() => {
                      setTempOrderValue(String(order.orderValue ?? 0));
                      setIsEditingOrderValue(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] flex items-center gap-0.5 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Ubah</span>
                  </button>
                )}
              </div>

              {isEditingOrderValue ? (
                <div className="mt-2 space-y-2">
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={tempOrderValue}
                      onChange={(e) => setTempOrderValue(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 bg-white border border-indigo-400 rounded text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-1.5 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsEditingOrderValue(false)}
                      className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[11px] font-bold cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveOrderValue}
                      className="px-2.5 py-1 bg-indigo-600 text-white rounded text-[11px] font-bold cursor-pointer"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-1">
                  <div className="text-lg md:text-xl font-black font-mono text-emerald-700">
                    {formatRupiah(finances.orderValue)}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Tarif total jasa maklun jahit untuk {order.players?.length || 0} pcs jersey.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-2.5 text-[11px] text-emerald-900 font-medium flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Kain & sablon print siap jahit disediakan langsung oleh klien.</span>
          </div>
        </div>

        {/* 2. BIAYA PRODUKSI: UPAH PEKERJA */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
              <div className="flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-blue-600" />
                <h3 className="font-black text-slate-800 uppercase text-xs tracking-wider">
                  BIAYA PRODUKSI (UPAH)
                </h3>
              </div>
              <button
                type="button"
                onClick={onOpenAssignModal}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <Users className="w-3 h-3" />
                <span>Atur Pekerja</span>
              </button>
            </div>

            {/* Upah Potong */}
            <div className="bg-white p-2.5 rounded-lg border border-blue-100 mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-blue-900 uppercase text-[11px] flex items-center gap-1">
                  <span>✂️ Upah Potong</span>
                </span>
                <span className="font-black font-mono text-blue-900 text-xs">
                  {formatRupiah(finances.cuttingWage)}
                </span>
              </div>
              {potongAssignments.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">Belum ada pekerja potong ditugaskan</p>
              ) : (
                <div className="space-y-1 mt-1 text-[11px]">
                  {potongAssignments.map((a, idx) => (
                    <div key={`${a.workerId}-${idx}`} className="flex justify-between text-slate-600">
                      <span>• {a.workerName || `Worker #${a.workerId}`}: {a.quantity} pcs × {formatRupiah(a.wagePerPiece)}</span>
                      <span className="font-mono font-bold text-slate-800">{formatRupiah(a.totalWage)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upah Jahit */}
            <div className="bg-white p-2.5 rounded-lg border border-emerald-100 mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-emerald-900 uppercase text-[11px] flex items-center gap-1">
                  <span>🧵 Upah Jahit</span>
                </span>
                <span className="font-black font-mono text-emerald-900 text-xs">
                  {formatRupiah(finances.sewingWage)}
                </span>
              </div>
              {jahitAssignments.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">Belum ada pekerja jahit ditugaskan</p>
              ) : (
                <div className="space-y-1 mt-1 text-[11px]">
                  {jahitAssignments.map((a, idx) => {
                    const isAkok = (a.workerName || '').toUpperCase().includes('AKOK');
                    return (
                      <div key={`${a.workerId}-${idx}`} className="flex justify-between text-slate-600">
                        <span>
                          • {a.workerName || `Worker #${a.workerId}`}
                          {isAkok && <span className="ml-1 text-[9px] bg-indigo-100 text-indigo-800 font-bold px-1 rounded">Admin</span>}
                          : {a.quantity} pcs × {formatRupiah(a.wagePerPiece)}
                        </span>
                        <span className="font-mono font-bold text-slate-800">{formatRupiah(a.totalWage)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Subtotal Biaya Upah */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2.5 flex justify-between items-center">
            <span className="font-bold text-indigo-900 uppercase text-[11px]">
              Total Biaya Upah:
            </span>
            <span className="font-black font-mono text-indigo-900 text-sm">
              {formatRupiah(finances.totalWage)}
            </span>
          </div>
        </div>

        {/* 3. BIAYA OPERASIONAL */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
              <div className="flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-amber-600" />
                <h3 className="font-black text-slate-800 uppercase text-xs tracking-wider">
                  BIAYA OPERASIONAL
                </h3>
              </div>
              {!isAddingCost && editingCostId === null && (
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Tambah Biaya</span>
                </button>
              )}
            </div>

            {/* Form Tambah / Edit Biaya Operasional */}
            {(isAddingCost || editingCostId !== null) && (
              <form onSubmit={handleSaveCost} className="bg-white border-2 border-amber-300 rounded-lg p-3 mb-3 shadow-xs">
                <div className="flex justify-between items-center mb-2 pb-1 border-b border-amber-100">
                  <span className="font-bold text-amber-900 text-xs">
                    {editingCostId ? '✏️ Edit Biaya Operasional' : '➕ Tambah Biaya Operasional'}
                  </span>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {formError && (
                  <div className="mb-2 bg-red-50 text-red-700 p-1.5 rounded text-[11px] font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                      Kategori Biaya
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      {OPERATIONAL_COST_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {category === 'Lain-lain' && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                        Kategori Kustom
                      </label>
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Contoh: Plastik Klip Tebal"
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                      Keterangan / Catatan (Opsional)
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Contoh: Kardus packing 24 pcs + lakban"
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                      Nominal Biaya (Rp)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">
                        Rp
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={amountStr}
                        onChange={(e) => setAmountStr(e.target.value)}
                        placeholder="500000"
                        className="w-full pl-8 pr-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    {amountStr !== '' && !isNaN(Number(amountStr)) && Number(amountStr) >= 0 && (
                      <span className="text-[10px] text-amber-700 font-bold block mt-0.5">
                        {formatRupiah(Number(amountStr))}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingCostId ? 'Simpan' : 'Tambah'}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* List Biaya Operasional */}
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {operationalCosts.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 rounded-lg p-3 text-center text-slate-400 italic">
                  Belum ada biaya operasional untuk order ini.
                </div>
              ) : (
                operationalCosts.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white border border-slate-200 p-2 rounded-lg flex items-center justify-between gap-2 transition-all hover:border-slate-300"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-1.5 py-0.2 rounded font-sans">
                          {c.category}
                        </span>
                        {c.description && (
                          <span className="text-slate-600 truncate text-[11px]" title={c.description}>
                            {c.description}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-black text-slate-800 text-xs">
                        {formatRupiah(c.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(c)}
                        className="text-slate-400 hover:text-indigo-600 p-0.5 transition-colors cursor-pointer"
                        title="Edit biaya"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Hapus biaya operasional "${c.category}" (${formatRupiah(c.amount)})?`)) {
                            onDeleteOperationalCost(c.id);
                          }
                        }}
                        className="text-slate-400 hover:text-red-600 p-0.5 transition-colors cursor-pointer"
                        title="Hapus biaya"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Subtotal Biaya Operasional */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex justify-between items-center mt-3">
            <span className="font-bold text-amber-900 uppercase text-[11px]">
              Total Biaya Operasional:
            </span>
            <span className="font-black font-mono text-amber-900 text-sm">
              {formatRupiah(finances.totalOperationalCost)}
            </span>
          </div>
        </div>

      </div>

      {/* 4. RINGKASAN KEUANGAN: NILAI ORDER, TOTAL BIAYA, LABA BERSIH */}
      <div className="border-t border-slate-200 pt-4">
        <h4 className="font-black text-slate-800 uppercase tracking-wider text-xs mb-3 flex items-center gap-1.5">
          <span>📊 RINGKASAN KEUANGAN ORDER</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Card 1: Nilai Order */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-blue-900 uppercase text-[11px]">Nilai Order</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded font-mono">
                Pemasukan
              </span>
            </div>
            <div className="text-xl md:text-2xl font-black font-mono text-blue-950 mt-1">
              {formatRupiah(finances.orderValue)}
            </div>
            <p className="text-[10px] text-blue-800/80 mt-1">
              Klien: {order.clientContact || 'Kontak belum diisi'}
            </p>
          </div>

          {/* Card 2: Total Biaya */}
          <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-rose-900 uppercase text-[11px]">Total Biaya</span>
              <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded font-mono">
                Pengeluaran
              </span>
            </div>
            <div className="text-xl md:text-2xl font-black font-mono text-rose-950 mt-1">
              {formatRupiah(finances.totalCost)}
            </div>
            <p className="text-[10px] text-rose-800/80 mt-1">
              Upah ({formatRupiah(finances.totalWage)}) + Operasional ({formatRupiah(finances.totalOperationalCost)})
            </p>
          </div>

          {/* Card 3: Laba Bersih */}
          <div
            className={`border rounded-xl p-3.5 flex flex-col justify-between ${
              finances.netProfit >= 0
                ? 'bg-emerald-50 border-emerald-300'
                : 'bg-red-50 border-red-300'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span
                className={`font-black uppercase text-[11px] ${
                  finances.netProfit >= 0 ? 'text-emerald-950' : 'text-red-950'
                }`}
              >
                Laba Bersih
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                  finances.netProfit >= 0
                    ? 'bg-emerald-200 text-emerald-900'
                    : 'bg-red-200 text-red-900'
                }`}
              >
                {finances.netProfit >= 0 ? 'Profit Bersih' : 'Defisit'}
              </span>
            </div>
            <div
              className={`text-xl md:text-2xl font-black font-mono mt-1 ${
                finances.netProfit >= 0 ? 'text-emerald-800' : 'text-red-800'
              }`}
            >
              {formatRupiah(finances.netProfit)}
            </div>
            <p
              className={`text-[10px] font-medium mt-1 ${
                finances.netProfit >= 0 ? 'text-emerald-800' : 'text-red-800'
              }`}
            >
              Nilai Order ({formatRupiah(finances.orderValue)}) − Total Biaya ({formatRupiah(finances.totalCost)})
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
