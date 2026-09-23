export interface CompressResult {
  dataUrl?: string;
  error?: string;
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_PHOTOS_PER_ORDER = 6;
export const MAX_IMAGE_DIMENSION = 1200; // 1200 x 1200 px
export const JPEG_QUALITY = 0.7;

const VALID_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Validates and compresses an image file using Native Browser Canvas API.
 * - Resize: Max 1200x1200px maintaining aspect ratio (never upscales smaller images).
 * - Compression: JPEG ~0.7 quality.
 * - Validates: JPG, PNG, WEBP and size <= 10MB.
 */
export function compressImageFile(
  file: File,
  maxWidth = MAX_IMAGE_DIMENSION,
  maxHeight = MAX_IMAGE_DIMENSION,
  quality = JPEG_QUALITY
): Promise<CompressResult> {
  return new Promise((resolve) => {
    // 1. Validasi Ukuran File (maks 10 MB)
    if (file.size > MAX_FILE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return resolve({
        error: `File "${file.name}" terlalu besar (${sizeMb} MB). Maksimal ukuran file adalah 10 MB.`
      });
    }

    // 2. Validasi Format Gambar
    const fileType = file.type ? file.type.toLowerCase() : '';
    const fileName = file.name.toLowerCase();
    const isExtensionValid = /\.(jpg|jpeg|png|webp)$/i.test(fileName);
    const isMimeValid = VALID_MIME_TYPES.includes(fileType);

    if (!isMimeValid && !isExtensionValid) {
      return resolve({
        error: `File "${file.name}" bukan format gambar yang didukung. Mohon gunakan format JPG, PNG, atau WEBP.`
      });
    }

    // 3. Baca File dengan FileReader
    const reader = new FileReader();

    reader.onerror = () => {
      resolve({ error: `Gagal membaca file "${file.name}".` });
    };

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        return resolve({ error: `File "${file.name}" tidak memiliki data.` });
      }

      // 4. Load ke HTML Image
      const img = new Image();

      img.onerror = () => {
        resolve({ error: `File "${file.name}" rusak atau bukan gambar valid.` });
      };

      img.onload = () => {
        try {
          let { width, height } = img;

          // Jangan upscale gambar kecil
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          // Buat Canvas Native
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve({
              error: `Browser tidak mendukung Canvas 2D untuk memproses "${file.name}".`
            });
          }

          // Background putih untuk mengatasi transparansi pada PNG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          // Gambar foto dengan ukuran proporsional baru
          ctx.drawImage(img, 0, 0, width, height);

          // Kompresi ke format JPEG
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve({ dataUrl: compressedDataUrl });
        } catch (err: any) {
          resolve({
            error: `Gagal mengompresi gambar "${file.name}": ${err?.message || 'Error tidak diketahui'}`
          });
        }
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
}
