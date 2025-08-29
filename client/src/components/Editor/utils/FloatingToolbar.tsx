import { useState, useEffect, useRef, useCallback } from "react";
import { 
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW
} from 'lexical';
import { Bold, Italic, Underline, Strikethrough, Code, Link } from "lucide-react";
import { mergeRegister } from '@lexical/utils';
import { $createCodeNode } from "@lexical/code";
import { $createLinkNode } from "@lexical/link";
import { type LexicalEditor } from "lexical";


export default function FloatingToolbar({ editor, anchorElem }: { editor: LexicalEditor, anchorElem: HTMLElement }) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [formatState, setFormatState] = useState({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
    isCode: false,
    isLink: false,
  });
  const toolbarRef = useRef(null);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    
    if ($isRangeSelection(selection) && !selection.isCollapsed()) {
      const nativeSelection = window.getSelection();
      if (nativeSelection && nativeSelection.rangeCount > 0) {
        const range = nativeSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setPosition({
          top: rect.top - 60,
          left: rect.left + rect.width / 2,
        });
        
        setFormatState({
          isBold: selection.hasFormat('bold'),
          isItalic: selection.hasFormat('italic'),
          isUnderline: selection.hasFormat('underline'),
          isStrikethrough: selection.hasFormat('strikethrough'),
          isCode: selection.hasFormat('code'),
          isLink: false, 
        });
        
        setIsVisible(true);
      }
    } else {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, updateToolbar]);

  if (!isVisible) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 bg-gray-900/90 text-white rounded-lg shadow-xl p-2 flex items-center space-x-1 transform -translate-x-1/2"
      style={{ top: position.top, left: position.left }}
    >
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        className={`p-2 rounded hover:bg-gray-700 ${formatState.isBold ? 'bg-gray-700' : ''}`}
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        className={`p-2 rounded hover:bg-gray-700 ${formatState.isItalic ? 'bg-gray-700' : ''}`}
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        className={`p-2 rounded hover:bg-gray-700 ${formatState.isUnderline ? 'bg-gray-700' : ''}`}
        title="Underline"
      >
        <Underline size={16} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
        className={`p-2 rounded hover:bg-gray-700 ${formatState.isStrikethrough ? 'bg-gray-700 p-0' : ''}`}
        title="Strikethrough"
      >
        <Strikethrough size={16} />
      </button>
      <div className="w-px py-1 h-4 bg-gray-600 mx-1"></div>
      <button
        onClick={() => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              const codeNode = $createCodeNode("javascript"); 
              selection.insertNodes([codeNode]);
            }
          });
        }}
        className={`display:block rounded hover:bg-gray-700`}
        title="Code Block"
      >
        <Code size={16} />
      </button>
      <button
        onClick={() => {/* Link functionality */}}
        className="p-2 rounded hover:bg-gray-700"
        title="Link"
      >
        <Link size={16} />
      </button>
    </div>
  );
}
