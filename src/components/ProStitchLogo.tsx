import React, { useState, useEffect } from 'react';
import { Camera, RefreshCw } from 'lucide-react';

interface ProStitchLogoProps {
  id?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  allowUpload?: boolean;
}

const STORAGE_KEY_CUSTOM_LOGO = 'prostitch_custom_logo';

export const ProStitchLogo: React.FC<ProStitchLogoProps> = ({
  id = 'logoPreview',
  className = 'h-16 w-auto object-contain',
  size = 'md',
  allowUpload = false,
}) => {
  const [logoSrc, setLogoSrc] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_LOGO);
      if (saved) return saved;
    } catch {
      // ignore
    }
    return '1000327609.png';
  });

  const [imgError, setImgError] = useState(false);

  // Listen for storage events so all instances (header, navbar, print) update together
  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_LOGO);
        if (saved) {
          setLogoSrc(saved);
          setImgError(false);
        } else {
          setLogoSrc('1000327609.png');
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setLogoSrc(result);
        setImgError(false);
        try {
          localStorage.setItem(STORAGE_KEY_CUSTOM_LOGO, result);
          // Dispatch custom event for local updates
          window.dispatchEvent(new Event('storage'));
        } catch {
          // ignore
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_LOGO);
      setLogoSrc('1000327609.png');
      setImgError(false);
      window.dispatchEvent(new Event('storage'));
    } catch {
      // ignore
    }
  };

  const isCustomUploaded = logoSrc.startsWith('data:');

  return (
    <div className="relative group inline-flex items-center">
      {imgError ? (
        // Beautiful vector fallback if 1000327609.png fails to load
        <div
          id={id}
          className={`flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl shadow-md border border-indigo-500/30 p-1.5 ${
            size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-16 h-16' : 'w-14 h-14'
          } shrink-0`}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,4 92,26 92,74 50,96 8,74 8,26" stroke="#6366f1" strokeWidth="4" fill="#0f172a" strokeLinejoin="round"/>
            <path d="M22,34 L28,30 M34,26 L40,22 M60,22 L66,26 M72,30 L78,34" stroke="#e0e7ff" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3"/>
            <path d="M35,32 L44,38 L50,38 L56,38 L65,32 L78,44 L70,52 L65,48 L65,76 L35,76 L35,48 L30,52 L22,44 Z" fill="#4f46e5" stroke="#818cf8" strokeWidth="2.5" strokeLinejoin="round"/>
            <line x1="50" y1="20" x2="50" y2="78" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2"/>
            <text x="50" y="65" textAnchor="middle" fill="#ffffff" fontWeight="900" fontSize="16" fontFamily="Arial, sans-serif" letterSpacing="1">PS</text>
          </svg>
        </div>
      ) : (
        <img
          id={id}
          src={logoSrc}
          alt="ProStitch Jersey Logo"
          className={className}
          onError={() => setImgError(true)}
        />
      )}

      {/* Upload button overlay when allowUpload is true (no-print) */}
      {allowUpload && (
        <label
          className="no-print absolute inset-0 bg-slate-900/70 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer p-1 text-[9px] font-bold text-center z-10"
          title="Klik untuk upload logo asli ProStitch Jersey"
        >
          <Camera className="w-4 h-4 mb-0.5 text-white" />
          <span>Ganti Logo</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      )}

      {allowUpload && isCustomUploaded && (
        <button
          type="button"
          onClick={handleResetLogo}
          title="Reset ke logo bawaan"
          className="no-print absolute -top-1.5 -right-1.5 bg-slate-800 hover:bg-red-600 text-white p-0.5 rounded-full shadow text-[9px] opacity-0 group-hover:opacity-100 transition-opacity z-20"
        >
          <RefreshCw className="w-2.5 h-2.5" />
        </button>
      )}
    </div>
  );
};
