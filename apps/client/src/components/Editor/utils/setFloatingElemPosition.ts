const VERTICAL_GAP = 10;
const HORIZONTAL_OFFSET = 5;

export function setFloatingElemPosition(
  targetRect: DOMRect | null,
  floatingElem: HTMLElement,
  anchorElem: HTMLElement,
  isLink: boolean = false,
): void {
  const scrollerElem = anchorElem.parentElement;

  if (targetRect === null || !scrollerElem) {
    floatingElem.style.opacity = '0';
    floatingElem.style.transform = 'translate(-10000px, -10000px)';
    return;
  }

  const floatingElemRect = floatingElem.getBoundingClientRect();
  const anchorElementRect = anchorElem.getBoundingClientRect();
  const editorScrollerRect = scrollerElem.getBoundingClientRect();

  let top = targetRect.top - floatingElemRect.height - VERTICAL_GAP;
  let left = targetRect.left - HORIZONTAL_OFFSET;

  if (top < editorScrollerRect.top) {
    // If there's not enough space above, place it below
    top = targetRect.bottom + VERTICAL_GAP;
  }

  if (left + floatingElemRect.width > editorScrollerRect.right) {
    // If it would overflow on the right, align to the right edge
    left = editorScrollerRect.right - floatingElemRect.width - HORIZONTAL_OFFSET;
  }

  if (left < editorScrollerRect.left) {
    // If it would overflow on the left, align to the left edge
    left = editorScrollerRect.left + HORIZONTAL_OFFSET;
  }

  top -= anchorElementRect.top;
  left -= anchorElementRect.left;

  floatingElem.style.opacity = '1';
  floatingElem.style.transform = `translate(${left}px, ${top}px)`;
}
