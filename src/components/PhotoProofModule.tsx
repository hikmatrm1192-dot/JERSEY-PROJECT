import React from 'react';
import { Camera, X, Image as ImageIcon } from 'lucide-react';

interface PhotoProofModuleProps {
  photos?: string[];
  onChange: (photos: string[]) => void;
}

export const PhotoProofModule: React.FC<PhotoProofModuleProps> = ({ photos = [], onChange }) => {
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          onChange([...photos, result]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same file can be selected again
    event.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg mb-6 text-xs shadow-2xs">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
          📷 Dokumentasi Foto Jersey Beres Dijahit
        </h3>
        <label className="no-print bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors shadow-2xs">
          <Camera className="w-3.5 h-3.5" />
          <span>+ Ambil / Upload Foto</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Grid Foto Hasil Jadi */}
      <div id="photoContainer" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {photos.length === 0 ? (
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center text-slate-400 text-xs col-span-2 md:col-span-4 bg-white/60">
            Belum ada foto jersey jadi.
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
              />
              <span className="absolute bottom-1 left-1.5 bg-black/70 text-white px-1.5 py-0.5 rounded text-[10px] font-mono">
                #{idx + 1}
              </span>
              <button
                type="button"
                onClick={() => handleRemovePhoto(idx)}
                className="no-print absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow transition-colors"
                title="Hapus foto ini"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
