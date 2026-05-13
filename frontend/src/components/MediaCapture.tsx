import { useRef, useState } from 'react';
import { uploadMedia } from '../api/media';
import { Camera, Upload, Loader2, X, Image, Video } from 'lucide-react';

interface MediaItem {
  fileId: string;
  url: string;
  type: 'image' | 'video';
}

interface MediaCaptureProps {
  onUpload: (fileId: string, url: string) => void;
  uploading: boolean;
  setUploading: (v: boolean) => void;
}

export default function MediaCapture({ onUpload, uploading, setUploading }: MediaCaptureProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const { fileId, url } = await uploadMedia(file);
      onUpload(fileId, url);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
      // Reset input values so the same file can be re-selected
      if (cameraRef.current) cameraRef.current.value = '';
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFilePick}
        className="hidden"
      />

      <div className="flex gap-3 w-full">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          disabled={uploading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Camera className="w-5 h-5" />
          )}
          Take Photo
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
          Choose File
        </button>
      </div>
    </div>
  );
}

export function MediaThumbnail({ url, type, onRemove }: { url: string; type: 'image' | 'video'; onRemove?: () => void }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
      {type === 'video' ? (
        <video
          src={url}
          className="w-full h-24 object-cover"
          onLoadedData={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
      ) : (
        <img
          src={url}
          alt="Uploaded media"
          className={`w-full h-24 object-cover transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
      )}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        </div>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
        >
          <X className="w-3 h-3" />
        </button>
      )}
      <div className="absolute bottom-1 left-1 bg-black/60 text-white rounded px-1.5 py-0.5 text-xs">
        {type === 'video' ? <Video className="w-3 h-3 inline" /> : <Image className="w-3 h-3 inline" />}
      </div>
    </div>
  );
}
