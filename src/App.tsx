/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OrderInfoCard } from './components/OrderInfoCard';
import { WorkerAssignmentModule } from './components/WorkerAssignmentModule';
import { WorkerModal } from './components/WorkerModal';
import { OrderListModal } from './components/OrderListModal';
import { WorkflowModules } from './components/WorkflowModules';
import { PlayerTable } from './components/PlayerTable';
import { PhotoProofModule } from './components/PhotoProofModule';
import { AwarenessBanner } from './components/AwarenessBanner';
import { ProductionSummary } from './components/ProductionSummary';
import { BulkImportModal } from './components/BulkImportModal';
import { SpkPrintView } from './components/SpkPrintView';
import { ProStitchLogo } from './components/ProStitchLogo';
import { OrderDetails, PlayerItem, WorkflowProgress, WorkerItem, OrderStatus } from './types/jersey';
import { DEFAULT_INITIAL_ORDER, DEFAULT_WORKERS } from './data/defaultOrder';
import { calculateProductionRecap } from './utils/orderCalculations';
import { Check, Save } from 'lucide-react';

const STORAGE_KEY_ORDERS_DB = 'prostitch_orders_db';
const STORAGE_KEY_CURRENT_ORDER = 'jersey_spk_current_order_v5';
const STORAGE_KEY_WORKERS = 'prostitch_workers';
const STORAGE_KEY_PLAYERS = 'prostitch_players';

function generateSpkNo(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `SPK-${year}/${month}/${randomNum}`;
}

export default function App() {
  // Master orders database in localStorage
  const [orders, setOrders] = useState<OrderDetails[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ORDERS_DB);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((o: any) => ({
            ...o,
            spkNumber: o.spkNumber || o.spkNo || generateSpkNo(),
            deadlineDate: o.deadlineDate || o.deadline || '',
            status: o.status || 'Draft',
            players: Array.isArray(o.players) ? o.players : [],
            assignedWorkerIds: o.assignedWorkerIds || (o.workers ? o.workers.filter((w: any) => w.active).map((w: any) => w.id) : [1, 3])
          }));
        }
      }
      // Check legacy list
      const legacy = localStorage.getItem('jersey_spk_saved_orders_v5');
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
          return parsedLegacy;
        }
      }
    } catch (e) {
      console.error('Error loading orders db', e);
    }
    return [DEFAULT_INITIAL_ORDER];
  });

  // Current active order in editor
  const [currentOrder, setCurrentOrder] = useState<OrderDetails>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_ORDER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.players) && parsed.players.length > 0) {
          return {
            ...parsed,
            spkNumber: parsed.spkNumber || parsed.spkNo || 'SPK-2026/09/001',
            status: parsed.status || 'Draft',
          };
        }
      }
    } catch (e) {
      console.error('Error loading current order', e);
    }
    return DEFAULT_INITIAL_ORDER;
  });

  // Master workers list
  const [workers, setWorkers] = useState<WorkerItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WORKERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading workers', e);
    }
    return DEFAULT_WORKERS;
  });

  // Modals state
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [isOrderListModalOpen, setIsOrderListModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync orders db to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS_DB, JSON.stringify(orders));
    } catch (e) {
      console.error('Error saving orders db', e);
    }
  }, [orders]);

  // Sync current order to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT_ORDER, JSON.stringify(currentOrder));
      localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(currentOrder.players));
    } catch (e) {
      console.error('Error saving current order', e);
    }
  }, [currentOrder]);

  // Sync workers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WORKERS, JSON.stringify(workers));
    } catch (e) {
      console.error('Error saving workers', e);
    }
  }, [workers]);

  const recap = calculateProductionRecap(currentOrder.players);

  // Handlers for Order fields
  const handleUpdateOrderField = (field: keyof OrderDetails, value: any) => {
    setCurrentOrder((prev) => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toLocaleString('id-ID')
    }));
  };

  // ➕ Order Baru (Sesuai fungsi createNewOrder() pada HTML)
  const createNewOrder = () => {
    const newSpkId = `order-${Date.now()}`;
    const newSpkNo = generateSpkNo();

    const newOrder: OrderDetails = {
      id: newSpkId,
      spkNumber: newSpkNo,
      teamName: 'TIM BARU',
      clientContact: '',
      orderDate: new Date().toISOString().split('T')[0],
      deadlineDate: '',
      fabricType: 'Dryfit Milano',
      collarType: 'V-Neck Variasi',
      printingType: 'Full Print Sublimasi',
      pantsColor: 'Polos Non-Print + Nomor Polyflex',
      assignedWorkerIds: [1, 3], // Default APLES (potong) & AKOK (jahit)
      specialNotes: '',
      status: 'Draft',
      workflow: {
        cutting: { patternCut: false, pantsCollarCut: false, specialItemsSeparated: false },
        sewing: { bodySleeveJoined: false, collarElasticSewed: false, overdeckFinished: false }
      },
      photos: [],
      players: [
        { id: `p-${Date.now()}-1`, name: 'PEMAIN 1', size: 'M', number: '10', note: 'PEMAIN', sleeve: 'pendek' },
        { id: `p-${Date.now()}-2`, name: 'PEMAIN 2', size: 'L', number: '1', note: 'KIPER', sleeve: 'pendek' }
      ],
      updatedAt: new Date().toLocaleString('id-ID')
    };

    setCurrentOrder(newOrder);
    setSaveSuccess(false);
  };

  // 💾 Simpan Order (Sesuai fungsi saveCurrentOrder() pada HTML)
  const saveCurrentOrder = () => {
    const updatedOrder: OrderDetails = {
      ...currentOrder,
      teamName: currentOrder.teamName.trim().toUpperCase() || 'TANPA NAMA TIM',
      updatedAt: new Date().toLocaleString('id-ID'),
    };

    setCurrentOrder(updatedOrder);

    // Save or update in orders database
    setOrders((prev) => {
      const index = prev.findIndex((o) => o.id === updatedOrder.id);
      let newOrders: OrderDetails[];
      if (index >= 0) {
        newOrders = [...prev];
        newOrders[index] = updatedOrder;
      } else {
        newOrders = [updatedOrder, ...prev];
      }
      try {
        localStorage.setItem(STORAGE_KEY_ORDERS_DB, JSON.stringify(newOrders));
        localStorage.setItem(STORAGE_KEY_WORKERS, JSON.stringify(workers));
        localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(updatedOrder.players));
        localStorage.setItem(STORAGE_KEY_CURRENT_ORDER, JSON.stringify(updatedOrder));
      } catch (err) {
        console.error(err);
      }
      return newOrders;
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Load Order from list
  const loadOrder = (id: string) => {
    const found = orders.find((o) => o.id === id);
    if (!found) return;

    setCurrentOrder(found);
    setIsOrderListModalOpen(false);
  };

  // Delete Order
  const deleteOrder = (id: string) => {
    setOrders((prev) => {
      const remaining = prev.filter((o) => o.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY_ORDERS_DB, JSON.stringify(remaining));
      } catch (e) {
        console.error(e);
      }
      return remaining;
    });

    if (currentOrder.id === id) {
      createNewOrder();
    }
  };

  // Handlers for Worker Assignment
  const handleToggleWorker = (id: number | string) => {
    setCurrentOrder((prev) => {
      const currentAssigned = prev.assignedWorkerIds || [];
      const isAssigned = currentAssigned.includes(id);
      const newAssigned = isAssigned
        ? currentAssigned.filter((wId) => wId !== id)
        : [...currentAssigned, id];
      return {
        ...prev,
        assignedWorkerIds: newAssigned,
        updatedAt: new Date().toLocaleString('id-ID'),
      };
    });
  };

  const handleAddWorker = (name: string, role: 'potong' | 'jahit') => {
    const newWorker: WorkerItem = {
      id: Date.now(),
      name,
      role,
      active: true,
    };
    setWorkers((prev) => [...prev, newWorker]);
    setCurrentOrder((prev) => ({
      ...prev,
      assignedWorkerIds: [...(prev.assignedWorkerIds || []), newWorker.id],
      updatedAt: new Date().toLocaleString('id-ID'),
    }));
  };

  const handleDeleteWorker = (id: number | string) => {
    setWorkers((prev) => prev.filter((w) => w.id !== id));
    setCurrentOrder((prev) => ({
      ...prev,
      assignedWorkerIds: (prev.assignedWorkerIds || []).filter((wId) => wId !== id),
      updatedAt: new Date().toLocaleString('id-ID'),
    }));
  };

  const handleUpdateWorkflow = (workflow: WorkflowProgress) => {
    setCurrentOrder((prev) => ({
      ...prev,
      workflow,
      updatedAt: new Date().toLocaleString('id-ID'),
    }));
  };

  const handleUpdatePhotos = (photos: string[]) => {
    setCurrentOrder((prev) => ({
      ...prev,
      photos,
      updatedAt: new Date().toLocaleString('id-ID'),
    }));
  };

  // Handlers for Players
  const handleUpdatePlayer = (id: string, key: keyof PlayerItem, value: any) => {
    setCurrentOrder((prev) => ({
      ...prev,
      players: prev.players.map((p) => {
        if (p.id !== id) return p;
        return { ...p, [key]: value };
      }),
      updatedAt: new Date().toLocaleString('id-ID')
    }));
  };

  const handleAddPlayer = () => {
    const newPlayer: PlayerItem = {
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: '',
      size: 'M',
      number: '',
      note: 'PEMAIN',
      sleeve: 'pendek'
    };
    setCurrentOrder((prev) => ({
      ...prev,
      players: [...prev.players, newPlayer],
      updatedAt: new Date().toLocaleString('id-ID')
    }));
  };

  const handleRemovePlayer = (id: string) => {
    setCurrentOrder((prev) => ({
      ...prev,
      players: prev.players.filter((p) => p.id !== id),
      updatedAt: new Date().toLocaleString('id-ID')
    }));
  };

  const handleDuplicatePlayer = (index: number) => {
    const target = currentOrder.players[index];
    if (!target) return;
    const duplicated: PlayerItem = {
      ...target,
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    const newPlayers = [...currentOrder.players];
    newPlayers.splice(index + 1, 0, duplicated);
    setCurrentOrder((prev) => ({
      ...prev,
      players: newPlayers,
      updatedAt: new Date().toLocaleString('id-ID')
    }));
  };

  const handleMovePlayer = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= currentOrder.players.length) return;
    const newPlayers = [...currentOrder.players];
    const [moved] = newPlayers.splice(index, 1);
    newPlayers.splice(newIndex, 0, moved);
    setCurrentOrder((prev) => ({
      ...prev,
      players: newPlayers,
      updatedAt: new Date().toLocaleString('id-ID')
    }));
  };

  const handleResetSample = () => {
    if (window.confirm('Reset data pemain ke contoh ringkas (Saffana, Xavier, Binus, Coach)?')) {
      setCurrentOrder((prev) => ({
        ...prev,
        players: [
          { id: 'p1', name: 'SAFFANA', size: 'S', number: '15', sleeve: 'pendek', note: 'PEMAIN' },
          { id: 'p2', name: 'XAVIER', size: 'XXL', number: '23', sleeve: 'pendek', note: 'PEMAIN TANPA CELANA' },
          { id: 'p3', name: 'BINUS', size: 'L', number: '1', sleeve: 'pendek', note: 'KIEPR' },
          { id: 'p4', name: 'COACH', size: 'XXL', number: '-', sleeve: 'pendek', note: 'COACH' },
        ],
        updatedAt: new Date().toLocaleString('id-ID')
      }));
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Kosongkan semua baris pemain di tabel ini?')) {
      setCurrentOrder((prev) => ({
        ...prev,
        players: [],
        updatedAt: new Date().toLocaleString('id-ID')
      }));
    }
  };

  const handleImportPlayers = (newPlayers: PlayerItem[], mode: 'replace' | 'append') => {
    setCurrentOrder((prev) => ({
      ...prev,
      players: mode === 'replace' ? newPlayers : [...prev.players, ...newPlayers],
      updatedAt: new Date().toLocaleString('id-ID')
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-2 md:p-6 font-sans">
      
      {/* Top Navbar */}
      <Navbar
        currentOrder={currentOrder}
        savedOrders={orders}
        onSelectOrder={loadOrder}
        onNewOrder={createNewOrder}
        onPrint={handlePrint}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenOrderList={() => setIsOrderListModalOpen(true)}
      />

      {/* Print-Only Document with Branding & Digital Stamp */}
      <div className="print-only">
        <SpkPrintView
          order={currentOrder}
          recap={recap}
          workers={workers}
          onPrint={handlePrint}
        />
      </div>

      {/* Main Screen Content Card */}
      <main className="no-print max-w-6xl mx-auto bg-white rounded-xl shadow-md p-4 md:p-8 mt-4 border border-slate-200">
        
        {/* Header Utama dengan Logo ProStitch Jersey & Tombol Aksi Lengkap */}
        <div className="border-b pb-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <ProStitchLogo
              id="logoPreview"
              className="h-16 w-auto object-contain"
              size="lg"
              allowUpload={true}
            />
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                PROSTITCH JERSEY
              </h1>
              <p className="text-xs text-slate-500 font-semibold">
                Custom Sportswear Tailor & Workshop Control Sheet
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 no-print">
            {/* ➕ Order Baru */}
            <button
              onClick={createNewOrder}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
            >
              ➕ Order Baru
            </button>

            {/* 💾 Simpan Order */}
            <button
              onClick={saveCurrentOrder}
              className="bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>💾 Simpan Order</span>
                </>
              )}
            </button>

            {/* 📁 Daftar Order (Badge Count) */}
            <button
              onClick={() => setIsOrderListModalOpen(true)}
              className="bg-amber-500 text-white px-3 py-2 rounded-lg hover:bg-amber-600 text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
            >
              📁 Daftar Order (<span id="orderCountBadge">{orders.length}</span>)
            </button>

            {/* ⚙️ Pekerja */}
            <button
              onClick={() => setIsWorkerModalOpen(true)}
              className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              ⚙️ Pekerja
            </button>

            {/* 🖨️ Cetak A4 */}
            <button
              onClick={handlePrint}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              🖨️ Cetak A4
            </button>
          </div>
        </div>

        {/* Feedback Notifikasi Simpan */}
        {saveSuccess && (
          <div className="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-800 px-3.5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-2xs">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Order & data pekerja berhasil disimpan ke daftar database!</span>
          </div>
        )}

        {/* Detail SPK & Order Info (Format 5 Kolom: Team, SPK No, WA, Deadline, Status) */}
        <OrderInfoCard
          order={currentOrder}
          onChange={handleUpdateOrderField}
        />

        {/* Ceklis Nama Pegawai Per Order */}
        <WorkerAssignmentModule
          workers={workers}
          assignedWorkerIds={currentOrder.assignedWorkerIds || []}
          onToggleWorker={handleToggleWorker}
          onOpenManageModal={() => setIsWorkerModalOpen(true)}
        />

        {/* Modul Alur Workshop */}
        <WorkflowModules
          workflow={currentOrder.workflow}
          onChange={handleUpdateWorkflow}
        />

        {/* Tabel Nameset */}
        <PlayerTable
          players={currentOrder.players}
          onUpdatePlayer={handleUpdatePlayer}
          onAddPlayer={handleAddPlayer}
          onRemovePlayer={handleRemovePlayer}
          onDuplicatePlayer={handleDuplicatePlayer}
          onMovePlayer={handleMovePlayer}
          onResetSample={handleResetSample}
          onClearAll={handleClearAll}
          onOpenImport={() => setIsImportOpen(true)}
          duplicateNumbers={recap.duplicateNumbers}
        />

        {/* Rekapitulasi Otomatis (Material Produksi) */}
        <ProductionSummary
          recap={recap}
        />

        {/* Dokumentasi Foto Jersey Beres Dijahit */}
        <PhotoProofModule
          photos={currentOrder.photos}
          onChange={handleUpdatePhotos}
        />

        {/* Awareness Alert */}
        <AwarenessBanner
          recap={recap}
        />

      </main>

      {/* Modal Riwayat Order (#orderListModal) */}
      <OrderListModal
        isOpen={isOrderListModalOpen}
        onClose={() => setIsOrderListModalOpen(false)}
        orders={orders}
        currentOrderId={currentOrder.id}
        onSelectOrder={loadOrder}
        onDeleteOrder={deleteOrder}
        onNewOrder={createNewOrder}
      />

      {/* Modal Kelola Master Pekerja (#workerModal) */}
      <WorkerModal
        isOpen={isWorkerModalOpen}
        onClose={() => setIsWorkerModalOpen(false)}
        workers={workers}
        onAddWorker={handleAddWorker}
        onDeleteWorker={handleDeleteWorker}
      />

      {/* Paste / Bulk Import Modal */}
      <BulkImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImportPlayers}
      />

    </div>
  );
}
