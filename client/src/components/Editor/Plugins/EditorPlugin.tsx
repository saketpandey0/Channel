import { useState, useCallback } from "react";
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import MainToolbar from "../MainToolbar";
import MediaUpload from "../MediaUpload";
import VoiceRecorder from "../VoiceRecorder";
import InsertMenu from "../InsertMenu";
import FloatingToolbar from "../FloatingToolbar";

interface MediaItem{
  id: number;
  type: 'image' | 'video';
  src: string;
}


export default function EditorPlugin() {
  const [editor] = useLexicalComposerContext();
  const [anchorElem, setAnchorElem] = useState(null);
  const [uploadedMedia, setUploadedMedia] = useState<MediaItem[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const onRef = useCallback((elem) => {
    if (elem !== null) {
      setAnchorElem(elem);
    }
  }, []);

  const handleImageUpload = (imageSrc) => {
    setUploadedMedia(prev => [...prev, { type: 'image', src: imageSrc, id: Date.now() }]);
  };

  const handleVideoUpload = (videoSrc) => {
    setUploadedMedia(prev => [...prev, { type: 'video', src: videoSrc, id: Date.now() }]);
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <>
      <MainToolbar editor={editor} />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Title"
            className="w-full text-4xl font-bold text-gray-900 placeholder-gray-400 border-none outline-none bg-transparent leading-tight"
          />
        </div>

        {/* Subtitle Section */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Tell your story..."
            className="w-full text-xl text-gray-600 placeholder-gray-400 border-none outline-none bg-transparent leading-relaxed"
          />
        </div>

        {/* Media Upload Section */}
        <div className="mb-6">
          <MediaUpload 
            onImageUpload={handleImageUpload}
            onVideoUpload={handleVideoUpload}
          />
        </div>

        {/* Uploaded Media Display */}
        {uploadedMedia.length > 0 && (
          <div className="mb-6 space-y-4">
            {uploadedMedia.map((media) => (
              <div key={media.id} className="relative group">
                {media.type === 'image' ? (
                  <img 
                    src={media.src} 
                    alt="Uploaded content" 
                    className="w-full max-w-2xl mx-auto rounded-lg shadow-sm"
                  />
                ) : (
                  <video 
                    src={media.src} 
                    controls 
                    className="w-full max-w-2xl mx-auto rounded-lg shadow-sm"
                  />
                )}
                <button
                  onClick={() => setUploadedMedia(prev => prev.filter(m => m.id !== media.id))}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main Editor */}
        <div className="relative">
          <div ref={onRef} className="relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="min-h-96 text-lg leading-relaxed text-gray-800 focus:outline-none" />
              }
              placeholder={
                <div className="absolute top-0 left-0 text-gray-400 text-lg pointer-events-none">
                  Tell your story...
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
          
          {/* Sidebar Insert Menu */}
          <div className="absolute left-0 top-4 -ml-12">
            <InsertMenu 
              editor={editor}
              onInsertImage={() => document.querySelector('input[type="file"][accept="image/*"]')?.click()}
              onInsertVideo={() => document.querySelector('input[type="file"][accept="video/*"]')?.click()}
              isRecording={isRecording}
              onToggleRecording={handleToggleRecording}
            />
          </div>
        </div>

        {/* Voice Recorder */}
        {isRecording && (
          <VoiceRecorder 
            isRecording={isRecording}
            onToggleRecording={handleToggleRecording}
          />
        )}

        {/* Floating Toolbar */}
        {anchorElem && (
          <FloatingToolbar editor={editor} anchorElem={anchorElem} />
        )}
      </div>

      {/* Plugins */}
      <HistoryPlugin />
      <AutoFocusPlugin />
      <LinkPlugin />
    </>
  );
}