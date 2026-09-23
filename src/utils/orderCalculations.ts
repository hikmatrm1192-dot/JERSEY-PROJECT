import { OrderDetails, PlayerItem, ProductionRecap } from '../types/jersey';

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

  players.forEach((p) => {
    // Clean strings
    const noteUpper = (p.note || '').trim().toUpperCase();
    const size = (p.size || 'M').trim().toUpperCase();
    const pantsSize = (p.pantsSize || size).trim().toUpperCase();

    // Atasan count
    if (size) {
      sizeJerseyCounts[size] = (sizeJerseyCounts[size] || 0) + 1;
      totalJersey += 1;
    }

    // Celana count (Tanpa Celana check)
    const isTanpaCelana = noteUpper.includes('TANPA CELANA') || noteUpper.includes('NO CELANA') || noteUpper.includes('ATASAN SAJA');
    if (isTanpaCelana) {
      tanpaCelanaCount += 1;
      specialNotes.push(`${p.name || 'Pemain'}: Tanpa Celana`);
    } else {
      totalCelana += 1;
      sizeCelanaCounts[pantsSize] = (sizeCelanaCounts[pantsSize] || 0) + 1;
    }

    // Kiper check
    if (noteUpper.includes('KIEPR') || noteUpper.includes('KIPER') || noteUpper.includes('GK')) {
      kiperCount += 1;
      specialNotes.push(`${p.name || 'Pemain'}: Kiper (Pola Khusus)`);
    }

    // Lengan Panjang check
    if (p.sleeve === 'panjang' || noteUpper.includes('LENGAN PANJANG') || noteUpper.includes('PANJANG')) {
      lenganPanjangCount += 1;
    }

    // Number tracking for duplicates (ignore empty number and dashes)
    const numClean = (p.number || '').trim();
    if (numClean && numClean !== '-' && numClean !== '0') {
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
    totalPlayers: players.length,
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
