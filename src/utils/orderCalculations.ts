import { OrderDetails, PlayerItem, ProductionRecap, WorkerAssignment } from '../types/jersey';

export interface ExtendedProductionRecap extends ProductionRecap {
  specialNotes: string[];
}

export function calculateProductionRecap(players: PlayerItem[]): ExtendedProductionRecap {
  const sizeJerseyCounts: Record<string, number> = {};
  const sizeCelanaCounts: Record<string, number> = {};
  let totalJersey = 0;
  let totalCelana = 0;
  let kiperCount = 0;
  let tanpaCelanaCount = 0;
  let lenganPanjangCount = 0;

  const numberTracker: Record<string, boolean> = {};
  const duplicateNumbersList: string[] = [];
  const specialNotes: string[] = [];

  // Filter valid player objects
  const validPlayers = Array.isArray(players)
    ? players.filter((p): p is PlayerItem => !!p && typeof p === 'object')
    : [];

  validPlayers.forEach((p) => {
    // Clean strings and sanitize values
    const noteUpper = (p.note || '').trim().toUpperCase();
    const rawSize = (p.size || '').trim().toUpperCase();
    const size = rawSize || 'M';
    const rawPantsSize = (p.pantsSize || '').trim().toUpperCase();
    const pantsSize = rawPantsSize || size;

    // Atasan / Jersey count: setiap player terhitung 1 kali pada ukuran yang sesuai
    sizeJerseyCounts[size] = (sizeJerseyCounts[size] || 0) + 1;
    totalJersey += 1;

    // Celana count (Tanpa Celana check)
    const isTanpaCelana =
      noteUpper.includes('TANPA CELANA') ||
      noteUpper.includes('NO CELANA') ||
      noteUpper.includes('ATASAN SAJA') ||
      noteUpper.includes('BAJU SAJA') ||
      noteUpper.includes('JERSEY SAJA') ||
      noteUpper.includes('HANYA BAJU');

    if (isTanpaCelana) {
      tanpaCelanaCount += 1;
      specialNotes.push(`${p.name || 'Pemain'}: Tanpa Celana`);
    } else {
      totalCelana += 1;
      sizeCelanaCounts[pantsSize] = (sizeCelanaCounts[pantsSize] || 0) + 1;
    }

    // Kiper check: tag KIEPR, KIPER, GOALKEEPER, atau kata utuh GK (hindari false positive seperti LENGKAP)
    const isKiper =
      noteUpper.includes('KIEPR') ||
      noteUpper.includes('KIPER') ||
      noteUpper.includes('GOALKEEPER') ||
      /\bGK\b/.test(noteUpper);

    if (isKiper) {
      kiperCount += 1;
      specialNotes.push(`${p.name || 'Pemain'}: Kiper (Pola Khusus)`);
    }

    // Lengan Panjang check: field sleeve === 'panjang' atau tag LENGAN PANJANG / TANGAN PANJANG
    const isLenganPanjang =
      p.sleeve === 'panjang' ||
      noteUpper.includes('LENGAN PANJANG') ||
      noteUpper.includes('TANGAN PANJANG') ||
      noteUpper.includes('LONG SLEEVE') ||
      (/\bPANJANG\b/.test(noteUpper) && !noteUpper.includes('CELANA PANJANG'));

    if (isLenganPanjang) {
      lenganPanjangCount += 1;
      specialNotes.push(`${p.name || 'Pemain'}: Lengan Panjang`);
    }

    // Number tracking for duplicates (ignore empty number and dashes)
    const numClean = (p.number || '').trim();
    if (numClean && numClean !== '-') {
      if (numberTracker[numClean]) {
        duplicateNumbersList.push(numClean);
      } else {
        numberTracker[numClean] = true;
      }
    }
  });

  const duplicateNumbers = Array.from(new Set(duplicateNumbersList));

  return {
    totalJersey,
    totalCelana,
    totalPlayers: validPlayers.length,
    sizeJerseyCounts,
    sizeCelanaCounts,
    kiperCount,
    tanpaCelanaCount,
    lenganPanjangCount,
    duplicateNumbers,
    specialNotes
  };
}

export function formatWhatsAppRecap(order: OrderDetails): string {
  const recap = calculateProductionRecap(order.players);
  const team = order.teamName || 'TIM JERSEY';

  let text = `*DATA ORDER JERSEY: ${team}*\n`;
  text += `Total Baju: ${recap.totalJersey} pcs\n`;
  text += `Total Celana: ${recap.totalCelana} pcs\n\n`;
  text += `*RINCIAN PEMAIN:*\n`;

  order.players.forEach((p, i) => {
    const noStr = p.number ? `No.${p.number}` : 'No.-';
    text += `${i + 1}. ${p.name || '-'} | ${p.size} | ${noStr} | ${p.note || 'PEMAIN'}\n`;
  });

  if (recap.specialNotes.length > 0) {
    text += `\n*Catatan Khusus:*\n- ${recap.specialNotes.join('\n- ')}\n`;
  }

  return text;
}

export function exportToCSV(order: OrderDetails): void {
  let csv = 'No,Nama Pemain,Ukuran,No Punggung,Keterangan\n';
  order.players.forEach((p, i) => {
    csv += `"${i + 1}","${(p.name || '').replace(/"/g, '""')}","${p.size}","${p.number || ''}","${(p.note || '').replace(/"/g, '""')}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `SPK_JERSEY_${(order.teamName || 'ORDER').replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === undefined || amount === null) return 'Rp 0';
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export interface OrderWagesBreakdown {
  cuttingWage: number;
  sewingWage: number;
  totalWage: number;
  cuttingPcs: number;
  sewingPcs: number;
}

export function calculateOrderWages(assignments?: WorkerAssignment[]): OrderWagesBreakdown {
  if (!assignments || assignments.length === 0) {
    return {
      cuttingWage: 0,
      sewingWage: 0,
      totalWage: 0,
      cuttingPcs: 0,
      sewingPcs: 0,
    };
  }

  let cuttingWage = 0;
  let sewingWage = 0;
  let cuttingPcs = 0;
  let sewingPcs = 0;

  for (const a of assignments) {
    const qty = Math.max(0, Number(a.quantity) || 0);
    const rate = Math.max(0, Number(a.wagePerPiece) || 0);
    const subtotal = qty * rate;

    if (a.division === 'potong') {
      cuttingWage += subtotal;
      cuttingPcs += qty;
    } else if (a.division === 'jahit') {
      sewingWage += subtotal;
      sewingPcs += qty;
    }
  }

  return {
    cuttingWage,
    sewingWage,
    totalWage: cuttingWage + sewingWage,
    cuttingPcs,
    sewingPcs,
  };
}

