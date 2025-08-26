import type { EditorThemeClasses } from 'lexical';

const ExampleTheme: EditorThemeClasses = {
  // Text formatting
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
    overflowed: 'editor-text-overflowed',
    hashtag: 'editor-text-hashtag',
    underline: 'editor-text-underline',
    strikethrough: 'editor-text-strikethrough',
    underlineStrikethrough: 'editor-text-underlineStrikethrough',
    code: 'editor-text-code',
    subscript: 'editor-text-subscript',
    superscript: 'editor-text-superscript',
  },
  
  // Paragraph
  paragraph: 'editor-paragraph',
  
  // Quotes
  quote: 'editor-quote',
  
  // Headings
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2',
    h3: 'editor-heading-h3',
    h4: 'editor-heading-h4',
    h5: 'editor-heading-h5',
    h6: 'editor-heading-h6',
  },
  
  // Lists  
  list: {
    nested: {
      listitem: 'editor-nested-listitem',
    },
    ol: 'editor-list-ol',
    ul: 'editor-list-ul',
    listitem: 'editor-listitem',
    listitemChecked: 'editor-listitem-checked',
    listitemUnchecked: 'editor-listitem-unchecked',
  },
  
  // Links
  link: 'editor-link',
  
  // Code
  code: 'editor-code',
  codeHighlight: {
    atrule: 'editor-token-attr',
    attr: 'editor-token-attr',
    boolean: 'editor-token-boolean',
    builtin: 'editor-token-builtin',
    cdata: 'editor-token-cdata',
    char: 'editor-token-char',
    class: 'editor-token-class',
    'class-name': 'editor-token-class-name',
    comment: 'editor-token-comment',
    constant: 'editor-token-constant',
    deleted: 'editor-token-deleted',
    doctype: 'editor-token-doctype',
    entity: 'editor-token-entity',
    function: 'editor-token-function',
    important: 'editor-token-important',
    inserted: 'editor-token-inserted',
    keyword: 'editor-token-keyword',
    namespace: 'editor-token-namespace',
    number: 'editor-token-number',
    operator: 'editor-token-operator',
    prolog: 'editor-token-prolog',
    property: 'editor-token-property',
    punctuation: 'editor-token-punctuation',
    regex: 'editor-token-regex',
    selector: 'editor-token-selector',
    string: 'editor-token-string',
    symbol: 'editor-token-symbol',
    tag: 'editor-token-tag',
    url: 'editor-token-url',
    variable: 'editor-token-variable',
  },
  
  // Tables
  table: 'editor-table',
  tableAddColumns: 'editor-table-add-columns',
  tableAddRows: 'editor-table-add-rows',
  tableCell: 'editor-table-cell',
  tableCellActionButton: 'editor-table-cell-action-button',
  tableCellActionButtonContainer: 'editor-table-cell-action-button-container',
  tableCellEditing: 'editor-table-cell-editing',
  tableCellHeader: 'editor-table-cell-header',
  tableCellPrimarySelected: 'editor-table-cell-primary-selected',
  tableCellResizer: 'editor-table-cell-resizer',
  tableCellSelected: 'editor-table-cell-selected',
  tableCellSortedIndicator: 'editor-table-cell-sorted-indicator',
  tableResizeRuler: 'editor-table-resize-ruler',
  tableSelected: 'editor-table-selected',
  tableSelection: 'editor-table-selection',
  
  // Images
  image: 'editor-image',
  
  // Layout containers
  layoutContainer: 'editor-layout-container',
  layoutItem: 'editor-layout-item',
  
  // Marks/highlights
  mark: 'editor-mark',
  markOverlap: 'editor-mark-overlap',
  
  // Root
  root: 'editor-root',
  
  // Indent
  indent: 'editor-indent',
};

export default ExampleTheme;