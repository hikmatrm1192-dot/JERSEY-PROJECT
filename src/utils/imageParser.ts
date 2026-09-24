import { createWorker, PSM } from 'tesseract.js';
import { PlayerItem } from '../types/jersey';

const SIZE_PATTERN = /\b(XXXL|XXL|XL|L|M|S|XS)\b/i;
const HEADER_PATTERN = /^(NO|NOMOR|NAMA|NAMA PEMAIN|PLAYER|PEMAIN|SIZE|UKURAN|UKURAN BAJU)$/i;

function normalizeName(value: string): string {
  return value.replace(/^[\s|.,;:#-]+|[\s|.,;:#-]+$/g, '').replace(/\s{2,}/g, ' ').trim().toUpperCase();
}

function preprocessImage(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(3, Math.max(1.5, 1800 / Math.max(image.width, image.height)));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas OCR tidak tersedia.'));
        return;
      }
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < data.data.length; i += 4) {
        const gray = Math.round(0.299 * data.data[i] + 0.587 * data.data[i + 1] + 0.114 * data.data[i + 2]);
        const boosted = Math.max(0, Math.min(255, (gray - 128) * 1.35 + 128));
        data.data[i] = boosted;
        data.data[i + 1] = boosted;
        data.data[i + 2] = boosted;
      }
      ctx.putImageData(data, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Gambar tidak dapat dibaca.'));
    };
    image.src = url;
  });
}

function parseLine(line: string, index: number): PlayerItem | null {
  const clean = line
    .replace(/[|]+/g, ' ')
    .replace(/[\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (!clean || clean.length < 2) return null;

  const numberMatch = clean.match(/(?:^|\s)(\d{1,3})(?=\s|$)/);
  const number = numberMatch ? numberMatch[1] : '';
  const withoutNumber = numberMatch ? clean.replace(numberMatch[0], ' ').replace(/\s{2,}/g, ' ').trim() : clean;
  const sizeMatch = withoutNumber.match(SIZE_PATTERN);
  const size = sizeMatch ? sizeMatch[1].toUpperCase() : 'M';

  let name = withoutNumber;
  if (sizeMatch) {
    const at = sizeMatch.index ?? 0;
    name = withoutNumber.slice(0, at) + ' ' + withoutNumber.slice(at + sizeMatch[0].length);
  }

  name = name
    .replace(/\b(PEMAIN|PLAYER|NAMA|NAMA PEMAIN|SIZE|UKURAN|NO|NOMOR)\b/gi, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const normalized = normalizeName(name);
  if (!normalized || HEADER_PATTERN.test(normalized)) return null;

  // Accept rows even when OCR misses the number, as long as the row has a
  // plausible name and/or size. This prevents valid players from being lost.
  if (!number && !sizeMatch && normalized.length < 4) return null;

  return {
    id: `ocr-${Date.now()}-${index}`,
    name: normalized,
    size,
    number,
    note: 'OCR FOTO',
    sleeve: 'pendek'
  };
}

export interface ImageParseResult {
  players: PlayerItem[];
  text: string;
  error?: string;
}

export async function parseImagePlayers(files: File[], onProgress?: (message: string) => void): Promise<ImageParseResult> {
  if (!files.length) return { players: [], text: '', error: 'Tidak ada gambar yang dipilih.' };

  const worker = await createWorker('eng');
  const players: PlayerItem[] = [];
  const texts: string[] = [];

  try {
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      onProgress?.(`Meningkatkan kualitas & membaca foto ${i + 1} dari ${files.length}: ${file.name}`);
      const image = await preprocessImage(file);

      // Two segmentation passes catch both normal tables and screenshots
      // where OCR needs sparse-text mode.
      await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_BLOCK });
      const first = await worker.recognize(image);
      await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT });
      const second = await worker.recognize(image);

      const rawText = [first.data.text, second.data.text].join('\n');
      texts.push(rawText);

      rawText.split(/\r?\n/).map((line) => line.trim()).forEach((line) => {
        const player = parseLine(line, players.length);
        if (player) players.push(player);
      });
    }

    const seen = new Set<string>();
    const deduped = players.filter((player) => {
      const normalizedName = normalizeName(player.name);
      const key = player.number
        ? `NUMBER:${player.number}`
        : `NAME:${normalizedName}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return { players: deduped, text: texts.join('\n') };
  } catch (error: any) {
    return {
      players,
      text: texts.join('\n'),
      error: error?.message || 'Gagal membaca gambar dengan OCR.'
    };
  } finally {
    await worker.terminate();
  }
}