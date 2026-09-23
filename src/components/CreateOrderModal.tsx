import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Plus,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  AlertTriangle,
  Trash2,
  Calendar,
  Users,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { OrderDetails, PlayerItem } from '../types/jersey';
import { FABRIC_OPTIONS, COLLAR_OPTIONS } from '../data/defaultOrder';
import { parseExcelPlayers, ExcelParseResult } from '../utils/excelParser';
import { calculateProductionRecap, formatRupiah } from '../utils/orderCalculations';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveOrder: (newOrder: OrderDetails) => void;
  generateNewSpkNo: () => string;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  onSaveOrder,
  generateNewSpkNo
}) => {
  // Form fields
  const [teamName, setTeamName] = useState('');
  const [spkNumber, setSpkNumber] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [fabricType, setFabricType] = useState('Dryfit Milano');
  const [collarType, setCollarType] = useState('V-Neck Variasi');
  const [orderValue, setOrderValue] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Excel state
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ExcelParseResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize/reset form whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setTeamName('');
      setSpkNumber(generateNewSpkNo());
      setOrderDate(new Date().toISOString().split('T')[0]);
      setDeadlineDate('');
      setClientContact('');
      setFabricType('Dryfit Milano');
      setCollarType('V-Neck Variasi');
      setOrderValue('');
      setNotes('');
      setExcelFile(null);
      setParseResult(null);
      setIsParsing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Process uploaded Excel file
  const handleProcessFile = (file: File) => {
    // Validate extension
    const nameLower = file.name.toLowerCase();
    if (!nameLower.endsWith('.xlsx') && !nameLower.endsWith('.xls')) {
      setParseResult({
        players: [],
        unmappedColumns: [],
        totalRows: 0,
        duplicateNumbers: [],
        error: 'File harus berformat Excel (.xlsx atau .xls)'
      });
      return;
    }

    if (file.size === 0) {
      setParseResult({
        players: [],
        unmappedColumns: [],
        totalRows: 0,
        duplicateNumbers: [],
        error: 'File Excel kosong (0 bytes)'
      });
      return;
    }

    setExcelFile(file);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const result = parseExcelPlayers(buffer);
        setParseResult(result);
      } catch (err: any) {
        setParseResult({
          players: [],
          unmappedColumns: [],
          totalRows: 0,
          duplicateNumbers: [],
          error: `Gagal membaca file: ${err?.message || 'Format tidak valid'}`
        });
      } finally {
        setIsParsing(false);
      }
    };

    reader.onerror = () => {
      setIsParsing(false);
      setParseResult({
        players: [],
        unmappedColumns: [],
        totalRows: 0,
        duplicateNumbers: [],
        error: 'Gagal membuka file Excel.'
      });
    };

    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleClearExcel = () => {
    setExcelFile(null);
    setParseResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit order creation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      alert('Mohon isi Nama Customer / Tim terlebih dahulu.');
      return;
    }

    const players: PlayerItem[] = parseResult?.players || [];

    const newOrder: OrderDetails = {
      id: `order-${Date.now()}`,
      spkNumber: spkNumber.trim() || generateNewSpkNo(),
      teamName: teamName.trim().toUpperCase(),
      clientContact: clientContact.trim(),
      orderDate: orderDate || new Date().toISOString().split('T')[0],
      deadlineDate: deadlineDate || '',
      specialNotes: notes.trim(),
      pantsColor: 'Polos Non-Print + Nomor Polyflex',
      status: 'Draft',
      orderValue: typeof orderValue === 'number' ? orderValue : (Number(orderValue) || 0),
      assignedWorkerIds: [],
      workerAssignments: [],
      cuttingStatus: 'Belum Mulai',
      sewingStatus: 'Belum Mulai',
      workerNotes: '',
      fabricType: fabricType || 'Dryfit Milano',
      collarType: collarType || 'V-Neck Variasi',
      printingType: 'Bahan Siap Jahit (Print Selesai)', // ProStitch business constraint
      workflow: {
        cutting: { patternCut: false, pantsCollarCut: false, specialItemsSeparated: false },
        sewing: { bodySleeveJoined: false, collarElasticSewed: false, overdeckFinished: false }
      },
      players,
      photos: [],
      updatedAt: new Date().toLocaleString('id-ID')
    };

    onSaveOrder(newOrder);
    onClose();
  };

  const recap = parseResult?.players ? calculateProductionRecap(parseResult.players) : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Tambah Order Baru
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Buat SPK Jahit & Import Data Pemain dari File Excel Klien
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Data SPK & Order */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Data SPK & Tim / Klien
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nama Tim / Customer */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Customer / Tim <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: GARUDA FC / KLIEN SURABAYA"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Nomor SPK */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor SPK
                </label>
                <input
                  type="text"
                  value={spkNumber}
                  onChange={(e) => setSpkNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tanggal Order */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" /> Tanggal Order
                </label>
                <input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-red-500" /> Deadline Produksi
                </label>
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Jenis Bahan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jenis Bahan Kain
                </label>
                <select
                  value={fabricType}
                  onChange={(e) => setFabricType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {FABRIC_OPTIONS.map((fab) => (
                    <option key={fab} value={fab}>
                      {fab}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model Kerah */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Model Kerah / Leher
                </label>
                <select
                  value={collarType}
                  onChange={(e) => setCollarType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {COLLAR_OPTIONS.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kontak Klien */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kontak / WhatsApp Klien
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 0812-3456-7890"
                  value={clientContact}
                  onChange={(e) => setClientContact(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Catatan SPK */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Khusus SPK
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kerah variasi putih, celana pakai tali"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Upload Excel File */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  2. Upload File Pemain / Nameset (Excel .xlsx / .xls)
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Opsional — boleh dibuat kosong
              </span>
            </div>

            {/* Hidden Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls"
              className="hidden"
            />

            {!excelFile ? (
              /* Dropzone */
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-50/60'
                    : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800 mb-1">
                  Klik atau Tarik File Excel ke Sini
                </p>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-3">
                  Mendukung file format <strong>.xlsx</strong> atau <strong>.xls</strong> dari klien. Kolom otomatis dikenali: Nama, Ukuran/Size, Nomor Punggung, Keterangan.
                </p>
                <button
                  type="button"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Pilih File Excel Klien</span>
                </button>
              </div>
            ) : (
              /* File Loaded View */
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 truncate max-w-xs md:max-w-md">
                        {excelFile.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {(excelFile.size / 1024).toFixed(1)} KB • {parseResult?.players.length || 0} pemain terbaca
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearExcel}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus File</span>
                  </button>
                </div>

                {isParsing && (
                  <div className="text-center py-4 text-xs font-semibold text-slate-600">
                    Memproses dan memetakan data Excel...
                  </div>
                )}

                {parseResult?.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-red-800 text-xs">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Gagal Membaca File:</strong> {parseResult.error}
                    </div>
                  </div>
                )}

                {/* Unmapped columns alert */}
                {parseResult?.unmappedColumns && parseResult.unmappedColumns.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start gap-2 text-amber-900 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Info Kolom: </span>
                      Kolom berikut tidak dipetakan ke profil pemain: <code className="bg-amber-100 px-1 py-0.5 rounded text-[11px] font-mono">{parseResult.unmappedColumns.join(', ')}</code>
                    </div>
                  </div>
                )}

                {/* Duplicate numbers alert */}
                {parseResult?.duplicateNumbers && parseResult.duplicateNumbers.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start gap-2 text-amber-900 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Peringatan Nomor Kembar: </span>
                      Nomor punggung ganda terdeteksi: <strong className="text-amber-800">No. {parseResult.duplicateNumbers.join(', ')}</strong>. Data kedua pemain tetap disimpan.
                    </div>
                  </div>
                )}

                {/* Preview Table */}
                {parseResult && parseResult.players.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span>Preview Data Pemain ({parseResult.players.length} Pemain)</span>
                      </div>
                      {recap && (
                        <div className="flex flex-wrap gap-1.5 text-[11px]">
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                            Jersey: {recap.totalJersey}
                          </span>
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                            Celana: {recap.totalCelana}
                          </span>
                          {recap.kiperCount > 0 && (
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                              Kiper: {recap.kiperCount}
                            </span>
                          )}
                          {recap.tanpaCelanaCount > 0 && (
                            <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold">
                              Tanpa Celana: {recap.tanpaCelanaCount}
                            </span>
                          )}
                          {recap.lenganPanjangCount > 0 && (
                            <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold">
                              Lengan Panjang: {recap.lenganPanjangCount}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-lg bg-white shadow-2xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                          <tr>
                            <th className="p-2 w-10 text-center">No</th>
                            <th className="p-2">Nama Lengkap</th>
                            <th className="p-2 w-20 text-center">Ukuran</th>
                            <th className="p-2 w-24 text-center">No. Punggung</th>
                            <th className="p-2">Keterangan</th>
                            <th className="p-2 w-24 text-center">Lengan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parseResult.players.map((p, idx) => (
                            <tr key={p.id} className="hover:bg-slate-50">
                              <td className="p-2 text-center text-slate-400 font-mono">
                                {idx + 1}
                              </td>
                              <td className="p-2 font-bold text-slate-900">
                                {p.name}
                              </td>
                              <td className="p-2 text-center">
                                <span className="inline-block bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                                  {p.size}
                                </span>
                              </td>
                              <td className="p-2 text-center font-mono font-bold text-blue-700">
                                {p.number ? `No. ${p.number}` : '-'}
                              </td>
                              <td className="p-2 text-slate-600 text-[11px]">
                                {p.note || 'PEMAIN'}
                              </td>
                              <td className="p-2 text-center text-[11px]">
                                <span
                                  className={`px-1.5 py-0.5 rounded font-semibold ${
                                    p.sleeve === 'panjang'
                                      ? 'bg-indigo-100 text-indigo-700'
                                      : 'text-slate-500'
                                  }`}
                                >
                                  {p.sleeve === 'panjang' ? 'Panjang' : 'Pendek'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Business constraint reminder */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>Ketentuan Workshop ProStitch:</strong> Klien membawa bahan yang sudah selesai printing. SPK baru langsung dimulai dari status <strong>Draft</strong> dan siap masuk ke alur potong & jahit. Jika tidak mengunggah file Excel, order tetap dibuat dengan daftar pemain kosong.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isParsing || !teamName.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Order SPK</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
