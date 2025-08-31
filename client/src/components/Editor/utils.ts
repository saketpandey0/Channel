export const generateExcerpt = (text: string): string => {
  const words = text.split(" ").slice(0, 30);
  return words.join(" ") + (words.length >= 30 ? "..." : "");
};

export const getWordCount = (text: string): number => {
  return text?.split(" ").filter((w) => w.length > 0).length || 0;
};

export const getReadingTime = (text: string): number => {
  const wordCount = getWordCount(text);
  return Math.max(1, Math.ceil(wordCount / 200));
};

export const insertList = (
  ordered: boolean = false,
  editorRef: React.RefObject<HTMLDivElement>,
  saveToHistory: () => void
) => {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    let parentElement: Node | null = range.commonAncestorContainer;
    if (parentElement.nodeType === Node.TEXT_NODE) {
      parentElement = parentElement.parentElement;
    }

    const currentList = (parentElement as Element)?.closest("ul, ol");

    if (currentList) {
      const listItems = currentList.querySelectorAll("li");
      const fragment = document.createDocumentFragment();

      listItems.forEach((li) => {
        const p = document.createElement("p");
        p.innerHTML = li.innerHTML;
        fragment.appendChild(p);
      });

      currentList.parentNode?.replaceChild(fragment, currentList);
    } else {
      const listTag = ordered ? "ol" : "ul";
      const list = document.createElement(listTag);
      list.style.marginLeft = "20px";
      list.style.marginTop = "8px";
      list.style.marginBottom = "8px";

      const selectedText = selection.toString();
      const listItem = document.createElement("li");
      listItem.style.marginBottom = "4px";

      if (selectedText) {
        listItem.textContent = selectedText;
        range.deleteContents();
      } else {
        listItem.innerHTML = "<br>";
      }

      list.appendChild(listItem);
      range.insertNode(list);

      const newRange = document.createRange();
      newRange.setStart(listItem, 0);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }

    saveToHistory();
  }
};

export const insertBlockquote = (saveToHistory: () => void) => {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    let parentElement: Node | null = range.commonAncestorContainer;
    if (parentElement.nodeType === Node.TEXT_NODE) {
      parentElement = parentElement.parentElement;
    }

    const currentBlockquote = (parentElement as Element)?.closest("blockquote");

    if (currentBlockquote) {
      const p = document.createElement("p");
      p.innerHTML = currentBlockquote.innerHTML;
      currentBlockquote.parentNode?.replaceChild(p, currentBlockquote);
    } else {
      const blockquote = document.createElement("blockquote");
      blockquote.style.borderLeft = "4px solid #e5e7eb";
      blockquote.style.paddingLeft = "16px";
      blockquote.style.margin = "16px 0";
      blockquote.style.fontStyle = "italic";
      blockquote.style.color = "#6b7280";

      const selectedText = selection.toString();
      if (selectedText) {
        blockquote.textContent = selectedText;
        range.deleteContents();
      } else {
        blockquote.innerHTML = "Quote text...";
      }

      range.insertNode(blockquote);
      range.collapse(false);
    }

    saveToHistory();
  }
};

export const insertCodeBlock = (saveToHistory: () => void) => {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.style.backgroundColor = "#f4f4f4";
    code.style.padding = "12px";
    code.style.display = "block";
    code.style.borderRadius = "4px";
    code.style.fontFamily = "monospace";
    code.textContent = selection.toString() || "Code block";
    pre.appendChild(code);

    range.deleteContents();
    range.insertNode(pre);
    range.collapse(false);
    saveToHistory();
  }
};

export const isCommandActive = (command: string): boolean => {
  try {
    if (command === "insertUnorderedList") {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        let element: Node | null = selection.getRangeAt(0).commonAncestorContainer;
        if (element.nodeType === Node.TEXT_NODE) {
          element = element.parentElement;
        }
        return !!(element as Element)?.closest("ul");
      }
      return false;
    }
    if (command === "insertOrderedList") {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        let element: Node | null = selection.getRangeAt(0).commonAncestorContainer;
        if (element.nodeType === Node.TEXT_NODE) {
          element = element.parentElement;
        }
        return !!(element as Element)?.closest("ol");
      }
      return false;
    }
    if (command === "blockquote") {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        let element: Node | null = selection.getRangeAt(0).commonAncestorContainer;
        if (element.nodeType === Node.TEXT_NODE) {
          element = element.parentElement;
        }
        return !!(element as Element)?.closest("blockquote");
      }
      return false;
    }
    return document.queryCommandState(command);
  } catch (e) {
    return false;
  }
};