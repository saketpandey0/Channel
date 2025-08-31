import React from 'react';

export const getYouTubeEmbedUrl = (url: string): string | null => {
  const regExp =
    /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[1].length === 11
    ? `https://www.youtube.com/embed/${match[1]}`
    : null;
};

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkUrl: string;
  onUrlChange: (url: string) => void;
  onInsert: () => void;
}

const LinkModal: React.FC<LinkModalProps> = ({
  isOpen,
  onClose,
  linkUrl,
  onUrlChange,
  onInsert,
}) => {
  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold">Insert Link</h3>
        <input
          type="url"
          placeholder="Enter URL"
          value={linkUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          className="mb-4 w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          autoFocus
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onInsert}
            disabled={!linkUrl}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkModal;