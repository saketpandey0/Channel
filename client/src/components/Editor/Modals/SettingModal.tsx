import React from 'react';
import { X, Tag } from 'lucide-react';
import type { StoryData } from '../types';

interface SettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyData: StoryData;
  onStoryDataChange: (data: StoryData) => void;
  tagInput: string;
  onTagInputChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
}

const SettingModal: React.FC<SettingModalProps> = ({
  isOpen,
  onClose,
  storyData,
  onStoryDataChange,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
}) => {
  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="mx-4 max-h-96 w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Story Settings</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Tags
          </label>
          <div className="mb-2 flex gap-2">
            <input
              type="text"
              placeholder="Add tag..."
              value={tagInput}
              onChange={(e) => onTagInputChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onAddTag()}
              className="flex-1 rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              onClick={onAddTag}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              <Tag size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {storyData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
              >
                {tag}
                <button
                  onClick={() => onRemoveTag(tag)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={storyData.isPremium}
              onChange={(e) =>
                onStoryDataChange({
                  ...storyData,
                  isPremium: e.target.checked,
                })
              }
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Premium Content
            </span>
          </label>

          {storyData.isPremium && (
            <div className="ml-6">
              <label className="mb-1 block text-sm text-gray-600">
                Price ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={storyData.price || ""}
                onChange={(e) =>
                  onStoryDataChange({
                    ...storyData,
                    price: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        <div className="mb-6">
          <h4 className="mb-2 text-sm font-medium text-gray-700">
            Reader Interactions
          </h4>
          <label className="mb-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={storyData.allowComments}
              onChange={(e) =>
                onStoryDataChange({
                  ...storyData,
                  allowComments: e.target.checked,
                })
              }
              className="rounded"
            />
            <span className="text-sm text-gray-600">Allow Comments</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={storyData.allowClaps}
              onChange={(e) =>
                onStoryDataChange({
                  ...storyData,
                  allowClaps: e.target.checked,
                })
              }
              className="rounded"
            />
            <span className="text-sm text-gray-600">Allow Claps</span>
          </label>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Cover Image URL
          </label>
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={storyData.coverImage || ""}
            onChange={(e) =>
              onStoryDataChange({
                ...storyData,
                coverImage: e.target.value,
              })
            }
            className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Excerpt
          </label>
          <textarea
            placeholder="Brief description of your story..."
            value={storyData.excerpt}
            onChange={(e) =>
              onStoryDataChange({ ...storyData, excerpt: e.target.value })
            }
            rows={3}
            className="w-full resize-none rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingModal;