import React, { useState } from 'react';
import { 
  Printer, 
  FileSpreadsheet, 
  FolderOpen,
  PlusCircle,
  Check,
  ClipboardPaste,
  MessageSquare,
  MoreVertical,
  Settings
} from 'lucide-react';
import { OrderDetails } from '../types/jersey';
import { formatWhatsAppRecap, exportToCSV } from '../utils/orderCalculations';
import { ProStitchLogo } from './ProStitchLogo';

interface NavbarProps {
  currentOrder: OrderDetails;
  savedOrders: OrderDetails[];
  onSelectOrder: (orderId: string) => void;
  onNewOrder: () => void;
  onPrint: () => void;
  onOpenImport: () => void;
  onOpenOrderList?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentOrder,
  savedOrders,
  onSelectOrder,
  onNewOrder,
  onPrint,
  onOpenImport,
  onOpenOrderList,
}) => {
  const [copied, setCopied] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const handleCopyWhatsApp = async () => {
    const text = formatWhatsAppRecap(currentOrder);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const runMoreAction = (action: () => void) => {
    setIsMoreOpen(false);
    action();
  };

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-2.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <ProStitchLogo className="h-10 w-auto object-contain" size="sm" />
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight leading-tight">
                PROSTITCH JERSEY
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Workshop Control
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMoreOpen((open) => !open)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Lainnya"
            aria-expanded={isMoreOpen}
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <div className="hidden md:flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          {onOpenOrderList && (
            <button
              onClick={onOpenOrderList}
              className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Daftar & Riwayat Orderan"
            >
              <FolderOpen className="w-3.5 h-3.5 text-white" />
              <span>Daftar Order ({savedOrders.length})</span>
            </button>
          )}

          <button
            onClick={onNewOrder}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
            title="Tambah Order Baru (SPK & Excel)"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Tambah Order</span>
          </button>

          <button
            onClick={onOpenImport}
            className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>Impor Data</span>
          </button>

          <button
            onClick={handleCopyWhatsApp}
            className="bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Salin WA</span>
              </>
            )}
          </button>

          <button
            onClick={() => exportToCSV(currentOrder)}
            className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={onPrint}
            className="bg-slate-900 text-white px-3.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak A4</span>
          </button>
        </div>
      </div>

      {isMoreOpen && (
        <div className="mobile-more-menu absolute right-3 top-[58px] w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-2">
          <div className="px-3 py-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
            Lainnya
          </div>

          {onOpenOrderList && (
            <button
              type="button"
              onClick={() => runMoreAction(onOpenOrderList)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <FolderOpen className="w-5 h-5 text-amber-500" />
              <span>Daftar Order</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => runMoreAction(onOpenImport)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <ClipboardPaste className="w-5 h-5 text-blue-600" />
            <span>Impor Data</span>
          </button>

          <button
            type="button"
            onClick={() => runMoreAction(() => exportToCSV(currentOrder))}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            <span>Ekspor CSV</span>
          </button>

          <button
            type="button"
            onClick={() => runMoreAction(handleCopyWhatsApp)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <span>Salin WA</span>
          </button>

          <button
            type="button"
            onClick={() => runMoreAction(onPrint)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <Printer className="w-5 h-5 text-slate-700" />
            <span>Cetak A4</span>
          </button>

          <div className="mt-1 border-t border-slate-100 pt-1">
            <button
              type="button"
              disabled
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-sm font-bold text-slate-400 cursor-not-allowed"
              title="Pengaturan akan dihubungkan ke modul konfigurasi"
            >
              <Settings className="w-5 h-5" />
              <span>Pengaturan</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
