import React, { useState } from 'react';
import { ArrowLeft, Upload, Eye, X, Tag, Image } from 'lucide-react';
import type { StoryData } from './types';

interface PublishStoryProps {
  story: StoryData;
  onUpdate: (updates: Partial<StoryData>) => void;
  onBack: () => void;
  onPublish: () => void;
}

const PublishStory: React.FC<PublishStoryProps> = ({
  story,
  onUpdate,
  onBack,
  onPublish,
}) => {
  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const addTag = () => {
    if (tagInput.trim() && !story.tags.includes(tagInput.trim())) {
      onUpdate({
        tags: [...story.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onUpdate({
      tags: story.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handlePublish = async () => {
    if (!story.title.trim()) {
      alert('Please add a title before publishing');
      return;
    }
    
    setIsPublishing(true);
    try {
      await onPublish();
    } finally {
      setIsPublishing(false);
    }
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getReadingTime = (text: string) => {
    const words = getWordCount(text);
    return Math.ceil(words / 200); // Average reading speed
  };

  if (showPreview) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => setShowPreview(false)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
            Back to Settings
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            <Upload size={16} />
            {isPublishing ? 'Publishing...' : 'Publish Now'}
          </button>
        </div>

        <article className="prose prose-lg mx-auto">
          {story.coverImage && (
            <img
              src={story.coverImage}
              alt="Cover"
              className="mb-8 h-64 w-full rounded-lg object-cover"
            />
          )}
          
          <h1 className="mb-4 text-4xl font-bold">{story.title}</h1>
          
          {story.subtitle && (
            <p className="mb-6 text-xl text-gray-600">{story.subtitle}</p>
          )}

          <div className="mb-6 flex items-center gap-4 text-sm text-gray-500">
            <span>{getWordCount(story.content)} words</span>
            <span>•</span>
            <span>{getReadingTime(story.content)} min read</span>
            {story.isPremium && (
              <>
                <span>•</span>
                <span className="rounded bg-yellow-100 px-2 py-1 text-yellow-800">
                  Premium ${story.price}
                </span>
              </>
            )}
          </div>

          {story.tags.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {story.tags.map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div
            dangerouslySetInnerHTML={{ __html: story.content }}
            className="prose-headings:font-bold prose-a:text-blue-600 prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded"
          />
        </article>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} />
          Back to Editor
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Eye size={16} />
            Preview
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            <Upload size={16} />
            {isPublishing ? 'Publishing...' : 'Publish Story'}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Story Info */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-2 font-semibold">Story Details</h3>
          <div className="text-sm text-gray-600">
            <p><strong>Title:</strong> {story.title || 'Untitled'}</p>
            {story.subtitle && <p><strong>Subtitle:</strong> {story.subtitle}</p>}
            <p><strong>Words:</strong> {getWordCount(story.content)}</p>
            <p><strong>Reading time:</strong> {getReadingTime(story.content)} minutes</p>
          </div>
        </div>

        {/* Cover Image */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700">
            <Image className="mr-2 inline" size={16} />
            Cover Image
          </label>
          <input
            type="url"
            placeholder="https://example.com/your-cover-image.jpg"
            value={story.coverImage || ''}
            onChange={(e) => onUpdate({ coverImage: e.target.value })}
            className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {story.coverImage && (
            <div className="mt-3">
              <img
                src={story.coverImage}
                alt="Cover preview"
                className="h-40 w-full rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700">
            <Tag className="mr-2 inline" size={16} />
            Tags
          </label>
          <div className="mb-3 flex gap-2">
            <input
              type="text"
              placeholder="Add a tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
              className="flex-1 rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addTag}
              className="rounded-lg bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {story.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-sm text-gray-700"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Add up to 5 tags to help readers discover your story
          </p>
        </div>

        {/* Excerpt */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Story Excerpt
          </label>
          <textarea
            placeholder="Write a compelling description of your story..."
            value={story.excerpt}
            onChange={(e) => onUpdate({ excerpt: e.target.value })}
            rows={4}
            className="w-full resize-none rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            This will be shown in story previews and search results
          </p>
        </div>

        {/* Premium Settings */}
        <div className="rounded-lg border border-gray-200 p-4">
          <label className="mb-3 flex items-center gap-2">
            <input
              type="checkbox"
              checked={story.isPremium}
              onChange={(e) => onUpdate({ isPremium: e.target.checked })}
              className="rounded"
            />
            <span className="font-medium text-gray-700">Premium Content</span>
          </label>

          {story.isPremium && (
            <div className="ml-6 mt-3">
              <label className="mb-2 block text-sm text-gray-600">
                Price (USD)
              </label>
              <div className="flex items-center">
                <span className="mr-2 text-gray-500">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={story.price || ''}
                  onChange={(e) =>
                    onUpdate({
                      price: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  className="w-32 rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Reader Interactions */}
        <div className="rounded-lg border border-gray-200 p-4">
          <h4 className="mb-3 font-medium text-gray-700">Reader Interactions</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={story.allowComments}
                onChange={(e) => onUpdate({ allowComments: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Allow comments</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={story.allowClaps}
                onChange={(e) => onUpdate({ allowClaps: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Allow claps</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishStory;