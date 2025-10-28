import { useState, useCallback } from 'react';
import { produce } from 'immer';

export function useHistory<T>(initialState: T) {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [index, setIndex] = useState(0);

  const state = history[index];

  const setState = useCallback((updater: (draft: T) => void | T) => {
    const currentState = history[index];
    
    const nextState = produce(currentState, updater);

    // Don't add to history if state is unchanged. Produce already does this with structural sharing.
    if (nextState === currentState) {
      return;
    }
    
    const newHistory = history.slice(0, index + 1);
    newHistory.push(nextState);

    setHistory(newHistory);
    setIndex(newHistory.length - 1);
  }, [history, index]);

  const undo = useCallback(() => {
    if (index > 0) {
      setIndex(prev => prev - 1);
    }
  }, [index]);

  const redo = useCallback(() => {
    if (index < history.length - 1) {
      setIndex(prev => prev + 1);
    }
  }, [index, history.length]);

  const reset = useCallback((newState: T) => {
    setHistory([newState]);
    setIndex(0);
  }, []);

  return {
    state,
    setState,
    undo,
    redo,
    reset,
    canUndo: index > 0,
    canRedo: index < history.length - 1,
  };
}
