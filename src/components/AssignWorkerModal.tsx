import React, { useState, useEffect } from 'react';
import { WorkerItem, OrderDetails, WorkerAssignment } from '../types/jersey';
import { formatRupiah, calculateOrderWages } from '../utils/orderCalculations';
import { Users, X, Scissors, Check, AlertTriangle, FileText, DollarSign } from 'lucide-react';

interface AssignWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDetails | null;
  workers: WorkerItem[];
  onSaveAssignments: (
    orderId: string,
    assignments: WorkerAssignment[],
    workerNotes?: string
  ) => void;
}

interface WorkerFormState {
  workerId: number | string;
  division: 'potong' | 'jahit';
  selected: boolean;
  quantity: number | '';
  wagePerPiece: number | '';
}

export const AssignWorkerModal: React.FC<AssignWorkerModalProps> = ({
  isOpen,
  onClose,
  order,
  workers,
  onSaveAssignments,
}) => {
  const [assignmentMap, setAssignmentMap] = useState<Record<string, WorkerFormState>>({});
  const [workerNotes, setWorkerNotes] = useState('');

  const totalOrderPcs = order?.players ? order.players.length : 0;

  // Initialize or reset form state whenever order opens
  useEffect(() => {
    if (!order) return;

    setWorkerNotes(order.workerNotes || '');

    const initialMap: Record<string, WorkerFormState> = {};

    // Get existing assignments
    const existing = order.workerAssignments || [];

    // Also support fallback from legacy assignedWorkerIds if workerAssignments is empty
    const legacyAssigned = order.assignedWorkerIds || [];

    workers.forEach((w) => {
      const isPotongCandidate = w.role === 'potong' || w.role === 'potong_jahit';
      const isJahitCandidate = w.role === 'jahit' || w.role === 'potong_jahit';

      if (isPotongCandidate) {
        const key = `potong_${w.id}`;
        const match = existing.find((a) => a.workerId === w.id && a.division === 'potong');
        const legacyMatch = !match && existing.length === 0 && legacyAssigned.includes(w.id);

        initialMap[key] = {
          workerId: w.id,
          division: 'potong',
          selected: !!match || !!legacyMatch,
          quantity: match ? match.quantity : (legacyMatch ? totalOrderPcs : ''),
          wagePerPiece: match ? match.wagePerPiece : (w.wagePerPiece || 1000),
        };
      }

      if (isJahitCandidate) {
        const key = `jahit_${w.id}`;
        const match = existing.find((a) => a.workerId === w.id && a.division === 'jahit');
        const legacyMatch = !match && existing.length === 0 && legacyAssigned.includes(w.id);

        initialMap[key] = {
          workerId: w.id,
          division: 'jahit',
          selected: !!match || !!legacyMatch,
          quantity: match ? match.quantity : (legacyMatch ? totalOrderPcs : ''),
          wagePerPiece: match ? match.wagePerPiece : (w.wagePerPiece || 2500),
        };
      }
    });

    // Also include any worker that might be in existing assignment but not in current master list
    existing.forEach((a) => {
      const key = `${a.division}_${a.workerId}`;
      if (!initialMap[key]) {
        initialMap[key] = {
          workerId: a.workerId,
          division: a.division,
          selected: true,
          quantity: a.quantity,
          wagePerPiece: a.wagePerPiece,
        };
      }
    });

    setAssignmentMap(initialMap);
  }, [order, workers, isOpen, totalOrderPcs]);

  if (!isOpen || !order) return null;

  // Toggle selection
  const handleToggleWorker = (key: string, division: 'potong' | 'jahit', worker: WorkerItem) => {
    setAssignmentMap((prev) => {
      const current = prev[key] || {
        workerId: worker.id,
        division,
        selected: false,
        quantity: '',
        wagePerPiece: worker.wagePerPiece || (division === 'potong' ? 1000 : 2500),
      };

      const willBeSelected = !current.selected;
      return {
        ...prev,
        [key]: {
          ...current,
          selected: willBeSelected,
          quantity: willBeSelected ? (current.quantity || totalOrderPcs || 0) : '',
        },
      };
    });
  };

  const handleUpdateQuantity = (key: string, val: string) => {
    const num = val === '' ? '' : Math.max(0, parseInt(val, 10) || 0);
    setAssignmentMap((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        quantity: num,
      },
    }));
  };

  const handleUpdateWage = (key: string, val: string) => {
    const num = val === '' ? '' : Math.max(0, parseInt(val, 10) || 0);
    setAssignmentMap((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        wagePerPiece: num,
      },
    }));
  };

  // Compute live totals
  const activeAssignments: WorkerAssignment[] = [];
  Object.entries(assignmentMap).forEach(([_, item]) => {
    if (item.selected) {
      const qty = typeof item.quantity === 'number' ? item.quantity : (Number(item.quantity) || 0);
      const rate = typeof item.wagePerPiece === 'number' ? item.wagePerPiece : (Number(item.wagePerPiece) || 0);
      const worker = workers.find((w) => w.id === item.workerId);
      activeAssignments.push({
        workerId: item.workerId,
        workerName: worker?.name || `Worker #${item.workerId}`,
        division: item.division,
        quantity: qty,
        wagePerPiece: rate,
        totalWage: qty * rate,
      });
    }
  });

  const liveWages = calculateOrderWages(activeAssignments);

  // Potong stats
  const potongAssignedPcs = liveWages.cuttingPcs;
  const potongRemainingPcs = totalOrderPcs - potongAssignedPcs;

  // Jahit stats
  const jahitAssignedPcs = liveWages.sewingPcs;
  const jahitRemainingPcs = totalOrderPcs - jahitAssignedPcs;

  // Filter candidates: active or already selected in this order
  const getCandidates = (division: 'potong' | 'jahit') => {
    return workers.filter((w) => {
      const roleMatches =
        division === 'potong'
          ? w.role === 'potong' || w.role === 'potong_jahit'
          : w.role === 'jahit' || w.role === 'potong_jahit';

      if (!roleMatches) return false;

      // Show if active OR if already selected in this order's assignment
      const key = `${division}_${w.id}`;
      const isCurrentlyAssigned = assignmentMap[key]?.selected;
      return w.active !== false || isCurrentlyAssigned;
    });
  };

  const potongCandidates = getCandidates('potong');
  const jahitCandidates = getCandidates('jahit');

  // Submit
  const handleSave = () => {
    onSaveAssignments(order.id, activeAssignments, workerNotes.trim());
    onClose();
  };

  return (
    <div
      id="assignWorkerModal"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 no-print animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-3xl w-full p-5 shadow-2xl border border-slate-200 text-xs max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-600 text-white p-1 rounded-lg">
                <Users className="w-4 h-4" />
              </span>
              <h2 className="font-black text-sm text-slate-800 uppercase tracking-wide">
                PENUGASAN PEKERJA & BIAYA UPAH
              </h2>
            </div>
            {/* SPK & Order Identifier */}
            <div className="flex flex-wrap items-center gap-2 mt-1 font-mono text-xs">
              <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-bold">
                {order.spkNumber}
              </span>
              <span className="font-sans font-black text-slate-800 text-sm">
                {order.teamName}
              </span>
              <span className="text-slate-400">•</span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold font-sans">
                Total Order: {totalOrderPcs} pcs
              </span>
              {order.orderValue !== undefined && order.orderValue > 0 && (
                <>
                  <span className="text-slate-400">•</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold font-sans">
                    Nilai Order: {formatRupiah(order.orderValue)}
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* ✂️ BAGIAN POTONG */}
          <div className="bg-white border border-blue-200 rounded-xl p-3.5 shadow-2xs">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-2 pb-2 border-b border-blue-100">
              <div className="flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-blue-600" />
                <h3 className="font-black text-blue-900 uppercase tracking-wide text-xs">
                  ✂️ BAGIAN POTONG
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                  Total Order: <b>{totalOrderPcs} pcs</b>
                </span>
                <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-bold">
                  Sudah Ditugaskan: {potongAssignedPcs} pcs
                </span>
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    potongRemainingPcs === 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : potongRemainingPcs < 0
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Sisa: {potongRemainingPcs} pcs
                </span>
              </div>
            </div>

            {potongRemainingPcs < 0 && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-2 rounded text-[11px] font-bold mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Peringatan: Jumlah pcs potong ({potongAssignedPcs}) melebihi total order ({totalOrderPcs} pcs).</span>
              </div>
            )}

            {potongCandidates.length === 0 ? (
              <div className="text-slate-400 italic text-center py-3 bg-slate-50 rounded">
                Tidak ada pekerja potong aktif di Master Pegawai.
              </div>
            ) : (
              <div className="space-y-2">
                {potongCandidates.map((w) => {
                  const key = `potong_${w.id}`;
                  const item = assignmentMap[key] || {
                    workerId: w.id,
                    division: 'potong',
                    selected: false,
                    quantity: '',
                    wagePerPiece: w.wagePerPiece || 1000,
                  };
                  const isChecked = item.selected;
                  const qty = typeof item.quantity === 'number' ? item.quantity : (Number(item.quantity) || 0);
                  const rate = typeof item.wagePerPiece === 'number' ? item.wagePerPiece : (Number(item.wagePerPiece) || 0);
                  const subtotal = qty * rate;

                  return (
                    <div
                      key={key}
                      className={`p-2.5 rounded-lg border transition-all ${
                        isChecked
                          ? 'bg-blue-50/90 border-blue-300 ring-1 ring-blue-300'
                          : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleWorker(key, 'potong', w)}
                            className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                          />
                          <span className="font-black uppercase text-slate-800 text-xs tracking-wider">
                            {w.name}
                          </span>
                          {w.active === false && (
                            <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.2 rounded">
                              Nonaktif
                            </span>
                          )}
                        </label>

                        {isChecked && (
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1">
                              <span className="text-slate-500 font-semibold text-[11px]">Jumlah pcs:</span>
                              <input
                                type="number"
                                min="0"
                                max={totalOrderPcs * 2}
                                value={item.quantity}
                                onChange={(e) => handleUpdateQuantity(key, e.target.value)}
                                placeholder="0"
                                className="w-20 bg-white border border-slate-300 rounded px-2 py-1 font-bold text-slate-800 text-center outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>

                            <div className="flex items-center gap-1">
                              <span className="text-slate-500 font-semibold text-[11px]">Tarif/pcs:</span>
                              <input
                                type="number"
                                min="0"
                                value={item.wagePerPiece}
                                onChange={(e) => handleUpdateWage(key, e.target.value)}
                                placeholder="1000"
                                className="w-24 bg-white border border-slate-300 rounded px-2 py-1 font-bold text-slate-800 text-center outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>

                            <div className="min-w-[110px] text-right font-mono font-black text-blue-900">
                              = {formatRupiah(subtotal)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 🧵 BAGIAN JAHIT */}
          <div className="bg-white border border-emerald-200 rounded-xl p-3.5 shadow-2xs">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-2 pb-2 border-b border-emerald-100">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🧵</span>
                <h3 className="font-black text-emerald-900 uppercase tracking-wide text-xs">
                  🧵 BAGIAN JAHIT
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                  Total Order: <b>{totalOrderPcs} pcs</b>
                </span>
                <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold">
                  Sudah Ditugaskan: {jahitAssignedPcs} pcs
                </span>
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    jahitRemainingPcs === 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : jahitRemainingPcs < 0
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Sisa: {jahitRemainingPcs} pcs
                </span>
              </div>
            </div>

            {jahitRemainingPcs < 0 && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-2 rounded text-[11px] font-bold mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Peringatan: Jumlah pcs jahit ({jahitAssignedPcs}) melebihi total order ({totalOrderPcs} pcs).</span>
              </div>
            )}

            {jahitCandidates.length === 0 ? (
              <div className="text-slate-400 italic text-center py-3 bg-slate-50 rounded">
                Tidak ada pekerja jahit aktif di Master Pegawai.
              </div>
            ) : (
              <div className="space-y-2">
                {jahitCandidates.map((w) => {
                  const key = `jahit_${w.id}`;
                  const item = assignmentMap[key] || {
                    workerId: w.id,
                    division: 'jahit',
                    selected: false,
                    quantity: '',
                    wagePerPiece: w.wagePerPiece || 2500,
                  };
                  const isChecked = item.selected;
                  const qty = typeof item.quantity === 'number' ? item.quantity : (Number(item.quantity) || 0);
                  const rate = typeof item.wagePerPiece === 'number' ? item.wagePerPiece : (Number(item.wagePerPiece) || 0);
                  const subtotal = qty * rate;

                  const isAkok = w.name.toUpperCase().includes('AKOK');

                  return (
                    <div
                      key={key}
                      className={`p-2.5 rounded-lg border transition-all ${
                        isChecked
                          ? 'bg-emerald-50/90 border-emerald-300 ring-1 ring-emerald-300'
                          : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleWorker(key, 'jahit', w)}
                            className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                          />
                          <span className="font-black uppercase text-slate-800 text-xs tracking-wider">
                            {w.name}
                          </span>
                          {isAkok && (
                            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                              Admin + Jahit
                            </span>
                          )}
                          {w.active === false && (
                            <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.2 rounded">
                              Nonaktif
                            </span>
                          )}
                        </label>

                        {isChecked && (
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1">
                              <span className="text-slate-500 font-semibold text-[11px]">Jumlah pcs:</span>
                              <input
                                type="number"
                                min="0"
                                max={totalOrderPcs * 2}
                                value={item.quantity}
                                onChange={(e) => handleUpdateQuantity(key, e.target.value)}
                                placeholder="0"
                                className="w-20 bg-white border border-slate-300 rounded px-2 py-1 font-bold text-slate-800 text-center outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>

                            <div className="flex items-center gap-1">
                              <span className="text-slate-500 font-semibold text-[11px]">Tarif/pcs:</span>
                              <input
                                type="number"
                                min="0"
                                value={item.wagePerPiece}
                                onChange={(e) => handleUpdateWage(key, e.target.value)}
                                placeholder="2500"
                                className="w-24 bg-white border border-slate-300 rounded px-2 py-1 font-bold text-slate-800 text-center outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>

                            <div className="min-w-[110px] text-right font-mono font-black text-emerald-900">
                              = {formatRupiah(subtotal)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 📝 CATATAN KHUSUS PENUGASAN */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <label className="flex items-center gap-1.5 font-bold text-slate-700 mb-1 uppercase text-[11px]">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Catatan Khusus Penugasan:</span>
            </label>
            <textarea
              rows={2}
              value={workerNotes}
              onChange={(e) => setWorkerNotes(e.target.value)}
              placeholder="Contoh: Ujang potong pola badan dulu. Asep dan Deni fokus jahit kerah V-neck."
              className="w-full bg-white border border-slate-300 rounded p-2 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Footer Summary & Action Buttons */}
        <div className="border-t border-slate-200 pt-3 mt-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 bg-slate-100 p-2.5 rounded-lg text-center font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">Upah Potong</span>
              <span className="font-bold text-blue-900 text-xs">{formatRupiah(liveWages.cuttingWage)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">Upah Jahit</span>
              <span className="font-bold text-emerald-900 text-xs">{formatRupiah(liveWages.sewingWage)}</span>
            </div>
            <div className="bg-indigo-50/80 rounded p-0.5 border border-indigo-200">
              <span className="text-[10px] text-indigo-700 block uppercase font-sans font-bold">Total Biaya Upah</span>
              <span className="font-black text-indigo-900 text-xs">{formatRupiah(liveWages.totalWage)}</span>
            </div>
            <div className="bg-emerald-50/80 rounded p-0.5 border border-emerald-200">
              <span className="text-[10px] text-emerald-700 block uppercase font-sans font-bold">Nilai Order</span>
              <span className="font-black text-emerald-900 text-xs">{formatRupiah(order.orderValue || 0)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>💾 Simpan Penugasan ({activeAssignments.length} Pekerja)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
