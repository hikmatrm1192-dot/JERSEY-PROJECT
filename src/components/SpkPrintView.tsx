import React from 'react';
import { ExtendedProductionRecap } from '../utils/orderCalculations';
import { OrderDetails, WorkerItem } from '../types/jersey';
import { STANDARD_SIZES } from '../data/defaultOrder';
import { ProStitchLogo } from './ProStitchLogo';

interface SpkPrintViewProps {
  order: OrderDetails;
  recap: ExtendedProductionRecap;
  workers?: WorkerItem[];
  onPrint?: () => void;
  onBackToEditor?: () => void;
}

export const SpkPrintView: React.FC<SpkPrintViewProps> = ({
  order,
  recap,
  workers = [],
  onPrint,
  onBackToEditor,
}) => {
  const sortedSizes = Object.keys(recap.sizeJerseyCounts).sort((a, b) => {
    const idxA = STANDARD_SIZES.indexOf(a);
    const idxB = STANDARD_SIZES.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  const assignedCutters = workers
    .filter((w) => w.role === 'potong' && order.assignedWorkerIds?.includes(w.id))
    .map((w) => w.name);

  const assignedSewers = workers
    .filter((w) => w.role === 'jahit' && order.assignedWorkerIds?.includes(w.id))
    .map((w) => w.name);

  const cutterText = assignedCutters.length > 0 ? assignedCutters.join(', ') : 'Belum ditentukan';
  const sewerText = assignedSewers.length > 0 ? assignedSewers.join(', ') : 'Belum ditentukan';

  return (
    <div className="w-full">
      {/* On-screen control bar (hidden in print) */}
      <div className="no-print bg-slate-900 text-white p-3 rounded-xl mb-6 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          {onBackToEditor && (
            <button
              onClick={onBackToEditor}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
            >
              ← Kembali ke Form SPK
            </button>
          )}
          <span className="text-xs text-slate-300">
            Pratinjau Lembar SPK Cetak ProStitch Jersey (A4 Standard)
          </span>
        </div>

        {onPrint && (
          <button
            onClick={onPrint}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            🖨️ Cetak SPK Sekarang (Ctrl+P)
          </button>
        )}
      </div>

      {/* The Printable Paper Sheet */}
      <div className="print-page bg-white p-6 md:p-8 rounded-xl border border-slate-300 text-slate-900 mx-auto max-w-5xl">
        
        {/* Kop SPK dengan Logo ProStitch Jersey */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <ProStitchLogo className="h-14 w-auto object-contain" />
            <div>
              <h1 className="text-2xl font-black uppercase text-slate-900 tracking-tight">
                PROSTITCH JERSEY
              </h1>
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">
                CUSTOM SPORTSWEAR TAILOR & WORKSHOP CONTROL SHEET
              </p>
            </div>
          </div>
          <div className="text-right text-xs font-mono">
            <div className="font-bold text-slate-900 text-sm">
              NO: {order.spkNumber || 'SPK-2026/09/001'}
            </div>
            <div className="text-slate-600">
              Tgl Masuk: <span className="font-semibold text-slate-900">{order.orderDate}</span>
            </div>
            <div className="text-red-700 font-bold">
              DEADLINE: <span>{order.deadlineDate}</span>
            </div>
          </div>
        </div>

        {/* Detail SPK & Order Info (5 Kolom Cetak) */}
        <div className="grid grid-cols-5 gap-2 mb-4 text-xs border border-slate-300 rounded p-2.5 bg-slate-50/50">
          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">NAMA TIM / ORDER:</span>
            <span className="font-black text-slate-900 text-sm uppercase truncate block">
              {order.teamName || '-'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">NO. SPK:</span>
            <span className="font-bold font-mono text-slate-900 text-xs">
              {order.spkNumber || '-'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">NAMA KLIEN / WA:</span>
            <span className="font-bold text-slate-800 text-xs">
              {order.clientContact || '-'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 font-semibold block text-[10px] text-red-600 uppercase">DEADLINE:</span>
            <span className="font-black text-red-700 text-xs">
              {order.deadlineDate || '-'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">STATUS:</span>
            <span className="font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded text-[11px] inline-block">
              {order.status || 'Draft'}
            </span>
          </div>
        </div>

        {/* Pembagian Penanggung Jawab & Spesifikasi Garment */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs border border-slate-300 rounded p-3 bg-white">
          <div>
            <span className="font-bold text-slate-500 block text-[10px] uppercase mb-1.5">
              PENANGGUNG JAWAB PEKERJA:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50/80 p-2 rounded border border-blue-200">
                <span className="text-blue-900 font-bold block text-[10px] uppercase">✂️ PEKERJA POTONG:</span>
                <span className="font-black text-slate-900 text-xs">{cutterText}</span>
              </div>
              <div className="bg-emerald-50/80 p-2 rounded border border-emerald-200">
                <span className="text-emerald-900 font-bold block text-[10px] uppercase">🪡 PEKERJA JAHIT:</span>
                <span className="font-black text-slate-900 text-xs">{sewerText}</span>
              </div>
            </div>
          </div>

          <div className="border-l border-slate-300 pl-3 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Bahan Kain:</span>
              <span className="font-bold text-slate-900">{order.fabricType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Pola Kerah:</span>
              <span className="font-bold text-slate-900">{order.collarType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Cetak Sablon:</span>
              <span className="font-bold text-slate-900">{order.printingType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Spesifikasi Celana:</span>
              <span className="font-bold text-slate-900">{order.pantsColor}</span>
            </div>
          </div>
        </div>

        {/* Banner Awareness Alert */}
        <div className="border-2 border-amber-500 bg-amber-50/90 p-2.5 mb-4 rounded text-xs">
          <div className="font-black text-amber-900 uppercase">
            ⚠️ AWARE : PERHATIKAN KETERANGAN YANG DICANTUMKAN!
          </div>
          <p className="text-[11px] text-amber-950 mt-0.5 font-medium">
            Pekerja potong & jahit wajib mengecek ulang item <b>KIPER</b> dan <b>TANPA CELANA</b> sebelum pengerjaan.
          </p>
          {recap.duplicateNumbers.length > 0 && (
            <div className="font-bold text-red-700 text-[11px] mt-1">
              🚨 Nomor Punggung Kembar: #{recap.duplicateNumbers.join(', #')}
            </div>
          )}
        </div>

        {/* Tabel Nameset Resmi */}
        <div className="mb-4 overflow-hidden border border-slate-400">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase text-[11px] border-b border-slate-400">
                <th className="p-1.5 text-center w-8 border-r border-slate-300">No</th>
                <th className="p-1.5 text-left border-r border-slate-300">Nama Pemain</th>
                <th className="p-1.5 text-center w-16 border-r border-slate-300">Ukuran</th>
                <th className="p-1.5 text-center w-16 border-r border-slate-300">No. Punggung</th>
                <th className="p-1.5 text-left">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {order.players.map((p, idx) => {
                const noteUpper = (p.note || '').toUpperCase();
                const isKiper = noteUpper.includes('KIEPR') || noteUpper.includes('KIPER');
                const isTanpaCelana = noteUpper.includes('TANPA CELANA');

                let rowStyle = '';
                if (isTanpaCelana) rowStyle = 'bg-red-50 text-red-950 font-semibold';
                else if (isKiper) rowStyle = 'bg-amber-50 text-amber-950 font-semibold';

                return (
                  <tr key={p.id} className={rowStyle}>
                    <td className="p-1 text-center border-r border-slate-300 font-bold text-slate-600">
                      {idx + 1}
                    </td>
                    <td className="p-1 border-r border-slate-300 font-bold uppercase tracking-wide text-slate-950">
                      {p.name || '-'}
                    </td>
                    <td className="p-1 text-center border-r border-slate-300 font-black font-mono">
                      {p.size}
                    </td>
                    <td className="p-1 text-center border-r border-slate-300 font-mono font-bold">
                      {p.number || '-'}
                    </td>
                    <td className="p-1 font-bold uppercase text-[11px]">
                      {p.note || 'PEMAIN'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Ringkasan Rekapitulasi Pemotongan Material */}
        <div className="border border-slate-400 rounded p-3 mb-4 bg-slate-50/70">
          <div className="text-xs font-black uppercase text-slate-900 border-b border-slate-300 pb-1 mb-2">
            REKAPITULASI MATERIAL PRODUKSI
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-bold text-slate-700 block mb-1">
                RINCIAN UKURAN JERSEY:
              </span>
              <div className="flex flex-wrap gap-1 mb-1 font-mono">
                {sortedSizes.map((sz) => (
                  <span key={sz} className="border border-slate-400 bg-white px-1.5 py-0.5 rounded font-bold">
                    {sz}: {recap.sizeJerseyCounts[sz]}
                  </span>
                ))}
              </div>
              <div className="font-black text-sm text-slate-900 mt-1">
                TOTAL JERSEY: <span className="text-indigo-600">{recap.totalJersey}</span> PCS
              </div>
            </div>

            <div className="border-l border-slate-300 pl-3">
              <span className="font-bold text-slate-700 block mb-1">
                RINCIAN BAWAHAN (CELANA):
              </span>
              <p className="text-[11px] text-slate-600 mb-1">
                Otomatis dikurangi untuk pemain dengan tag TANPA CELANA ({recap.tanpaCelanaCount} pcs).
              </p>
              <div className="font-black text-sm text-slate-900 mt-1">
                TOTAL CELANA: <span className="text-indigo-600">{recap.totalCelana}</span> PCS
              </div>
            </div>
          </div>
        </div>

        {/* Foto Dokumentasi Hasil Jadi (Jika Ada) */}
        {order.photos && order.photos.length > 0 && (
          <div className="border border-slate-400 rounded p-3 mb-4 bg-white">
            <div className="text-xs font-black uppercase text-slate-900 border-b border-slate-300 pb-1 mb-2">
              📷 DOKUMENTASI FOTO JERSEY BERES DIJAHIT
            </div>
            <div className="grid grid-cols-4 gap-2">
              {order.photos.map((src, i) => (
                <div key={i} className="border border-slate-300 rounded overflow-hidden">
                  <img src={src} alt={`Dokumentasi ${i + 1}`} className="w-full h-24 object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lembar Kontrol & Verifikasi Divisi Produksi */}
        <div className="border-t border-slate-400 pt-3 mb-4">
          <div className="text-[10px] font-bold uppercase text-slate-500 mb-2 text-center tracking-wider">
            LEMBAR KONTROL & VERIFIKASI DIVISI PRODUKSI
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="border border-slate-300 rounded p-1.5 flex flex-col justify-between h-20">
              <div className="font-bold text-[10px] uppercase text-slate-700">Desain & Setting</div>
              <div className="border-b border-dashed border-slate-400 mx-2"></div>
              <div className="text-[9px] text-slate-400">(....................)</div>
            </div>

            <div className="border border-slate-300 rounded p-1.5 flex flex-col justify-between h-20">
              <div className="font-bold text-[10px] uppercase text-blue-900">
                Pekerja Potong ({cutterText})
              </div>
              <div className="border-b border-dashed border-slate-400 mx-2"></div>
              <div className="text-[9px] text-slate-400">(....................)</div>
            </div>

            <div className="border border-slate-300 rounded p-1.5 flex flex-col justify-between h-20">
              <div className="font-bold text-[10px] uppercase text-emerald-900">
                Pekerja Jahit ({sewerText})
              </div>
              <div className="border-b border-dashed border-slate-400 mx-2"></div>
              <div className="text-[9px] text-slate-400">(....................)</div>
            </div>

            <div className="border border-slate-300 rounded p-1.5 flex flex-col justify-between h-20">
              <div className="font-bold text-[10px] uppercase text-slate-700">QC & Packing</div>
              <div className="border-b border-dashed border-slate-400 mx-2"></div>
              <div className="text-[9px] text-slate-400">(....................)</div>
            </div>
          </div>
        </div>

        {/* Stempel Digital Workshop & Branding (Khusus Cetak) */}
        <div className="border-t pt-4 mt-6 text-xs">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-3">
              <ProStitchLogo className="h-12 w-auto object-contain" />
              <div>
                <p className="font-bold text-slate-900">PROSTITCH JERSEY WORKROOM</p>
                <p className="text-[10px] text-slate-500">Quality Control & Verification Stamp</p>
              </div>
            </div>
            <div className="border-2 border-slate-900 p-3 rounded text-center w-48 bg-slate-50/50">
              <p className="font-black uppercase text-[10px] tracking-wider text-slate-900">QC PASSED & READY</p>
              <p className="text-[9px] mt-4 text-slate-600">Tanggal: ..... / ..... / 2026</p>
              <p className="text-[9px] text-slate-600">Ttd: .................................</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
