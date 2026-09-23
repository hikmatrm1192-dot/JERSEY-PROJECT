import React, { useState } from 'react';
import { Camera, X, AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';
import {
  compressImageFile,
  MAX_PHOTOS_PER_ORDER
} from '../utils/imageCompressor';

interface PhotoProofModuleProps {
  photos?: string[];
  onChange: (photos: string[]) => void;
  storageError?: string | null;
}

export const PhotoProofModule: React.FC<PhotoProofModuleProps> = ({
  photos = [],
  onChange,
  storageError
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'warning' | 'error' | 'info';
    text: string;
  } | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    // Reset input immediately so user can select the same file again if desired
    event.target.value = '';

    const currentCount = photos.length;
    const remainingSlots = Math.max(0, MAX_PHOTOS_PER_ORDER - currentCount);

    if (remainingSlots <= 0) {
      setFeedbackMessage({
        type: 'error',
        text: `Maksimal ${MAX_PHOTOS_PER_ORDER} foto per order sudah tercapai. Hapus beberapa foto lama jika ingin menambahkan foto baru.`
      });
      return;
    }

    setIsProcessing(true);
    setFeedbackMessage(null);

    // Ambil file yang masih muat dalam sisa slot
    const filesToProcess = files.slice(0, remainingSlots);
    const excessCount = files.length - filesToProcess.length;

    try {
      // Multiple upload: proses seluruh batch secara paralel
      const results = await Promise.all(
        filesToProcess.map((file) => compressImageFile(file))
      );

      const successfulPhotos: string[] = [];
      const errors: string[] = [];

      results.forEach((res) => {
        if (res.dataUrl) {
          successfulPhotos.push(res.dataUrl);
        } else if (res.error) {
          errors.push(res.error);
        }
      });

      // Update state SATU KALI di akhir batch untuk mencegah race-condition
      if (successfulPhotos.length > 0) {
        onChange([...photos, ...successfulPhotos]);
      }

      // Berikan notifikasi jika ada file yang ditolak atau berlebih
      if (excessCount > 0 && errors.length > 0) {
        setFeedbackMessage({
          type: 'warning',
          text: `${successfulPhotos.length} foto berhasil ditambahkan. ${excessCount} file dilewati (maksimal ${MAX_PHOTOS_PER_ORDER} foto). Error: ${errors.join(' | ')}`
        });
      } else if (excessCount > 0) {
        setFeedbackMessage({
          type: 'warning',
          text: `${successfulPhotos.length} foto berhasil ditambahkan. ${excessCount} file dilewati karena batas maksimal adalah ${MAX_PHOTOS_PER_ORDER} foto per order.`
        });
      } else if (errors.length > 0) {
        setFeedbackMessage({
          type: 'error',
          text: `${successfulPhotos.length > 0 ? `${successfulPhotos.length} foto berhasil diproses. ` : ''}${errors.join(' | ')}`
        });
      }
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: `Terjadi kesalahan saat memproses foto: ${err?.message || 'Gagal kompresi'}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
    setFeedbackMessage(null);
  };

  const isMaxReached = photos.length >= MAX_PHOTOS_PER_ORDER;

  return (
    <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg mb-6 text-xs shadow-2xs">
      
      {/* Header Modul Foto */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
            📷 Dokumentasi Foto Jersey Beres Dijahit
          </h3>
          <span
            className={`px-2 py-0.5 rounded-full font-mono font-bold text-[11px] ${
              isMaxReached
                ? 'bg-amber-100 text-amber-800'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {photos.length} / {MAX_PHOTOS_PER_ORDER} Foto
          </span>
        </div>

        <label
          className={`no-print px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs ${
            isMaxReached || isProcessing
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
          }`}
          title={
            isMaxReached
              ? `Maksimal ${MAX_PHOTOS_PER_ORDER} foto tercapai`
              : 'Ambil dari kamera atau upload file gambar'
          }
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Mengompres Foto...</span>
            </>
          ) : (
            <>
              <Camera className="w-3.5 h-3.5" />
              <span>+ Ambil / Upload Foto</span>
            </>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            capture="environment"
            multiple
            disabled={isMaxReached || isProcessing}
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Alert Penyimpanan Penuh (QuotaExceededError) */}
      {storageError && (
        <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-lg mb-3 flex items-start gap-2 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-semibold">{storageError}</div>
        </div>
      )}

      {/* Alert Validasi / Feedback Kompresi */}
      {feedbackMessage && (
        <div
          className={`border p-2.5 rounded-lg mb-3 flex items-start justify-between gap-2 text-xs ${
            feedbackMessage.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-start gap-2">
            {feedbackMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <span className="font-medium">{feedbackMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Grid Foto Hasil Jadi */}
      <div id="photoContainer" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {photos.length === 0 ? (
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-5 text-center text-slate-400 text-xs col-span-2 md:col-span-3 lg:col-span-6 bg-white/60">
            Belum ada foto jersey beres diunggah. Foto akan otomatis di-resize (maks. 1200px) & dikompres untuk menghemat penyimpanan.
          </div>
        ) : (
          photos.map((url, idx) => (
            <div
              key={idx}
              className="relative border border-slate-300 rounded-lg overflow-hidden bg-black group shadow-xs"
            >
              <img
                src={url}
                alt={`Jersey Jadi #${idx + 1}`}
                className="w-full h-28 object-cover transition-transform group-hover:scale-105 duration-200"
                loading="lazy"
              />
              <span className="absolute bottom-1 left-1.5 bg-black/75 text-white px-1.5 py-0.5 rounded text-[10px] font-mono">
                #{idx + 1}
              </span>
              <button
                type="button"
                onClick={() => handleRemovePhoto(idx)}
                className="no-print absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow transition-colors cursor-pointer"
                title="Hapus foto ini"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
        <span>* Format: JPG/PNG/WEBP (Maks 10 MB per file, otomatis dikompres ke JPEG 0.7)</span>
        <span>Maksimal 6 foto dokumentasi</span>
      </div>
    </div>
  );
};
