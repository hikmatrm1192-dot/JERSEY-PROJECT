import React, { useState } from 'react';
import { PlayerItem } from '../types/jersey';
import { STANDARD_SIZES } from '../data/defaultOrder';

interface PlayerTableProps {
  players: PlayerItem[];
  onUpdatePlayer: (id: string, key: keyof PlayerItem, value: any) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (id: string) => void;
  onDuplicatePlayer: (index: number) => void;
  onMovePlayer: (index: number, direction: 'up' | 'down') => void;
  onResetSample?: () => void;
  onClearAll?: () => void;
  onOpenImport?: () => void;
  duplicateNumbers?: string[];
}

export const PlayerTable: React.FC<PlayerTableProps> = ({
  players,
  onUpdatePlayer,
  onAddPlayer,
  onRemovePlayer,
  onDuplicatePlayer,
  onMovePlayer,
  onResetSample,
  onClearAll,
  duplicateNumbers = [],
}) => {
  const [activePlayerIndex, setActivePlayerIndex] = useState<number | null>(null);
  const [showSizeChart, setShowSizeChart] = useState(false);

  const appendTag = (tagText: string) => {
    if (activePlayerIndex !== null && players[activePlayerIndex]) {
      const player = players[activePlayerIndex];
      const currentNote = player.note || '';
      if (!currentNote.includes(tagText)) {
        const newNote = (currentNote + ' ' + tagText).trim();
        onUpdatePlayer(player.id, 'note', newNote);
      }
    } else if (players.length > 0) {
      const lastIndex = players.length - 1;
      const player = players[lastIndex];
      const currentNote = player.note || '';
      if (!currentNote.includes(tagText)) {
        const newNote = (currentNote + ' ' + tagText).trim();
        onUpdatePlayer(player.id, 'note', newNote);
      }
      setActivePlayerIndex(lastIndex);
    } else {
      alert('Tambahkan pemain terlebih dahulu!');
    }
  };

  return (
    <div className="mb-4">
      
      {/* Shortcut Tag Keterangan Cepat */}
      <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs no-print">
        <span className="font-bold text-slate-500">Tag Cepat Keterangan:</span>
        <button
          type="button"
          onClick={() => appendTag('PEMAIN')}
          className="bg-slate-200 hover:bg-slate-300 px-2 py-0.5 rounded font-semibold text-slate-700 transition-colors cursor-pointer"
        >
          + PEMAIN
        </button>
        <button
          type="button"
          onClick={() => appendTag('TANPA CELANA')}
          className="bg-red-200 hover:bg-red-300 px-2 py-0.5 rounded font-semibold text-red-800 transition-colors cursor-pointer"
        >
          + TANPA CELANA
        </button>
        <button
          type="button"
          onClick={() => appendTag('KIEPR')}
          className="bg-amber-200 hover:bg-amber-300 px-2 py-0.5 rounded font-semibold text-amber-800 transition-colors cursor-pointer"
        >
          + KIEPR
        </button>
        <button
          type="button"
          onClick={() => appendTag('COACH')}
          className="bg-blue-200 hover:bg-blue-300 px-2 py-0.5 rounded font-semibold text-blue-800 transition-colors cursor-pointer"
        >
          + COACH
        </button>
        <button
          type="button"
          onClick={() => appendTag('LENGAN PANJANG')}
          className="bg-purple-200 hover:bg-purple-300 px-2 py-0.5 rounded font-semibold text-purple-800 transition-colors cursor-pointer"
        >
          + LENGAN PANJANG
        </button>

        {activePlayerIndex !== null && players[activePlayerIndex] && (
          <span className="text-[11px] text-indigo-600 font-medium ml-2">
            (Pemain aktif: #{activePlayerIndex + 1} {players[activePlayerIndex].name || 'Tanpa Nama'})
          </span>
        )}
      </div>

      {/* Tabel Nameset */}
      <div className="mb-4 overflow-x-auto">
        <table className="w-full border-collapse border border-slate-300 text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-bold uppercase">
              <th className="border border-slate-300 p-2 text-center w-10">No</th>
              <th className="border border-slate-300 p-2 text-left">Nama Pemain</th>
              <th className="border border-slate-300 p-2 text-center w-20">Ukuran</th>
              <th className="border border-slate-300 p-2 text-center w-24">No. Punggung</th>
              <th className="border border-slate-300 p-2 text-left">Keterangan</th>
              <th className="border border-slate-300 p-2 text-center w-16 no-print">Aksi</th>
            </tr>
          </thead>
          <tbody id="playerTableBody">
            {players.length === 0 ? (
              <tr>
                <td colSpan={6} className="border p-8 text-center text-slate-400">
                  Belum ada data pemain. Klik tombol di bawah untuk menambah baris.
                </td>
              </tr>
            ) : (
              players.map((p, index) => {
                const noteUpper = (p.note || '').toUpperCase();
                const isKiper = noteUpper.includes('KIEPR') || noteUpper.includes('KIPER');
                const isTanpaCelana = noteUpper.includes('TANPA CELANA');
                const isDuplicateNum = p.number && duplicateNumbers.includes(p.number.trim());

                let rowBg = '';
                if (isTanpaCelana) {
                  rowBg = 'bg-red-50';
                } else if (isKiper) {
                  rowBg = 'bg-amber-50';
                }

                return (
                  <tr
                    key={p.id}
                    className={`${rowBg} hover:bg-slate-100 transition-colors ${
                      activePlayerIndex === index ? 'ring-1 ring-indigo-400 inset-0' : ''
                    }`}
                  >
                    {/* No */}
                    <td className="border border-slate-300 p-2 text-center font-bold text-slate-500">
                      {index + 1}
                    </td>

                    {/* Nama Pemain */}
                    <td className="border border-slate-300 p-1">
                      <input
                        type="text"
                        value={p.name}
                        onFocus={() => setActivePlayerIndex(index)}
                        onChange={(e) => onUpdatePlayer(p.id, 'name', e.target.value.toUpperCase())}
                        placeholder="NAMA PEMAIN"
                        className="w-full bg-transparent font-bold uppercase outline-none px-1 text-slate-900 placeholder:text-slate-300"
                      />
                    </td>

                    {/* Ukuran */}
                    <td className="border border-slate-300 p-1 text-center font-bold">
                      <select
                        value={p.size}
                        onChange={(e) => onUpdatePlayer(p.id, 'size', e.target.value)}
                        className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
                      >
                        {STANDARD_SIZES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>

                    {/* No Punggung */}
                    <td className="border border-slate-300 p-1 text-center font-mono font-bold">
                      <input
                        type="text"
                        value={p.number}
                        onFocus={() => setActivePlayerIndex(index)}
                        onChange={(e) => onUpdatePlayer(p.id, 'number', e.target.value)}
                        placeholder="-"
                        className={`w-full text-center bg-transparent font-mono font-bold outline-none ${
                          isDuplicateNum ? 'text-red-700 bg-red-100/60 rounded px-1' : 'text-slate-900'
                        }`}
                        title={isDuplicateNum ? `Nomor punggung #${p.number} terdeteksi kembar!` : undefined}
                      />
                    </td>

                    {/* Keterangan */}
                    <td className="border border-slate-300 p-1 font-semibold uppercase">
                      <input
                        type="text"
                        value={p.note}
                        onFocus={() => setActivePlayerIndex(index)}
                        onChange={(e) => onUpdatePlayer(p.id, 'note', e.target.value.toUpperCase())}
                        placeholder="PEMAIN"
                        className={`w-full bg-transparent font-semibold uppercase ${
                          isTanpaCelana ? 'text-red-600 font-bold' : 'text-slate-700'
                        } outline-none px-1`}
                      />
                    </td>

                    {/* Aksi */}
                    <td className="border border-slate-300 p-1 text-center no-print whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onMovePlayer(index, 'up')}
                          disabled={index === 0}
                          title="Geser ke atas"
                          className="text-slate-400 hover:text-slate-700 font-bold px-0.5 disabled:opacity-20 cursor-pointer"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => onMovePlayer(index, 'down')}
                          disabled={index === players.length - 1}
                          title="Geser ke bawah"
                          className="text-slate-400 hover:text-slate-700 font-bold px-0.5 disabled:opacity-20 cursor-pointer"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicatePlayer(index)}
                          title="Duplikasi baris ini"
                          className="text-blue-500 hover:text-blue-700 font-bold px-0.5 cursor-pointer"
                        >
                          📋
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemovePlayer(p.id)}
                          title="Hapus baris ini"
                          className="text-red-600 hover:text-red-800 font-bold px-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Tombol Tambah Pemain & Reset Helpers */}
      <div className="mb-6 flex justify-between items-center no-print">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAddPlayer}
            className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer shadow-2xs"
          >
            + Tambah Pemain
          </button>

          {onResetSample && (
            <button
              type="button"
              onClick={onResetSample}
              className="text-slate-500 hover:text-slate-800 text-xs px-2.5 py-1.5 rounded border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Reset Sampel
            </button>
          )}

          {onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-slate-400 hover:text-red-600 text-xs px-2 py-1.5 transition-colors cursor-pointer"
            >
              Kosongkan Tabel
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowSizeChart(!showSizeChart)}
          className="text-indigo-600 hover:text-indigo-800 font-bold text-xs underline cursor-pointer"
        >
          {showSizeChart ? '▲ Tutup Panduan Size Chart' : '📏 Lihat Panduan Size Chart'}
        </button>
      </div>

      {/* Panduan Size Chart Box */}
      {showSizeChart && (
        <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-lg mb-6 text-xs no-print transition-all">
          <p className="font-bold text-indigo-900 mb-1">
            Panduan Ukuran Standar Konveksi (Lebar x Panjang cm):
          </p>
          <p className="text-indigo-800 font-mono">
            <b>S:</b> 48x68 cm | <b>M:</b> 50x70 cm | <b>L:</b> 52x72 cm | <b>XL:</b> 54x74 cm | <b>XXL:</b> 56x76 cm | <b>3XL:</b> 58x78 cm
          </p>
        </div>
      )}

    </div>
  );
};
