import { useState } from "react";
import { Plus, Image, Video, Mic, MicOff, Code, Quote } from "lucide-react";
import { 
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $insertNodes,
  type LexicalEditor,
} from 'lexical';


interface InsertMenuProps {
  editor: LexicalEditor;
  onInsertImage: () => void;
  onInsertVideo: () => void;
  isRecording: boolean;
  onToggleRecording: () => void;
}

export default function InsertMenu({ editor, onInsertImage, onInsertVideo, isRecording, onToggleRecording }: InsertMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        title="Insert content"
      >
        <Plus size={16} className="text-gray-600" />
      </button>
      
      {isOpen && (
        <div className="absolute left-10 top-0 bg-white shadow-xl rounded-lg border p-2 min-w-48 z-50">
          <div className="space-y-1">
            <button
              onClick={() => {
                onInsertImage();
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded"
            >
              <Image size={16} className="text-gray-600" />
              <span className="text-sm">Image</span>
            </button>
            <button
              onClick={() => {
                onInsertVideo();
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded"
            >
              <Video size={16} className="text-gray-600" />
              <span className="text-sm">Video</span>
            </button>
            <button
              onClick={() => {
                onToggleRecording();
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded"
            >
              {isRecording ? <MicOff size={16} className="text-red-600" /> : <Mic size={16} className="text-gray-600" />}
              <span className="text-sm">{isRecording ? 'Stop Recording' : 'Voice Note'}</span>
            </button>
            <div className="border-t border-gray-200 my-1"></div>
            <button
              onClick={() => {
                editor.update(() => {
                  const selection = $getSelection();
                  if ($isRangeSelection(selection)) {
                    const quote = $createParagraphNode();
                    quote.setFormat('quote');
                    $insertNodes([quote]);
                  }
                });
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded"
            >
              <Quote size={16} className="text-gray-600" />
              <span className="text-sm">Quote</span>
            </button>
            <button
              onClick={() => {
                editor.update(() => {
                  const selection = $getSelection();
                  if ($isRangeSelection(selection)) {
                    const code = $createParagraphNode();
                    $insertNodes([code]);
                  }
                });
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded"
            >
              <Code size={16} className="text-gray-600" />
              <span className="text-sm">Code Block</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}