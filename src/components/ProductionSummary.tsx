import React from 'react';
import { ExtendedProductionRecap } from '../utils/orderCalculations';
import { STANDARD_SIZES } from '../data/defaultOrder';
import { WorkflowProgress } from '../types/jersey';

interface ProductionSummaryProps {
  recap: ExtendedProductionRecap;
  workflow?: WorkflowProgress;
  onChange: (workflow: WorkflowProgress) => void;
}

export const ProductionSummary: React.FC<ProductionSummaryProps> = ({ recap, workflow, onChange }) => {
  const currentWorkflow: WorkflowProgress = workflow || {
    cutting: { patternCut: false, pantsCollarCut: false, specialItemsSeparated: false },
    sewing: { bodySleeveJoined: false, collarElasticSewed: false, overdeckFinished: false },
    productionChecklist: { settingLayout: false, cutting: false, sewing: false, elastic: false, qc: false },
  };

  const detailedCuttingDone = [
    currentWorkflow.cutting.patternCut,
    currentWorkflow.cutting.pantsCollarCut,
    currentWorkflow.cutting.specialItemsSeparated,
  ].every(Boolean);

  const detailedSewingDone = [
    currentWorkflow.sewing.bodySleeveJoined,
    currentWorkflow.sewing.collarElasticSewed,
    currentWorkflow.sewing.overdeckFinished,
  ].every(Boolean);

  // Checklist ringkasan harus mengikuti workflow detail order yang sedang aktif.
  // Hanya Setting Layout dan QC & Packing yang tetap dikontrol dari checklist ringkasan.
  const storedChecklist = currentWorkflow.productionChecklist || {
    settingLayout: false,
    cutting: false,
    sewing: false,
    elastic: false,
    qc: false,
  };

  const checklist = {
    settingLayout: storedChecklist.settingLayout,
    cutting: detailedCuttingDone,
    sewing: detailedSewingDone,
    elastic: currentWorkflow.sewing.collarElasticSewed === true,
    qc: storedChecklist.qc,
  };

  const updateChecklist = (patch: Partial<NonNullable<WorkflowProgress['productionChecklist']>>) => {
    onChange({
      ...currentWorkflow,
      productionChecklist: {
        ...storedChecklist,
        ...patch,
        // Nilai berikut adalah turunan workflow detail, bukan input terpisah.
        cutting: detailedCuttingDone,
        sewing: detailedSewingDone,
        elastic: currentWorkflow.sewing.collarElasticSewed === true,
      },
    });
  };

  const toggleSettingLayout = () => {
    updateChecklist({ settingLayout: !checklist.settingLayout });
  };

  const toggleQc = () => {
    updateChecklist({ qc: !checklist.qc });
  };

  const sortedSizes = Object.keys(recap.sizeJerseyCounts).sort((a, b) => {
    const idxA = STANDARD_SIZES.indexOf(a);
    const idxB = STANDARD_SIZES.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <>
      {/* Rekapitulasi Otomatis (Persis format ProStitch Jersey) */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 shadow-2xs">
        <h3 className="font-bold text-slate-800 text-xs mb-2 uppercase tracking-wider">
          Rekapitulasi Material Produksi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block mb-1">Rincian Ukuran Jersey:</span>
            <div id="sizeSummary" className="flex flex-wrap gap-1 font-bold">
              {sortedSizes.length === 0 ? (
                <span className="text-slate-400 italic">Belum ada data</span>
              ) : (
                sortedSizes.map((sz) => (
                  <span
                    key={sz}
                    className="bg-slate-200 border border-slate-300 px-2 py-0.5 rounded text-slate-800 font-bold"
                  >
                    {sz}: {recap.sizeJerseyCounts[sz]}
                  </span>
                ))
              )}
            </div>
            <p className="mt-2 font-black text-slate-900">
              Total Jersey: <span id="totalJersey" className="text-indigo-600">{recap.totalJersey}</span> Pcs
            </p>
          </div>

          <div>
            <span className="text-slate-500 block mb-1">Rincian Bawahan:</span>
            <p className="font-black text-slate-900">
              Total Celana: <span id="totalCelana" className="text-indigo-600">{recap.totalCelana}</span> Pcs
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Otomatis dikurangi untuk pemain dengan keterangan <b>TANPA CELANA</b> ({recap.tanpaCelanaCount} pcs).
            </p>
          </div>
        </div>
      </div>

      {/* Checklist Alur Workshop Produksi */}
      <div className="border-t pt-4 text-xs no-print">
        <h4 className="font-bold text-slate-700 uppercase mb-2">
          Checklist & Kontrol Alur Produksi:
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          <label className={`border p-2 rounded flex items-center gap-1.5 cursor-pointer transition-colors ${
            checklist.settingLayout ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200'
          }`}>
            <input
              type="checkbox"
              checked={checklist.settingLayout}
              onChange={toggleSettingLayout}
              className="accent-indigo-600 cursor-pointer"
            />
            <span>Setting Layout</span>
          </label>

          <label className={`border p-2 rounded flex items-center gap-1.5 transition-colors ${
            checklist.cutting ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200'
          }`}>
            <input
              type="checkbox"
              checked={checklist.cutting}
              readOnly
              disabled
              className="accent-indigo-600"
            />
            <span>Cutting / Potong</span>
          </label>

          <label className={`border p-2 rounded flex items-center gap-1.5 transition-colors ${
            checklist.sewing ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200'
          }`}>
            <input
              type="checkbox"
              checked={checklist.sewing}
              readOnly
              disabled
              className="accent-indigo-600"
            />
            <span>Proses Jahit</span>
          </label>

          <label className={`border p-2 rounded flex items-center gap-1.5 transition-colors ${
            checklist.elastic ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200'
          }`}>
            <input
              type="checkbox"
              checked={checklist.elastic}
              readOnly
              disabled
              className="accent-indigo-600"
            />
            <span>Pasang Karet</span>
          </label>

          <label className={`border p-2 rounded flex items-center gap-1.5 cursor-pointer transition-colors ${
            checklist.qc ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200'
          }`}>
            <input
              type="checkbox"
              checked={checklist.qc}
              onChange={toggleQc}
              className="accent-indigo-600 cursor-pointer"
            />
            <span>QC & Packing</span>
          </label>
        </div>
      </div>
    </>
  );
};
