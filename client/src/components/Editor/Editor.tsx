
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import {
  ParagraphNode,
  TextNode,
} from 'lexical';
import { LinkNode } from '@lexical/link';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { YouTubeNode } from './nodes/YoutubeNode';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { Download, Video } from 'lucide-react';
import EditorPlugin from './Plugins/EditorPlugin';
import { ImageNode } from './nodes/ImageNode';
import { VideoNode } from './nodes/VideoNode';



const theme = {
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    code: 'bg-gray-100 px-1 py-0.5 rounded text-sm font-mono',
  },
  paragraph: 'mb-4 text-gray-800 leading-relaxed',
  heading: {
    h1: 'text-4xl font-bold mb-6 text-gray-900 leading-tight',
    h2: 'text-3xl font-semibold mb-4 text-gray-900 leading-tight',
    h3: 'text-2xl font-medium mb-3 text-gray-900 leading-tight',
  },
  quote: 'border-l-4 border-gray-300 pl-4 italic text-gray-700 my-4',
  list: {
    ul: 'list-disc ml-6 mb-4',
    ol: 'list-decimal ml-6 mb-4',
    listitem: 'mb-1',
  },
  link: 'text-blue-600 hover:text-blue-800 underline',
  code: 'bg-gray-100 p-4 rounded-lg font-mono text-sm my-4 overflow-x-auto',
};

const editorConfig = {
  namespace: 'MediumEditor',
  nodes: [
    ParagraphNode,
    TextNode,
    LinkNode,
    CodeNode,
    CodeHighlightNode,
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    YouTubeNode,
    VideoNode,
    ImageNode,
  ],
  onError(error: any) {
    console.error('Editor Error:', error);
  },
  theme,
};

export default function Editor() {
  return (
    <div className="min-h-screen bg-white">

      {/* Editor */}
      <LexicalComposer initialConfig={editorConfig}>
        <EditorPlugin />
      </LexicalComposer>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>Draft saved</span>
              <button className="flex items-center space-x-1 hover:text-gray-700">
                <Download size={14} />
                <span>Export</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <span>0 words</span>
              <span>0 min read</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}