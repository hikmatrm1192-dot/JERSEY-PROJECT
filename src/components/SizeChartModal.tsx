import React from 'react';
import { X, Ruler, Info } from 'lucide-react';
import { SIZE_CHART_DATA } from '../data/defaultOrder';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeChartModal: React.FC<SizeChartModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Ruler className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Standar Size Chart Jersey Konveksi
              </h3>
              <p className="text-xs text-slate-500">
                Pola Standar Regular Fit Indonesia (Toleransi ±1 cm)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-2.5 text-center w-20">Ukuran</th>
                  <th className="p-2.5 text-center">Lebar Dada</th>
                  <th className="p-2.5 text-center">Panjang Badan</th>
                  <th className="p-2.5 text-center">Panjang Celana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SIZE_CHART_DATA.map((row) => (
                  <tr key={row.size} className="hover:bg-slate-50/80">
                    <td className="p-2.5 text-center font-bold text-indigo-700 font-mono text-sm bg-slate-50/40">
                      {row.size}
                    </td>
                    <td className="p-2.5 text-center font-mono tabular-nums text-slate-700">
                      {row.chest}
                    </td>
                    <td className="p-2.5 text-center font-mono tabular-nums text-slate-700">
                      {row.length}
                    </td>
                    <td className="p-2.5 text-center font-mono tabular-nums text-slate-700">
                      {row.pantsLength}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              <strong>Tips Konveksi:</strong> Lebar dada diukur dari ketiak kiri ke ketiak kanan saat baju dibentangkan mendatar. Panjang badan diukur dari bahu samping kerah hingga ujung kelim bawah.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
