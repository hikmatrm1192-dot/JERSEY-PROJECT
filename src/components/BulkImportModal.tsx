import React, { useState, useMemo } from 'react';
import { PlayerItem } from '../types/jersey';
import { STANDARD_SIZES } from '../data/defaultOrder';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (players: PlayerItem[], mode: 'replace' | 'append') => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [pasteInput, setPasteInput] = useState(`SAFFANA S 15 PEMAIN
KIBOY M 30 PEMAIN
ZLATAN IBRAHIMOVIK M 23 PEMAIN
XAVIER XXL 23 PEMAIN TANPA CELANA
BINUS L 1 KIEPR
COACH XXL - COACH`);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');

  // Parse lines using user's regex: split(/[\t,;]+/) or fallback spasi
  const parsedPlayers = useMemo(() => {
    if (!pasteInput.trim()) return [];

    const lines = pasteInput.split('\n');
    const validSizes = new Set(STANDARD_SIZES.map((s) => s.toUpperCase()));
    const result: PlayerItem[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Remove leading numbering like "1. ", "01) ", "1 - "
      const cleaned = trimmed.replace(/^\s*\d+[\.\)\-\:\s]+\s*/, '');

      let parts = cleaned.split(/[\t,;]+/);
      if (parts.length < 2) {
        // Fallback space separated, but handle names that might be multi-word
        parts = cleaned.split(/\s+/);
      }

      let name = '';
      let size = 'M';
      let number = '';
      let note = 'PEMAIN';

      if (parts.length >= 4) {
        name = parts[0]?.trim() || '';
        size = parts[1]?.trim().toUpperCase() || 'M';
        number = parts[2]?.trim() || '';
        note = parts.slice(3).join(' ').trim().toUpperCase() || 'PEMAIN';
      } else if (parts.length === 3) {
        name = parts[0]?.trim() || '';
        const p1 = parts[1]?.trim().toUpperCase() || '';
        const p2 = parts[2]?.trim() || '';
        if (validSizes.has(p1)) {
          size = p1;
          number = p2;
        } else {
          number = p1;
          note = p2.toUpperCase();
        }
      } else if (parts.length === 2) {
        name = parts[0]?.trim() || '';
        const p1 = parts[1]?.trim().toUpperCase() || '';
        if (validSizes.has(p1)) {
          size = p1;
        } else {
          number = p1;
        }
      } else {
        name = parts[0]?.trim() || '';
      }

      // Normalize size
      if (!validSizes.has(size)) {
        size = 'M';
      }

      result.push({
        id: `imp-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        name: name.toUpperCase(),
        size,
        number: number === '-' ? '' : number,
        note: note.toUpperCase() || 'PEMAIN',
        sleeve: note.includes('LENGAN PANJANG') ? 'panjang' : 'pendek'
      });
    });

    return result;
  }, [pasteInput]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-2xl">
        
        {/* Header */}
        <h3 className="font-bold text-sm text-slate-800 mb-1">
          Impor Cepat Dari WA / Excel
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Format per baris: <b>NAMA, UKURAN, NOMOR, KETERANGAN</b> (pisahkan dengan koma, spasi, strip, atau tab).
        </p>

        {/* Textarea */}
        <textarea
          id="pasteInput"
          rows={7}
          value={pasteInput}
          onChange={(e) => setPasteInput(e.target.value)}
          placeholder={`Contoh:\nSAFFANA S 15 PEMAIN\nXAVIER XXL 23 PEMAIN TANPA CELANA\nBINUS L 1 KIEPR`}
          className="w-full border rounded p-2 text-xs font-mono mb-3 focus:ring-1 focus:ring-indigo-500 outline-none leading-relaxed text-slate-800"
        />

        {/* Mode & Stats */}
        <div className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200 text-xs mb-4">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="importMode"
                checked={importMode === 'replace'}
                onChange={() => setImportMode('replace')}
                className="accent-indigo-600"
              />
              <span className="font-medium text-slate-700">Ganti Semua</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="importMode"
                checked={importMode === 'append'}
                onChange={() => setImportMode('append')}
                className="accent-indigo-600"
              />
              <span className="font-medium text-slate-700">Tambahkan</span>
            </label>
          </div>
          <span className="font-bold text-indigo-700">
            {parsedPlayers.length} Pemain Terbaca
          </span>
        </div>

        {/* Actions matching user HTML */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 border rounded text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={parsedPlayers.length === 0}
            onClick={() => {
              onImport(parsedPlayers, importMode);
              onClose();
            }}
            className="px-3.5 py-1.5 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700 transition-colors disabled:opacity-40"
          >
            Proses & Terapkan ({parsedPlayers.length})
          </button>
        </div>

      </div>
    </div>
  );
};
