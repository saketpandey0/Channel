import { useState, useCallback, useRef } from "react";
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import MainToolbar from "../utils/MainToolbar";
import MediaUpload from "../utils/MediaUpload";
import VoiceRecorder from "../utils/VoiceRecorder";
import InsertMenu from "../utils/InsertMenu";
import FloatingToolbar from "../utils/FloatingToolbar";
import { $getSelection, $isRangeSelection } from "lexical";
import { $createImageNode } from "../nodes/ImageNode"; 
import { $createVideoNode } from "../nodes/VideoNode";

export default function EditorPlugin() {
  const [editor] = useLexicalComposerContext();
  const [anchorElem, setAnchorElem] = useState<HTMLElement | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const onRef = useCallback((elem: HTMLElement | null) => {
    if (elem !== null) {
      setAnchorElem(elem);
    }
  }, []);

  const handleImageUpload = (imageSrc: string) => {
    // Insert directly into editor at cursor position
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const imageNode = $createImageNode(imageSrc, "uploaded image");
        selection.insertNodes([imageNode]);
      }
    });
  };

  const handleVideoUpload = (videoSrc: string) => {
    // Insert directly into editor at cursor position
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const videoNode = $createVideoNode(videoSrc);
        selection.insertNodes([videoNode]);
      }
    });
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const triggerImageUpload = () => {
    imageInputRef.current?.click();
  };

  const triggerVideoUpload = () => {
    videoInputRef.current?.click();
  };

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          handleImageUpload(result);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    e.target.value = '';
  };

  const handleVideoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          handleVideoUpload(result);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    e.target.value = '';
  };

  return (
    <>
      <MainToolbar editor={editor} />
      
      {/* Hidden file inputs for InsertMenu */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageInputChange}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoInputChange}
        className="hidden"
      />
      
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
        {/* Media is now inserted directly into editor at cursor position */}

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
              onInsertImage={triggerImageUpload}
              onInsertVideo={triggerVideoUpload}
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