import React from 'react';
import { ExtendedProductionRecap } from '../utils/orderCalculations';

interface AwarenessBannerProps {
  recap: ExtendedProductionRecap;
}

export const AwarenessBanner: React.FC<AwarenessBannerProps> = ({ recap }) => {
  const hasDuplicates = recap.duplicateNumbers && recap.duplicateNumbers.length > 0;
  const hasSpecialNotes = recap.specialNotes && recap.specialNotes.length > 0;

  return (
    <div className="bg-amber-100 border-l-4 border-amber-500 p-3 mb-6 rounded text-amber-900 text-xs shadow-2xs">
      <p className="font-black text-sm tracking-wider uppercase flex items-center gap-1.5">
        ⚠️ AWARE : PERHATIKAN KETERANGAN YANG DICANTUMKAN!
      </p>
      
      <p className="mt-1 font-medium">
        Pekerja potong & jahit wajib mengecek ulang item <b>KIPER</b> dan <b>TANPA CELANA</b> sebelum pengerjaan.
      </p>

      {hasDuplicates && (
        <div className="mt-1.5 font-bold text-red-600 bg-red-50 p-1.5 rounded border border-red-200">
          🚨 PERINGATAN: Nomor punggung terdeteksi kembar: <b>#{recap.duplicateNumbers.join(', #')}</b>
        </div>
      )}

      {hasSpecialNotes && (
        <div className="mt-1.5 text-slate-700">
          <b>Catatan Perhatian:</b>{' '}
          {recap.specialNotes.map((note, idx) => (
            <span key={idx}>
              {idx > 0 && ' | '}
              <span dangerouslySetInnerHTML={{ __html: note }} />
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
