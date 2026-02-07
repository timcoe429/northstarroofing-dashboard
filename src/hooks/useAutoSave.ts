import { useState, useEffect, useRef, useCallback } from 'react';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions {
  debounceMs?: number;
  saveOnBlur?: boolean;
}

export function useAutoSave<T>(
  initialValue: T,
  onSave: (value: T) => Promise<void>,
  options: UseAutoSaveOptions = {}
): {
  value: T;
  setValue: (value: T) => void;
  saveState: SaveState;
  saveNow: () => Promise<void>;
  cancel: () => void;
} {
  const { debounceMs = 300, saveOnBlur = true } = options;
  
  const [value, setValue] = useState<T>(initialValue);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // Update value when initialValue changes (e.g., card prop updates)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setValue(initialValue);
      return;
    }
    setValue(initialValue);
  }, [initialValue]);

  const saveNow = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    setSaveState('saving');
    try {
      await onSave(value);
      setSaveState('saved');
      setTimeout(() => {
        setSaveState('idle');
      }, 2000);
    } catch (error) {
      console.error('Auto-save failed:', error);
      setSaveState('error');
      setTimeout(() => {
        setSaveState('idle');
      }, 3000);
    }
  }, [value, onSave]);

  // Debounced save effect
  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      saveNow();
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, debounceMs, saveNow]);

  const handleSetValue = useCallback((newValue: T) => {
    setValue(newValue);
  }, []);

  const cancel = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setSaveState('idle');
  }, []);

  return {
    value,
    setValue: handleSetValue,
    saveState,
    saveNow,
    cancel,
  };
}
