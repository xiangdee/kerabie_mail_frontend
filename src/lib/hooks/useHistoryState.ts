import { useCallback, useRef, useState } from 'react';

// Debounced undo/redo history for a piece of state — used by the template
// canvas so structural edits (add/remove/move a block or section) each get
// their own undo step, while a burst of keystrokes inside one contentEditable
// block collapses into a single checkpoint instead of one step per character.
export function useHistoryState<T>(initial: T, debounceMs = 500) {
  const [state, setStateRaw] = useState(initial);
  const undoStack = useRef<T[]>([]);
  const redoStack = useRef<T[]>([]);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, forceRender] = useState(0);

  const setState = useCallback((next: T | ((prev: T) => T)) => {
    setStateRaw((prev) => {
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      if (!pendingTimer.current) {
        undoStack.current.push(prev);
        redoStack.current = [];
        forceRender((n) => n + 1);
      }
      if (pendingTimer.current) clearTimeout(pendingTimer.current);
      pendingTimer.current = setTimeout(() => { pendingTimer.current = null; }, debounceMs);
      return resolved;
    });
  }, [debounceMs]);

  const undo = useCallback(() => {
    setStateRaw((prev) => {
      const last = undoStack.current.pop();
      if (last === undefined) return prev;
      redoStack.current.push(prev);
      forceRender((n) => n + 1);
      return last;
    });
  }, []);

  const redo = useCallback(() => {
    setStateRaw((prev) => {
      const next = redoStack.current.pop();
      if (next === undefined) return prev;
      undoStack.current.push(prev);
      forceRender((n) => n + 1);
      return next;
    });
  }, []);

  // Replaces the current state without creating an undo step — for loading
  // a different template or resetting to a fresh starter design.
  const reset = useCallback((value: T) => {
    undoStack.current = [];
    redoStack.current = [];
    setStateRaw(value);
    forceRender((n) => n + 1);
  }, []);

  return {
    state, setState, undo, redo, reset,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
  };
}
