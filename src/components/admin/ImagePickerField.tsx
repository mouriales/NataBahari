import { useState, type ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import { uploadAdminImage } from '../../utils/api';
import { SafeImage } from '../SafeImage';

interface ImagePickerFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
}

export function ImagePickerField({ id, label, value, onChange }: ImagePickerFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran gambar maksimal 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) return;
      setUploading(true);
      try {
        const res = await uploadAdminImage(dataUrl);
        onChange(res.url);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Gagal mengunggah gambar.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-xs font-medium text-slate-700">
        {label}
      </label>

      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <div className="w-36 h-22 rounded-md overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
          <SafeImage
            src={value}
            alt={label}
            fallbackTitle="Pratinjau"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 w-full space-y-2">
          <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/uploads/... atau URL gambar"
            className="w-full h-9 px-3 rounded-md bg-white border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#0F4C81]"
          />

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-medium text-slate-800 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{uploading ? 'Mengunggah...' : 'Unggah Berkas Gambar'}</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                disabled={uploading}
                className="sr-only"
              />
            </label>
            <span className="text-[11px] text-slate-500">PNG, JPG, WEBP maks. 5 MB</span>
          </div>

          {uploadError && (
            <p role="alert" className="text-xs text-red-600">
              {uploadError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
