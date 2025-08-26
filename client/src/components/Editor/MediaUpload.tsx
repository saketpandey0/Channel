import { useRef } from "react";
import { Image, Video } from "lucide-react";


interface MediaUploadProps {
  onImageUpload: (file: File) => void;
  onVideoUpload: (file: File) => void;
}

export default function MediaUpload({ onImageUpload, onVideoUpload }: MediaUploadProps) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onImageUpload(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onVideoUpload(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
      />
      <div className="flex space-x-2">
        <button
          onClick={() => imageInputRef.current?.click()}
          className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          <Image size={16} />
          <span className="text-sm">Image</span>
        </button>
        <button
          onClick={() => videoInputRef.current?.click()}
          className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          <Video size={16} />
          <span className="text-sm">Video</span>
        </button>
      </div>
    </>
  );
}