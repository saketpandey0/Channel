import { useState, useEffect, useCallback } from "react";
import { 
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  createCommand
} from 'lexical';
import { Bold, Italic, Underline, Strikethrough, Code, AlignLeft, AlignCenter, AlignRight, AlignJustify, Eye, Save } from "lucide-react";
import { mergeRegister } from '@lexical/utils';
import { type LexicalEditor } from "lexical";


const INSERT_IMAGE_COMMAND = createCommand('INSERT_IMAGE_COMMAND');
const INSERT_VIDEO_COMMAND = createCommand('INSERT_VIDEO_COMMAND');

export default function MainToolbar({ editor }: { editor: LexicalEditor }) {
  const [formatState, setFormatState] = useState({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
    isCode: false,
  });

  const updateFormatState = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setFormatState({
        isBold: selection.hasFormat('bold'),
        isItalic: selection.hasFormat('italic'),
        isUnderline: selection.hasFormat('underline'),
        isStrikethrough: selection.hasFormat('strikethrough'),
        isCode: selection.hasFormat('code'),
      });
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateFormatState();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, updateFormatState]);

  const formatButtons = [
    { command: 'bold', icon: Bold, active: formatState.isBold, title: 'Bold' },
    { command: 'italic', icon: Italic, active: formatState.isItalic, title: 'Italic' },
    { command: 'underline', icon: Underline, active: formatState.isUnderline, title: 'Underline' },
    { command: 'strikethrough', icon: Strikethrough, active: formatState.isStrikethrough, title: 'Strikethrough' },
    { command: 'code', icon: Code, active: formatState.isCode, title: 'Code' },
  ];

  const alignButtons = [
    { command: 'left', icon: AlignLeft, title: 'Align Left' },
    { command: 'center', icon: AlignCenter, title: 'Align Center' },
    { command: 'right', icon: AlignRight, title: 'Align Right' },
    { command: 'justify', icon: AlignJustify, title: 'Justify' },
  ];

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {formatButtons.map(({ command, icon: Icon, active, title }) => (
            <button
              key={command}
              onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, command)}
              className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                active ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
              }`}
              title={title}
            >
              <Icon size={16} />
            </button>
          ))}
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          {alignButtons.map(({ command, icon: Icon, title }) => (
            <button
              key={command}
              onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, command)}
              className="p-2 rounded hover:bg-gray-100 text-gray-600 transition-colors"
              title={title}
            >
              <Icon size={16} />
            </button>
          ))}
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <select 
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'paragraph') {
                // Convert to paragraph
              } else {
                // Convert to heading
                editor.update(() => {
                  const selection = $getSelection();
                  if ($isRangeSelection(selection)) {
                    selection.formatText('heading', { tag: value });
                  }
                });
              }
            }}
          >
            <option value="paragraph">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>
          
          <select className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>16px</option>
            <option>18px</option>
            <option>20px</option>
            <option>24px</option>
            <option>32px</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded hover:bg-gray-100 text-gray-600" title="Preview">
            <Eye size={16} />
          </button>
          <button className="p-2 rounded hover:bg-gray-100 text-gray-600" title="Save">
            <Save size={16} />
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-medium">
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}