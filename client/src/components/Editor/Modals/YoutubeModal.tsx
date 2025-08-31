import React from 'react';

interface YoutubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  youtubeUrl: string;
  onUrlChange: (url: string) => void;
  onInsert: () => void;
}

const YoutubeModal: React.FC<YoutubeModalProps> = ({
  isOpen,
  onClose,
  youtubeUrl,
  onUrlChange,
  onInsert,
}) => {
  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold">Insert YouTube Video</h3>
        <input
          type="url"
          placeholder="Enter YouTube URL"
          value={youtubeUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          className="mb-4 w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          autoFocus
        />
        <div className="mb-4 text-sm text-gray-500">
          Paste a YouTube URL like: https://www.youtube.com/watch?v=...
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onInsert}
            disabled={!youtubeUrl}
            className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
};

export default YoutubeModal;