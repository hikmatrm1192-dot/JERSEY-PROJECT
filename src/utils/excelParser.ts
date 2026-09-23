import * as XLSX from 'xlsx';
import { PlayerItem } from '../types/jersey';

export interface ExcelParseResult {
  players: PlayerItem[];
  unmappedColumns: string[];
  totalRows: number;
  duplicateNumbers: string[];
  error?: string;
}

/**
 * Normalizes header string for comparison
 */
function cleanHeader(val: any): string {
  return String(val || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Checks if a cleaned string matches a pattern
 */
function matchesName(c: string): boolean {
  return (
    c === 'nama' ||
    c === 'name' ||
    c === 'namapemain' ||
    c === 'player' ||
    c === 'playername' ||
    c === 'namajersey' ||
    c === 'namapunggung' ||
    c === 'namalengkap'
  );
}

function matchesSize(c: string): boolean {
  return (
    c === 'size' ||
    c === 'ukuran' ||
    c === 'ukuranbaju' ||
    c === 'sizebaju' ||
    c === 'sz' ||
    c === 'sizejersey'
  );
}

function matchesNumber(c: string): boolean {
  return (
    c === 'nomor' ||
    c === 'no' ||
    c === 'nomorpunggung' ||
    c === 'nopunggung' ||
    c === 'number' ||
    c === 'nobaju' ||
    c === 'nomorbaju' ||
    c === 'nopung'
  );
}

function matchesNote(c: string): boolean {
  return (
    c === 'keterangan' ||
    c === 'note' ||
    c === 'notes' ||
    c === 'catatan' ||
    c === 'ket' ||
    c === 'posisi' ||
    c === 'keterangantambahan'
  );
}

function matchesPantsSize(c: string): boolean {
  return (
    c === 'celana' ||
    c === 'sizecelana' ||
    c === 'ukurancelana' ||
    c === 'pants' ||
    c === 'pantssize'
  );
}

function matchesSleeve(c: string): boolean {
  return c === 'lengan' || c === 'sleeve' || c === 'tangan' || c === 'jenislengan';
}

/**
 * Parses an Excel ArrayBuffer / binary into PlayerItem[]
 */
export function parseExcelPlayers(data: ArrayBuffer): ExcelParseResult {
  try {
    const workbook = XLSX.read(data, { type: 'array' });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return {
        players: [],
        unmappedColumns: [],
        totalRows: 0,
        duplicateNumbers: [],
        error: 'File Excel tidak memiliki sheet yang dapat dibaca.'
      };
    }

    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' });

    if (!rawRows || rawRows.length === 0) {
      return {
        players: [],
        unmappedColumns: [],
        totalRows: 0,
        duplicateNumbers: [],
        error: 'Sheet Excel kosong.'
      };
    }

    // Locate header row in first 15 rows
    let headerRowIndex = -1;
    let colMap = {
      name: -1,
      size: -1,
      number: -1,
      note: -1,
      pantsSize: -1,
      sleeve: -1
    };
    const unmappedColumns: string[] = [];

    for (let r = 0; r < Math.min(rawRows.length, 15); r++) {
      const row = rawRows[r];
      if (!Array.isArray(row)) continue;

      const tempMap = {
        name: -1,
        size: -1,
        number: -1,
        note: -1,
        pantsSize: -1,
        sleeve: -1
      };

      row.forEach((cell, cIdx) => {
        const cleaned = cleanHeader(cell);
        if (matchesName(cleaned)) tempMap.name = cIdx;
        else if (matchesSize(cleaned)) tempMap.size = cIdx;
        else if (matchesNumber(cleaned)) tempMap.number = cIdx;
        else if (matchesNote(cleaned)) tempMap.note = cIdx;
        else if (matchesPantsSize(cleaned)) tempMap.pantsSize = cIdx;
        else if (matchesSleeve(cleaned)) tempMap.sleeve = cIdx;
      });

      // Valid header if at least one key column found
      if (tempMap.name !== -1 || (tempMap.size !== -1 && tempMap.number !== -1)) {
        headerRowIndex = r;
        colMap = tempMap;

        // Collect unmapped columns from header row
        row.forEach((cell, cIdx) => {
          const rawHeader = String(cell || '').trim();
          if (
            rawHeader &&
            cIdx !== colMap.name &&
            cIdx !== colMap.size &&
            cIdx !== colMap.number &&
            cIdx !== colMap.note &&
            cIdx !== colMap.pantsSize &&
            cIdx !== colMap.sleeve
          ) {
            unmappedColumns.push(rawHeader);
          }
        });
        break;
      }
    }

    // If no explicit header found, fallback to assume columns 0..3: Name, Size, Number, Note
    let startRow = 0;
    if (headerRowIndex !== -1) {
      startRow = headerRowIndex + 1;
    } else {
      colMap = {
        name: 0,
        size: 1,
        number: 2,
        note: 3,
        pantsSize: -1,
        sleeve: -1
      };
      startRow = 0;
    }

    const players: PlayerItem[] = [];
    const numberCounts: Record<string, number> = {};
    const duplicateList: string[] = [];

    for (let r = startRow; r < rawRows.length; r++) {
      const row = rawRows[r];
      if (!Array.isArray(row)) continue;

      const rawName = colMap.name !== -1 ? String(row[colMap.name] || '').trim() : '';
      const rawSize = colMap.size !== -1 ? String(row[colMap.size] || '').trim().toUpperCase() : '';
      const rawNumVal = colMap.number !== -1 ? row[colMap.number] : '';
      const rawNum =
        rawNumVal !== undefined && rawNumVal !== null ? String(rawNumVal).trim() : '';
      const rawNote = colMap.note !== -1 ? String(row[colMap.note] || '').trim().toUpperCase() : '';
      const rawPantsSize =
        colMap.pantsSize !== -1 ? String(row[colMap.pantsSize] || '').trim().toUpperCase() : '';
      const rawSleeve =
        colMap.sleeve !== -1 ? String(row[colMap.sleeve] || '').trim().toLowerCase() : '';

      // Skip completely empty rows
      if (!rawName && !rawSize && !rawNum && !rawNote) {
        continue;
      }

      // Format number (preserve "0", dash -> "")
      let number = rawNum;
      if (number === '-') {
        number = '';
      }

      // Default size
      const size = rawSize || 'M';

      // Default note
      const note = rawNote || 'PEMAIN';

      // Determine sleeve
      let sleeve: 'pendek' | 'panjang' = 'pendek';
      if (
        rawSleeve.includes('panjang') ||
        note.includes('LENGAN PANJANG') ||
        note.includes('TANGAN PANJANG') ||
        note.includes('LONG SLEEVE')
      ) {
        sleeve = 'panjang';
      }

      // Name fallback if empty
      const name = rawName || `PEMAIN ${players.length + 1}`;

      // Track duplicate numbers
      if (number && number !== '-') {
        numberCounts[number] = (numberCounts[number] || 0) + 1;
        if (numberCounts[number] === 2) {
          duplicateList.push(number);
        }
      }

      players.push({
        id: `p-${Date.now()}-${r}-${Math.random().toString(36).slice(2, 6)}`,
        name,
        size,
        number,
        note,
        pantsSize: rawPantsSize || undefined,
        sleeve
      });
    }

    if (players.length === 0) {
      return {
        players: [],
        unmappedColumns,
        totalRows: 0,
        duplicateNumbers: [],
        error: 'Tidak ada baris data pemain yang dapat dibaca dari file Excel ini.'
      };
    }

    return {
      players,
      unmappedColumns,
      totalRows: players.length,
      duplicateNumbers: duplicateList
    };
  } catch (err: any) {
    return {
      players: [],
      unmappedColumns: [],
      totalRows: 0,
      duplicateNumbers: [],
      error: `Gagal membaca file Excel: ${err?.message || 'Format tidak valid'}`
    };
  }
}
