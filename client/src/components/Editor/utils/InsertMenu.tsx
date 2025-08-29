import { useState } from "react";
import { Plus, Image, Video, Mic, MicOff, Code, X } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../../shad";
import { 
  $getSelection,
  $isRangeSelection,
  type LexicalEditor,
} from 'lexical';
import InsertYouTubeButton from "./InsertYouTubeButton";
import { $createCodeNode } from "@lexical/code";

interface InsertMenuProps {
  editor: LexicalEditor;
  onInsertImage: () => void;
  onInsertVideo: () => void;
  isRecording: boolean;
  onToggleRecording: () => void;
}

export default function InsertMenu({ 
  editor, 
  onInsertImage, 
  onInsertVideo, 
  isRecording, 
  onToggleRecording 
}: InsertMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleInsertCode = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const codeNode = $createCodeNode("javascript"); 
        selection.insertNodes([codeNode]);
      }
    });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
        title="Insert content"
      >
        {isOpen ? (
          <X size={16} className="text-gray-600" />
        ) : (
          <Plus size={16} className="text-gray-600" />
        )}
      </button>
      
      <TooltipProvider>
        {isOpen && (
          <div className="absolute left-10 top-0 bg-white shadow-xl rounded-lg p-2 min-w-48 z-50">
            <div className="space-x-1 flex flex-row">

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      onInsertImage();
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-center px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    <Image size={16} className="text-gray-600" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Insert an image</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      onInsertVideo();
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-center px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    <Video size={16} className="text-gray-600" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Insert a video</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      onToggleRecording();
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-center px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    {isRecording ? (
                      <MicOff size={16} className="text-red-600" />
                    ) : (
                      <Mic size={16} className="text-gray-600" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{isRecording ? "Stop voice recording" : "Record a voice note"}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center px-3 py-2 hover:bg-gray-100 rounded">
                    <InsertYouTubeButton editor={editor} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Insert a Youtube video</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleInsertCode}
                    className="flex items-center justify-center px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                    title="Code Block"
                  >
                    <Code size={16} className="text-gray-600" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Insert code block</TooltipContent>
              </Tooltip>

            </div>
          </div>
        )}
      </TooltipProvider>
    </div>
  );
}