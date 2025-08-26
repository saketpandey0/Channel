import React, { type JSX, type Dispatch, useCallback, useEffect, useRef, useState } from 'react';
import { $isCodeHighlightNode } from '@lexical/code';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  getDOMSelection,
  type LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { createPortal } from 'react-dom';

import { getDOMRangeRect } from '../../utils/getDomRangeRect';
import { getSelectedNode } from '../../utils/getSelectedNode';
import { setFloatingElemPosition } from '../../utils/setFloatingElemPosition';

interface TextFormatFloatingToolbarProps {
  editor: LexicalEditor;
  anchorElem: HTMLElement;
  isBold: boolean;
  isCode: boolean;
  isItalic: boolean;
  isLink: boolean;
  isUppercase: boolean;
  isLowercase: boolean;
  isCapitalize: boolean;
  isStrikethrough: boolean;
  isSubscript: boolean;
  isSuperscript: boolean;
  isUnderline: boolean;
  setIsLinkEditMode: Dispatch<boolean>;
}

function TextFormatFloatingToolbar({
  editor,
  anchorElem,
  isLink,
  isBold,
  isItalic,
  isUnderline,
  isUppercase,
  isLowercase,
  isCapitalize,
  isCode,
  isStrikethrough,
  isSubscript,
  isSuperscript,
  setIsLinkEditMode,
}: TextFormatFloatingToolbarProps): JSX.Element {
  const popupCharStylesEditorRef = useRef<HTMLDivElement | null>(null);

  const insertLink = useCallback(() => {
    if (!isLink) {
      setIsLinkEditMode(true);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
    } else {
      setIsLinkEditMode(false);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink, setIsLinkEditMode]);

  const mouseMoveListener = useCallback((e: MouseEvent) => {
    if (
      popupCharStylesEditorRef?.current &&
      (e.buttons === 1 || e.buttons === 3)
    ) {
      if (popupCharStylesEditorRef.current.style.pointerEvents !== 'none') {
        const x = e.clientX;
        const y = e.clientY;
        const elementUnderMouse = document.elementFromPoint(x, y);

        if (!popupCharStylesEditorRef.current.contains(elementUnderMouse)) {
          // Mouse is not over the target element => not a normal click, but probably a drag
          popupCharStylesEditorRef.current.style.pointerEvents = 'none';
        }
      }
    }
  }, []);

  const mouseUpListener = useCallback(() => {
    if (popupCharStylesEditorRef?.current) {
      if (popupCharStylesEditorRef.current.style.pointerEvents !== 'auto') {
        popupCharStylesEditorRef.current.style.pointerEvents = 'auto';
      }
    }
  }, []);

  useEffect(() => {
    if (popupCharStylesEditorRef?.current) {
      document.addEventListener('mousemove', mouseMoveListener);
      document.addEventListener('mouseup', mouseUpListener);

      return () => {
        document.removeEventListener('mousemove', mouseMoveListener);
        document.removeEventListener('mouseup', mouseUpListener);
      };
    }
  }, [mouseMoveListener, mouseUpListener]);

  const $updateTextFormatFloatingToolbar = useCallback(() => {
    const selection = $getSelection();
    const popupCharStylesEditorElem = popupCharStylesEditorRef.current;
    const nativeSelection = getDOMSelection(editor._window);

    if (popupCharStylesEditorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      nativeSelection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const rangeRect = getDOMRangeRect(nativeSelection, rootElement);

      setFloatingElemPosition(
        rangeRect,
        popupCharStylesEditorElem,
        anchorElem,
        isLink,
      );
    }
  }, [editor, anchorElem, isLink]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        $updateTextFormatFloatingToolbar();
      });
    };

    window.addEventListener('resize', update);
    if (scrollerElem) {
      scrollerElem.addEventListener('scroll', update);
    }

    return () => {
      window.removeEventListener('resize', update);
      if (scrollerElem) {
        scrollerElem.removeEventListener('scroll', update);
      }
    };
  }, [editor, $updateTextFormatFloatingToolbar, anchorElem]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      $updateTextFormatFloatingToolbar();
    });
    
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateTextFormatFloatingToolbar();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateTextFormatFloatingToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, $updateTextFormatFloatingToolbar]);

  const formatButtons = [
    { format: 'bold', icon: 'bold', title: 'Bold', active: isBold },
    { format: 'italic', icon: 'italic', title: 'Italic', active: isItalic },
    { format: 'underline', icon: 'underline', title: 'Underline', active: isUnderline },
    { format: 'strikethrough', icon: 'strikethrough', title: 'Strikethrough', active: isStrikethrough },
    { format: 'subscript', icon: 'subscript', title: 'Subscript', active: isSubscript },
    { format: 'superscript', icon: 'superscript', title: 'Superscript', active: isSuperscript },
    { format: 'uppercase', icon: 'uppercase', title: 'Uppercase', active: isUppercase },
    { format: 'lowercase', icon: 'lowercase', title: 'Lowercase', active: isLowercase },
    { format: 'capitalize', icon: 'capitalize', title: 'Capitalize', active: isCapitalize },
    { format: 'code', icon: 'code', title: 'Insert code block', active: isCode },
  ];

  return (
    <div ref={popupCharStylesEditorRef} className="floating-text-format-popup">
      {editor.isEditable() && (
        <>
          {formatButtons.map(({ format, icon, title, active }) => (
            <button
              key={format}
              type="button"
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
              }}
              className={`popup-item spaced ${active ? 'active' : ''}`}
              title={title}
              aria-label={`Format text as ${format}`}>
              <i className={`format ${icon}`} />
            </button>
          ))}
          <button
            type="button"
            onClick={insertLink}
            className={`popup-item spaced ${isLink ? 'active' : ''}`}
            title="Insert link"
            aria-label="Insert link">
            <i className="format link" />
          </button>
        </>
      )}
    </div>
  );
}

function useFloatingTextFormatToolbar(
  editor: LexicalEditor,
  anchorElem: HTMLElement,
  setIsLinkEditMode: Dispatch<boolean>,
): JSX.Element | null {
  const [isText, setIsText] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isUppercase, setIsUppercase] = useState(false);
  const [isLowercase, setIsLowercase] = useState(false);
  const [isCapitalize, setIsCapitalize] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const updatePopup = useCallback(() => {
    editor.getEditorState().read(() => {
      // Should not pop up the floating toolbar when using IME input
      if (editor.isComposing()) {
        return;
      }
      
      const selection = $getSelection();
      const nativeSelection = getDOMSelection(editor._window);
      const rootElement = editor.getRootElement();

      if (
        nativeSelection !== null &&
        (!$isRangeSelection(selection) ||
          rootElement === null ||
          !rootElement.contains(nativeSelection.anchorNode))
      ) {
        setIsText(false);
        return;
      }

      if (!$isRangeSelection(selection)) {
        return;
      }

      const node = getSelectedNode(selection);

      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsUppercase(selection.hasFormat('uppercase'));
      setIsLowercase(selection.hasFormat('lowercase'));
      setIsCapitalize(selection.hasFormat('capitalize'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsSubscript(selection.hasFormat('subscript'));
      setIsSuperscript(selection.hasFormat('superscript'));
      setIsCode(selection.hasFormat('code'));

      // Update links
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (
        !$isCodeHighlightNode(selection.anchor.getNode()) &&
        selection.getTextContent() !== ''
      ) {
        setIsText($isTextNode(node) || $isParagraphNode(node));
      } else {
        setIsText(false);
      }

      const rawTextContent = selection.getTextContent().replace(/\n/g, '');
      if (!selection.isCollapsed() && rawTextContent === '') {
        setIsText(false);
        return;
      }
    });
  }, [editor]);

  useEffect(() => {
    const handleSelectionChange = () => {
      updatePopup();
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [updatePopup]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        updatePopup();
      }),
      editor.registerRootListener(() => {
        if (editor.getRootElement() === null) {
          setIsText(false);
        }
      }),
    );
  }, [editor, updatePopup]);

  if (!isText) {
    return null;
  }

  return createPortal(
    <TextFormatFloatingToolbar
      editor={editor}
      anchorElem={anchorElem}
      isLink={isLink}
      isBold={isBold}
      isItalic={isItalic}
      isUppercase={isUppercase}
      isLowercase={isLowercase}
      isCapitalize={isCapitalize}
      isStrikethrough={isStrikethrough}
      isSubscript={isSubscript}
      isSuperscript={isSuperscript}
      isUnderline={isUnderline}
      isCode={isCode}
      setIsLinkEditMode={setIsLinkEditMode}
    />,
    anchorElem,
  );
}

interface FloatingTextFormatToolbarPluginProps {
  anchorElem?: HTMLElement;
  setIsLinkEditMode: Dispatch<boolean>;
}

export default function FloatingTextFormatToolbarPlugin({
  anchorElem = document.body,
  setIsLinkEditMode,
}: FloatingTextFormatToolbarPluginProps): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  return useFloatingTextFormatToolbar(editor, anchorElem, setIsLinkEditMode);
}