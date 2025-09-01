import React from 'react';
import { Video } from 'lucide-react';
import type { MediaItem } from './types';

interface MediaUploadsProps {
  uploadedMedia: MediaItem[];
  onCopyUrl: (url: string) => void;
}

const MediaUploads: React.FC<MediaUploadsProps> = ({ uploadedMedia, onCopyUrl }) => {
  if (uploadedMedia.length === 0) return null;

  return (
    <div className="mt-8 rounded-lg bg-gray-50 p-4">
      <h4 className="mb-3 text-sm font-medium text-gray-700">
        Uploaded Media
      </h4>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {uploadedMedia.map((media) => (
          <div key={media.id} className="group relative">
            {media.type === "image" ? (
              <img
                src={media.url}
                alt={media.filename}
                className="h-20 w-full rounded border object-cover"
              />
            ) : (
              <div className="flex h-20 w-full items-center justify-center rounded border bg-gray-200">
                <Video size={30} className="text-gray-400" />
              </div>
            )}
            <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center rounded bg-black opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => onCopyUrl(media.url)}
                className="rounded bg-blue-600 px-2 py-1 text-xs text-white"
              >
                Copy URL
              </button>
            </div>
            <div
              className="mt-1 truncate text-xs text-gray-500"
              title={media.filename}
            >
              {media.filename}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaUploads;