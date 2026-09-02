// Shared "{{" detection/insertion logic for the {{variable}} autocomplete,
// used by both the legacy HTML <textarea> (selectionStart-based) and the
// canvas's contentEditable blocks (Range/Selection-based) so both editing
// surfaces get the same autocomplete behavior from one implementation.

export interface BraceQuery { query: string; start: number }

// Given the text immediately before the caret, is the user mid-typing a
// "{{name" placeholder? Bails once a "}}" or newline already closed it, or
// it's grown unreasonably long (not actually a placeholder being typed).
export function detectBraceQuery(before: string): BraceQuery | null {
  const openAt = before.lastIndexOf('{{');
  if (openAt === -1) return null;
  const between = before.slice(openAt + 2);
  if (between.includes('}}') || between.includes('\n') || between.length > 30) return null;
  return { query: between.trim(), start: openAt };
}

// Flattened text content of `root` up to the current caret position —
// correct across nested inline tags (e.g. a <a> a text block already
// contains), unlike reading a single text node's data directly.
export function getTextBeforeCaret(root: HTMLElement): string | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return null;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.startContainer)) return null;
  const preRange = document.createRange();
  preRange.selectNodeContents(root);
  preRange.setEnd(range.startContainer, range.startOffset);
  return preRange.toString();
}

function findBoundary(root: Node, targetOffset: number): { node: Node; offset: number } | null {
  let remaining = targetOffset;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const len = node.textContent?.length ?? 0;
    if (remaining <= len) return { node, offset: remaining };
    remaining -= len;
  }
  return { node: root, offset: root.childNodes.length };
}

// Replaces the flattened-text range [startOffset, endOffset) within `root`
// with `text`, via the current selection + execCommand so undo/redo and
// input events behave normally (same approach any inline editor uses).
export function replaceTextRange(root: HTMLElement, startOffset: number, endOffset: number, text: string) {
  const start = findBoundary(root, startOffset);
  const end = findBoundary(root, endOffset);
  if (!start || !end) return;
  const range = document.createRange();
  range.setStart(start.node, start.offset);
  range.setEnd(end.node, end.offset);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
  document.execCommand('insertText', false, text);
}

export function currentCaretOffset(root: HTMLElement): number | null {
  const before = getTextBeforeCaret(root);
  return before === null ? null : before.length;
}
