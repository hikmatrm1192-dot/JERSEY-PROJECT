import { createWorker } from 'tesseract.js';
import { PlayerItem } from '../types/jersey';

const SIZE_PATTERN = /\b(XXXL|XXL|XL|L|M|S|XS)\b/i;

function normalizeName(value: string): string {
  return value.replace(/^[\s|.,;:#-]+|[\s|.,;:#-]+$/g, '').replace(/\s{2,}/g, ' ').trim().toUpperCase();
}

function parseLine(line: string, index: number): PlayerItem | null {
  const clean = line.replace(/[|]+/g, ' ').replace(/[\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
  if (!clean || clean.length < 2) return null;
  const numberMatch = clean.match(/^(?:NO\.?\s*)?(\d{1,3})\s+/i);
  const number = numberMatch ? numberMatch[1] : '';
  const withoutNumber = numberMatch ? clean.slice(numberMatch[0].length) : clean;
  const sizeMatch = withoutNumber.match(SIZE_PATTERN);
  const size = sizeMatch ? sizeMatch[1].toUpperCase() : 'M';
  let name = withoutNumber;
  if (sizeMatch) name = withoutNumber.slice(0, sizeMatch.index) + ' ' + withoutNumber.slice((sizeMatch.index ?? 0) + sizeMatch[0].length);
  name = name.replace(/\b(PEMAIN|PLAYER|NAMA|NAMA PEMAIN|SIZE|UKURAN|NO|NOMOR)\b/gi, ' ').replace(/\s{2,}/g, ' ').trim();
  if (!name || /^(NAMA|PEMAIN|PLAYER|SIZE|UKURAN)$/i.test(name)) return null;
  return { id: `ocr-${Date.now()}-${index}`, name: normalizeName(name), size, number, note: 'OCR FOTO', sleeve: 'pendek' };
}

export interface ImageParseResult { players: PlayerItem[]; text: string; error?: string; }

export async function parseImagePlayers(files: File[], onProgress?: (message: string) => void): Promise<ImageParseResult> {
  if (!files.length) return { players: [], text: '', error: 'Tidak ada gambar yang dipilih.' };
  const worker = await createWorker('eng');
  const players: PlayerItem[] = [];
  const texts: string[] = [];
  try {
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      onProgress?.(`Membaca foto ${i + 1} dari ${files.length}: ${file.name}`);
      const { data } = await worker.recognize(file);
      texts.push(data.text);
      data.text.split(/\r?\n/).map((line) => line.trim()).forEach((line) => {
        const player = parseLine(line, players.length);
        if (player) players.push(player);
      });
    }
    const seen = new Set<string>();
    const deduped = players.filter((player) => {
      const key = `${player.number}|${player.name}`.toUpperCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return { players: deduped, text: texts.join('\n') };
  } catch (error: any) {
    return { players, text: texts.join('\n'), error: error?.message || 'Gagal membaca gambar dengan OCR.' };
  } finally { await worker.terminate(); }
}