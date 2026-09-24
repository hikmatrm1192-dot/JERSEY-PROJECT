/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OrderInfoCard } from './components/OrderInfoCard';
import { WorkerAssignmentModule } from './components/WorkerAssignmentModule';
import { WorkerModal } from './components/WorkerModal';
import { AssignWorkerModal } from './components/AssignWorkerModal';
import { OrderListModal } from './components/OrderListModal';
import { WorkflowModules } from './components/WorkflowModules';
import { PlayerTable } from './components/PlayerTable';
import { PhotoProofModule } from './components/PhotoProofModule';
import { AwarenessBanner } from './components/AwarenessBanner';
import { ProductionSummary } from './components/ProductionSummary';
import { BulkImportModal } from './components/BulkImportModal';
import { CreateOrderModal } from './components/CreateOrderModal';
import { SpkPrintView } from './components/SpkPrintView';
import { ProStitchLogo } from './components/ProStitchLogo';
import { OrderFinancialModule } from './components/OrderFinancialModule';
import { OrderDetails, PlayerItem, WorkflowProgress, WorkerItem, WorkerRole, WorkerAssignment, OperationalCost } from './types/jersey';
import { DEFAULT_INITIAL_ORDER, DEFAULT_WORKERS } from './data/defaultOrder';
import { calculateProductionRecap } from './utils/orderCalculations';
import { Check, Save, PlusCircle, LayoutDashboard, ClipboardList, Factory, Wallet, Camera, Users, Printer, MessageCircle } from 'lucide-react';

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
          return parsed.map((o: any) => {
            const isDefault = o.id === DEFAULT_INITIAL_ORDER.id;
            return {
              ...DEFAULT_INITIAL_ORDER,
              ...o,
              spkNumber: o.spkNumber || o.spkNo || generateSpkNo(),
              deadlineDate: o.deadlineDate || o.deadline || '',
              status: o.status || 'Draft',
              orderValue: typeof o.orderValue === 'number' ? o.orderValue : (o.orderValue !== undefined && o.orderValue !== null && !isNaN(Number(o.orderValue)) ? Number(o.orderValue) : (isDefault ? DEFAULT_INITIAL_ORDER.orderValue : 0)),
              players: Array.isArray(o.players) ? o.players : [],
              assignedWorkerIds: Array.isArray(o.assignedWorkerIds)
                ? o.assignedWorkerIds
                : (isDefault ? [1, 3] : []),
              workerAssignments: Array.isArray(o.workerAssignments)
                ? o.workerAssignments
                : (isDefault ? (DEFAULT_INITIAL_ORDER.workerAssignments || []) : []),
              operationalCosts: Array.isArray(o.operationalCosts)
                ? o.operationalCosts
                : [],
              workflow: o.workflow || {
                cutting: { patternCut: false, pantsCollarCut: false, specialItemsSeparated: false },
                sewing: { bodySleeveJoined: false, collarElasticSewed: false, overdeckFinished: false }
              }
            };
          });
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
        // Validasi keberadaan order berdasarkan data order (id / spkNumber / teamName), bukan jumlah player
        if (parsed && typeof parsed === 'object' && (parsed.id || parsed.spkNumber || parsed.spkNo || parsed.teamName)) {
          const isDefault = parsed.id === DEFAULT_INITIAL_ORDER.id;
          return {
            ...DEFAULT_INITIAL_ORDER,
            ...parsed,
            spkNumber: parsed.spkNumber || parsed.spkNo || 'SPK-2026/09/001',
            status: parsed.status || 'Draft',
            orderValue: typeof parsed.orderValue === 'number' ? parsed.orderValue : (parsed.orderValue !== undefined && parsed.orderValue !== null && !isNaN(Number(parsed.orderValue)) ? Number(parsed.orderValue) : (isDefault ? DEFAULT_INITIAL_ORDER.orderValue : 0)),
            players: Array.isArray(parsed.players) ? parsed.players : [],
            assignedWorkerIds: Array.isArray(parsed.assignedWorkerIds)
              ? parsed.assignedWorkerIds
              : (isDefault ? [1, 3] : []),
            workerAssignments: Array.isArray(parsed.workerAssignments)
              ? parsed.workerAssignments
              : (isDefault ? (DEFAULT_INITIAL_ORDER.workerAssignments || []) : []),
            operationalCosts: Array.isArray(parsed.operationalCosts)
              ? parsed.operationalCosts
              : [],
            workflow: parsed.workflow || {
              cutting: { patternCut: false, pantsCollarCut: false, specialItemsSeparated: false },
              sewing: { bodySleeveJoined: false, collarElasticSewed: false, overdeckFinished: false }
            }
          };
        }
      }

      // Fallback: Jika current order belum ada, periksa database orders tersimpan
      const savedDb = localStorage.getItem(STORAGE_KEY_ORDERS_DB);
      if (savedDb) {
        const parsedDb = JSON.parse(savedDb);
        if (Array.isArray(parsedDb) && parsedDb.length > 0 && parsedDb[0] && typeof parsedDb[0] === 'object') {
          const firstOrder = parsedDb[0];
          const isDefault = firstOrder.id === DEFAULT_INITIAL_ORDER.id;
          return {
            ...DEFAULT_INITIAL_ORDER,
            ...firstOrder,
            spkNumber: firstOrder.spkNumber || firstOrder.spkNo || 'SPK-2026/09/001',
            status: firstOrder.status || 'Draft',
            orderValue: typeof firstOrder.orderValue === 'number' ? firstOrder.orderValue : (firstOrder.orderValue !== undefined && firstOrder.orderValue !== null && !isNaN(Number(firstOrder.orderValue)) ? Number(firstOrder.orderValue) : (isDefault ? DEFAULT_INITIAL_ORDER.orderValue : 0)),
            players: Array.isArray(firstOrder.players) ? firstOrder.players : [],
            assignedWorkerIds: Array.isArray(firstOrder.assignedWorkerIds)
              ? firstOrder.assignedWorkerIds
              : (isDefault ? [1, 3] : []),
            workerAssignments: Array.isArray(firstOrder.workerAssignments)
              ? firstOrder.workerAssignments
              : (isDefault ? (DEFAULT_INITIAL_ORDER.workerAssignments || []) : []),
            operationalCosts: Array.isArray(firstOrder.operationalCosts)
              ? firstOrder.operationalCosts
              : [],
            workflow: firstOrder.workflow || {
              cutting: { patternCut: false, pantsCollarCut: false, specialItemsSeparated: false },
              sewing: { bodySleeveJoined: false, collarElasticSewed: false, overdeckFinished: false }
            }
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
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [isOrderListModalOpen, setIsOrderListModalOpen] = useState(false);
  const [isAssignWorkerModalOpen, setIsAssignWorkerModalOpen] = useState(false);
  const [assignmentOrder, setAssignmentOrder] = useState<OrderDetails | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'order' | 'produksi' | 'keuangan' | 'selesai' | 'pekerja' | 'cetak'>('dashboard');

  // Sync orders db to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS_DB, JSON.stringify(orders));
      setStorageError(null);
    } catch (e: any) {
      console.error('Error saving orders db', e);
      if (e?.name === 'QuotaExceededError' || e?.code === 22) {
        setStorageError('Penyimpanan browser penuh. Foto belum berhasil disimpan. Hapus beberapa foto/order lama lalu coba lagi.');
      }
    }
  }, [orders]);

  // Sync current order to localStorage and update in orders list if present
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT_ORDER, JSON.stringify(currentOrder));
      localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(currentOrder.players));
      setStorageError(null);
      setOrders((prev) => {
        const index = prev.findIndex((o) => o.id === currentOrder.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = currentOrder;
          return updated;
        }
        return [currentOrder, ...prev];
      });
    } catch (e: any) {
      console.error('Error saving current order', e);
      if (e?.name === 'QuotaExceededError' || e?.code === 22) {
        setStorageError('Penyimpanan browser penuh. Foto belum berhasil disimpan. Hapus beberapa foto/order lama lalu coba lagi.');
      }
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

  // ➕ Tambah Order (Buka Modal Pembuatan Order SPK & Excel)
  const createNewOrder = () => {
    setIsCreateOrderModalOpen(true);
  };

  const handleSaveNewOrder = (newOrder: OrderDetails) => {
    setCurrentOrder(newOrder);
    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // 💾 Simpan Order (Sesuai fungsi saveCurrentOrder() pada HTML)
  const saveCurrentOrder = () => {
    const updatedOrder: OrderDetails = {
      ...currentOrder,
      teamName: currentOrder.teamName.trim().toUpperCase() || 'TANPA NAMA TIM',
      orderValue: typeof currentOrder.orderValue === 'number' ? currentOrder.orderValue : (Number(currentOrder.orderValue) || 0),
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
  const openAssignmentModal = (order: OrderDetails) => {
    setAssignmentOrder(order);
    setIsAssignWorkerModalOpen(true);
  };

  const handleSaveAssignments = (orderId: string, assignments: WorkerAssignment[], workerNotes?: string) => {
    const updatedAt = new Date().toLocaleString('id-ID');
    const assignedWorkerIds = Array.from(new Set(assignments.map((a) => a.workerId)));
    const patch = { workerAssignments: assignments, assignedWorkerIds, workerNotes: workerNotes || '', updatedAt };
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, ...patch } : o));
    setCurrentOrder((prev) => prev.id === orderId ? { ...prev, ...patch } : prev);
    setAssignmentOrder((prev) => prev?.id === orderId ? { ...prev, ...patch } : prev);
  };

  // Handlers for Operational Costs
  const handleAddOperationalCost = (cost: Omit<OperationalCost, 'id'>) => {
    const newCost: OperationalCost = {
      ...cost,
      id: `cost-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      amount: Math.max(0, Number(cost.amount) || 0),
    };
    setCurrentOrder((prev) => {
      const costs = Array.isArray(prev.operationalCosts) ? prev.operationalCosts : [];
      return {
        ...prev,
        operationalCosts: [...costs, newCost],
        updatedAt: new Date().toLocaleString('id-ID'),
      };
    });
  };

  const handleUpdateOperationalCost = (id: string, updatedCost: Partial<OperationalCost>) => {
    setCurrentOrder((prev) => {
      const costs = Array.isArray(prev.operationalCosts) ? prev.operationalCosts : [];
      return {
        ...prev,
        operationalCosts: costs.map((c) =>
          c.id === id
            ? {
                ...c,
                ...updatedCost,
                amount: updatedCost.amount !== undefined ? Math.max(0, Number(updatedCost.amount) || 0) : c.amount,
              }
            : c
        ),
        updatedAt: new Date().toLocaleString('id-ID'),
      };
    });
  };

  const handleDeleteOperationalCost = (id: string) => {
    setCurrentOrder((prev) => {
      const costs = Array.isArray(prev.operationalCosts) ? prev.operationalCosts : [];
      return {
        ...prev,
        operationalCosts: costs.filter((c) => c.id !== id),
        updatedAt: new Date().toLocaleString('id-ID'),
      };
    });
  };

  const handleUpdateOrderValue = (value: number) => {
    const num = Math.max(0, Number(value) || 0);
    setCurrentOrder((prev) => ({
      ...prev,
      orderValue: num,
      updatedAt: new Date().toLocaleString('id-ID'),
    }));
  };

  const handleAddWorker = (name: string, role: WorkerRole, wagePerPiece: number) => {
    const newWorker: WorkerItem = { id: Date.now(), name, role, wagePerPiece, active: true };
    setWorkers((prev) => [...prev, newWorker]);
  };

  const handleToggleWorkerActive = (id: number | string) => {
    setWorkers((prev) => prev.map((w) => w.id === id ? { ...w, active: w.active === false } : w));
  };

  const handleDeleteWorker = (id: number | string) => {
    // Hapus dari master saja. Histori assignment order tidak diubah.
    setWorkers((prev) => prev.filter((w) => w.id !== id));
  };

  const handleUpdateWorkflow = (workflow: WorkflowProgress) => {
    const cuttingDone = [
      workflow.cutting.patternCut,
      workflow.cutting.pantsCollarCut,
      workflow.cutting.specialItemsSeparated,
    ].every(Boolean);
    const sewingDone = [
      workflow.sewing.bodySleeveJoined,
      workflow.sewing.collarElasticSewed,
      workflow.sewing.overdeckFinished,
    ].every(Boolean);
    const cuttingStarted = [
      workflow.cutting.patternCut,
      workflow.cutting.pantsCollarCut,
      workflow.cutting.specialItemsSeparated,
    ].some(Boolean);
    const sewingStarted = [
      workflow.sewing.bodySleeveJoined,
      workflow.sewing.collarElasticSewed,
      workflow.sewing.overdeckFinished,
    ].some(Boolean);
    const qcDone = workflow.productionChecklist?.qc === true;

    setCurrentOrder((prev) => {
      let status = prev.status;
      if (qcDone) status = 'Selesai';
      else if (sewingDone) status = 'QC Passed';
      else if (sewingStarted) status = 'Proses Jahit';
      else if (cuttingDone) status = 'Proses Jahit';
      else if (cuttingStarted) status = 'Proses Potong';
      else if (prev.status === 'Draft') status = 'Bahan Diterima';

      return {
        ...prev,
        workflow,
        status,
        cuttingStatus: cuttingDone ? 'Selesai' : cuttingStarted ? 'Sedang Dikerjakan' : 'Belum Mulai',
        sewingStatus: sewingDone ? 'Selesai' : sewingStarted ? 'Sedang Dikerjakan' : 'Belum Mulai',
        updatedAt: new Date().toLocaleString('id-ID'),
      };
    });
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

  // Buka chat WhatsApp berdasarkan nomor klien.
  const openWhatsApp = (phone: string, order?: OrderDetails) => {
    const raw = String(phone || '').trim();
    const digits = raw.replace(/\D/g, '');
    if (!digits) return;

    let normalized = digits;
    if (normalized.startsWith('0')) normalized = '62' + normalized.slice(1);
    else if (normalized.startsWith('8')) normalized = '62' + normalized;

    const message = order
      ? `Halo, terkait SPK ${order.spkNumber} - ${order.teamName}. Kami ingin memberikan update order jersey Anda.`
      : '';

    const url = `https://wa.me/${normalized}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    window.open(url, '_blank', 'noopener,noreferrer');
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
            {/* ➕ Tambah Order */}
            <button
              onClick={() => setIsCreateOrderModalOpen(true)}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>➕ Tambah Order</span>
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

        {/* Order aktif selalu terlihat sebagai konteks global */}
        <OrderInfoCard
          order={currentOrder}
          orders={orders}
          onChange={handleUpdateOrderField}
          onSelectOrder={loadOrder}
        />

        {/* Menu Dashboard */}
        <div className="mb-6 border-b border-slate-200">
          <div className="flex gap-1 overflow-x-auto pb-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'order', label: 'Order & SPK', icon: ClipboardList },
              { id: 'produksi', label: 'Produksi', icon: Factory },
              { id: 'keuangan', label: 'Keuangan', icon: Wallet },
              { id: 'selesai', label: 'Order Selesai', icon: MessageCircle },
              { id: 'pekerja', label: 'Pekerja', icon: Users },
              { id: 'cetak', label: 'Cetak', icon: Printer },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveMenu(id as typeof activeMenu)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-bold transition-colors ${
                  activeMenu === id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Ringkas */}
        {activeMenu === 'dashboard' && (
          <section className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] text-slate-500 font-semibold">ORDER AKTIF</p>
                <p className="text-lg font-black text-slate-900 mt-1">{currentOrder.spkNumber}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] text-slate-500 font-semibold">TOTAL JERSEY</p>
                <p className="text-2xl font-black text-indigo-600 mt-1">{recap.totalJersey} <span className="text-xs text-slate-500">PCS</span></p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] text-slate-500 font-semibold">STATUS PRODUKSI</p>
                <p className="text-lg font-black text-slate-900 mt-1">{currentOrder.status}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] text-slate-500 font-semibold">DEADLINE</p>
                <p className="text-lg font-black text-slate-900 mt-1">{currentOrder.deadlineDate || '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="font-bold text-slate-800 text-sm mb-3">Ringkasan Order</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-slate-500">Tim</span><p className="font-bold mt-1">{currentOrder.teamName || '-'}</p></div>
                  <div><span className="text-slate-500">Klien / WA</span><p className="font-bold mt-1">{currentOrder.clientName || '-'} / {currentOrder.clientWhatsapp || '-'}</p></div>
                  <div><span className="text-slate-500">Nilai Order</span><p className="font-bold mt-1">Rp{Number(currentOrder.orderValue || 0).toLocaleString('id-ID')}</p></div>
                  <div><span className="text-slate-500">Jumlah Celana</span><p className="font-bold mt-1">{recap.totalCelana} Pcs</p></div>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="font-bold text-slate-800 text-sm mb-3">Akses Cepat</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['order', '📋 Kelola Order'],
                    ['produksi', '🏭 Kontrol Produksi'],
                    ['keuangan', '💰 Keuangan'],
                    ['dokumentasi', '📷 Dokumentasi'],
                    ['wa', '💬 WhatsApp Klien'],
                  ].map(([id, label]) => (
                    <button key={id} type="button" onClick={() => setActiveMenu(id as typeof activeMenu)} className="border border-slate-200 rounded-lg p-3 text-left text-xs font-bold hover:bg-slate-50">
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Order & SPK */}
        {activeMenu === 'order' && (
          <section className="space-y-4">
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
            <AwarenessBanner recap={recap} />
          </section>
        )}

        {/* Produksi */}
        {activeMenu === 'produksi' && (
          <section className="space-y-4">
            <WorkflowModules
              order={currentOrder}
              workers={workers}
              workflow={currentOrder.workflow}
              onChange={handleUpdateWorkflow}
            />
            <ProductionSummary
              recap={recap}
              workflow={currentOrder.workflow}
              onChange={handleUpdateWorkflow}
            />
          </section>
        )}

        {/* Keuangan */}
        {activeMenu === 'keuangan' && (
          <section>
            <OrderFinancialModule
              order={currentOrder}
              onOpenAssignModal={() => openAssignmentModal(currentOrder)}
              onAddOperationalCost={handleAddOperationalCost}
              onUpdateOperationalCost={handleUpdateOperationalCost}
              onDeleteOperationalCost={handleDeleteOperationalCost}
              onUpdateOrderValue={handleUpdateOrderValue}
            />
          </section>
        )}

        {/* Dokumentasi */}
        {activeMenu === 'dokumentasi' && (
          <section>
            <PhotoProofModule
              photos={currentOrder.photos}
              onChange={handleUpdatePhotos}
              storageError={storageError}
              canUpload={
                currentOrder.workflow?.sewing?.bodySleeveJoined === true &&
                currentOrder.workflow?.sewing?.collarElasticSewed === true &&
                currentOrder.workflow?.sewing?.overdeckFinished === true
              }
            />
          </section>
        )}

        {/* Pekerja */}
        {activeMenu === 'pekerja' && (
          <section className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h3 className="font-black text-slate-800 text-sm">Master & Penugasan Pekerja</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Kelola pekerja workshop dan tentukan pekerja Potong/Jahit untuk SPK {currentOrder.spkNumber}.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsWorkerModalOpen(true)} className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-xs font-bold">
                    ⚙️ Kelola Master Pekerja
                  </button>
                  <button type="button" onClick={() => openAssignmentModal(currentOrder)} className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-xs font-bold">
                    👷 Tugaskan ke SPK
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                <div className="bg-white border border-slate-200 rounded-lg p-3"><span className="text-[11px] text-slate-500">Total Pekerja</span><p className="font-black text-lg">{workers.length}</p></div>
                <div className="bg-white border border-slate-200 rounded-lg p-3"><span className="text-[11px] text-slate-500">Aktif</span><p className="font-black text-lg text-emerald-600">{workers.filter(w => w.active !== false).length}</p></div>
                <div className="bg-white border border-slate-200 rounded-lg p-3"><span className="text-[11px] text-slate-500">Potong</span><p className="font-black text-lg">{workers.filter(w => (w.role === 'potong' || w.role === 'potong_jahit') && w.active !== false).length}</p></div>
                <div className="bg-white border border-slate-200 rounded-lg p-3"><span className="text-[11px] text-slate-500">Jahit</span><p className="font-black text-lg">{workers.filter(w => (w.role === 'jahit' || w.role === 'potong_jahit') && w.active !== false).length}</p></div>
              </div>
            </div>
          </section>
        )}

        {/* Order Selesai */}
        {activeMenu === 'selesai' && (
          <section className="space-y-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
              <h3 className="font-black text-slate-800 text-sm">Order Selesai</h3>
              <p className="text-xs text-slate-600 mt-1">Dokumentasi hasil produksi dan komunikasi konfirmasi dengan klien.</p>
            </div>
            <PhotoProofModule
              photos={currentOrder.photos}
              onChange={handleUpdatePhotos}
              storageError={storageError}
              canUpload={
                currentOrder.workflow?.sewing?.bodySleeveJoined === true &&
                currentOrder.workflow?.sewing?.collarElasticSewed === true &&
                currentOrder.workflow?.sewing?.overdeckFinished === true
              }
            />
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-bold text-slate-800 text-sm mb-3">💬 WhatsApp Klien</h3>
              <div className="space-y-2">
                {orders.length === 0 ? (
                  <p className="text-xs text-slate-500">Belum ada order.</p>
                ) : orders.map((order) => {
                  const phone = String((order as any).clientWhatsapp || order.clientContact || '').trim();
                  const hasPhone = phone.replace(/\D/g, '').length >= 8;
                  return (
                    <div key={order.id} className="rounded-lg border border-slate-200 p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-xs truncate">{order.teamName || 'TANPA NAMA TIM'}</p>
                        <p className="text-[11px] text-slate-500">{order.spkNumber} • {order.status} • {phone || 'Nomor WA belum diisi'}</p>
                      </div>
                      <button type="button" disabled={!hasPhone} onClick={() => openWhatsApp(phone, order)} className="shrink-0 inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-lg text-xs font-bold disabled:bg-slate-300 disabled:cursor-not-allowed">
                        <MessageCircle className="w-4 h-4" />
                        {hasPhone ? 'Buka WhatsApp' : 'Nomor belum ada'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Cetak */}
        {activeMenu === 'cetak' && (
          <section className="rounded-lg border border-slate-200 p-6 text-center">
            <Printer className="w-8 h-8 mx-auto text-slate-500 mb-2" />
            <h3 className="font-bold text-slate-800">Cetak SPK A4</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Cetak dokumen SPK untuk order aktif.</p>
            <button
              type="button"
              onClick={handlePrint}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold"
            >
              🖨️ Cetak A4
            </button>
          </section>
        )}

      </main>

      {/* Modal Tambah Order Baru (SPK & Excel Parser) */}
      <CreateOrderModal
        isOpen={isCreateOrderModalOpen}
        onClose={() => setIsCreateOrderModalOpen(false)}
        onSaveOrder={handleSaveNewOrder}
        generateNewSpkNo={generateSpkNo}
      />

      {/* Modal Riwayat Order (#orderListModal) */}
      <OrderListModal
        isOpen={isOrderListModalOpen}
        onClose={() => setIsOrderListModalOpen(false)}
        orders={orders}
        currentOrderId={currentOrder.id}
        workers={workers}
        onSelectOrder={loadOrder}
        onAssignWorker={openAssignmentModal}
        onDeleteOrder={deleteOrder}
        onNewOrder={createNewOrder}
      />

      {/* Modal Kelola Master Pekerja (#workerModal) */}
      <WorkerModal
        isOpen={isWorkerModalOpen}
        onClose={() => setIsWorkerModalOpen(false)}
        workers={workers}
        onAddWorker={handleAddWorker}
        onToggleWorkerActive={handleToggleWorkerActive}
        onDeleteWorker={handleDeleteWorker}
      />

      <AssignWorkerModal
        isOpen={isAssignWorkerModalOpen}
        onClose={() => { setIsAssignWorkerModalOpen(false); setAssignmentOrder(null); }}
        order={assignmentOrder}
        workers={workers}
        onSaveAssignments={handleSaveAssignments}
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
