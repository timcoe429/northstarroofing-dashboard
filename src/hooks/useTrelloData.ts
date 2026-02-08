'use client';

// ===========================================
// TRELLO DATA REACT HOOK
// ===========================================

import { useState, useEffect, useCallback } from 'react';
import { TrelloService } from '@/lib/api/trello';
import type { TrelloBoardData } from '@/types';

interface TrelloCredentials {
  apiKey: string;
  token: string;
  salesBoardId: string;
  buildBoardId: string;
}

interface UseTrelloBoardReturn {
  data: TrelloBoardData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Custom hook for fetching and caching Trello board data
 * Supports both 'sales' and 'build' board types with independent caching
 */
export function useTrelloBoard(boardType: 'sales' | 'build'): UseTrelloBoardReturn {
  const [data, setData] = useState<TrelloBoardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get credentials from localStorage (fallback for now)
  const getCredentials = useCallback((): TrelloCredentials | null => {
    try {
      const stored = localStorage.getItem('trello-credentials');
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      if (!parsed.apiKey || !parsed.token) return null;
      
      return parsed;
    } catch {
      return null;
    }
  }, []);

  // Create Trello service instance with current credentials
  const createTrelloService = useCallback((): TrelloService | null => {
    const credentials = getCredentials();
    if (!credentials) return null;

    return new TrelloService({
      apiKey: credentials.apiKey,
      token: credentials.token,
      salesBoardId: credentials.salesBoardId,
      buildBoardId: credentials.buildBoardId,
    });
  }, [getCredentials]);

  // Fetch board data
  const fetchBoardData = useCallback(async () => {
    const service = createTrelloService();
    if (!service) {
      setError('Trello credentials not configured. Please set up your API credentials in Settings.');
      setLoading(false);
      return;
    }

    const credentials = getCredentials();
    if (!credentials) {
      setError('Unable to read Trello credentials.');
      setLoading(false);
      return;
    }

    const boardId = boardType === 'sales' ? credentials.salesBoardId : credentials.buildBoardId;
    if (!boardId) {
      setError(`${boardType === 'sales' ? 'Sales/Estimates' : 'Build/Jobs'} Board ID not configured. Please set it up in Settings.`);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const boardData = await service.getFullBoardData(boardId);
      setData(boardData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      // Provide more specific error messages
      if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
        setError('Authentication failed. Please check your API Key and Token in Settings.');
      } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        setError(`Board not found. Please verify the ${boardType === 'sales' ? 'Sales/Estimates' : 'Build/Jobs'} Board ID in Settings.`);
      } else if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
        setError('Access denied. Please ensure your Trello token has access to this board.');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(`Failed to fetch ${boardType} board data: ${errorMessage}`);
      }
      
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [boardType, createTrelloService, getCredentials]);

  // Refresh function for manual re-fetch
  const refresh = useCallback(() => {
    fetchBoardData();
  }, [fetchBoardData]);

  // Initial fetch on mount and when boardType changes
  useEffect(() => {
    fetchBoardData();
  }, [fetchBoardData]);

  // Listen for credential changes in localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'trello-credentials') {
        // Credentials changed, refetch data
        fetchBoardData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchBoardData]);

  return {
    data,
    loading,
    error,
    refresh,
  };
}

/**
 * Hook for fetching both sales and build board data
 * Returns combined state and individual refresh functions
 */
export function useTrelloBoards() {
  const salesBoard = useTrelloBoard('sales');
  const buildBoard = useTrelloBoard('build');

  const refreshAll = useCallback(() => {
    salesBoard.refresh();
    buildBoard.refresh();
  }, [salesBoard, buildBoard]);

  return {
    sales: salesBoard,
    build: buildBoard,
    loading: salesBoard.loading || buildBoard.loading,
    hasErrors: !!salesBoard.error || !!buildBoard.error,
    refreshAll,
  };
}

/**
 * Utility hook for managing Trello credentials in localStorage
 * This will eventually be replaced with Supabase storage
 */
export function useTrelloCredentials() {
  const [credentials, setCredentials] = useState<TrelloCredentials | null>(null);

  // Load credentials from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('trello-credentials');
      if (stored) {
        setCredentials(JSON.parse(stored));
      }
    } catch {
      // Ignore parsing errors
    }
  }, []);

  // Save credentials to localStorage
  const saveCredentials = useCallback((newCredentials: TrelloCredentials) => {
    try {
      localStorage.setItem('trello-credentials', JSON.stringify(newCredentials));
      setCredentials(newCredentials);
      
      // Trigger storage event for other tabs/hooks
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'trello-credentials',
        newValue: JSON.stringify(newCredentials),
      }));
    } catch (err) {
      console.error('Failed to save Trello credentials:', err);
    }
  }, []);

  // Clear credentials
  const clearCredentials = useCallback(() => {
    try {
      localStorage.removeItem('trello-credentials');
      setCredentials(null);
      
      // Trigger storage event for other tabs/hooks
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'trello-credentials',
        newValue: null,
      }));
    } catch (err) {
      console.error('Failed to clear Trello credentials:', err);
    }
  }, []);

  // Check if credentials are configured
  const isConfigured = useCallback(() => {
    return !!(credentials?.apiKey && credentials?.token && 
             (credentials?.salesBoardId || credentials?.buildBoardId));
  }, [credentials]);

  return {
    credentials,
    saveCredentials,
    clearCredentials,
    isConfigured,
  };
}

/**
 * Hook for testing Trello connections
 */
export function useTrelloConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{ sales?: boolean; build?: boolean } | null>(null);

  const testConnection = useCallback(async (
    apiKey: string, 
    token: string, 
    salesBoardId?: string, 
    buildBoardId?: string
  ) => {
    setTesting(true);
    setResults(null);

    const service = new TrelloService({
      apiKey,
      token,
      salesBoardId,
      buildBoardId,
    });

    try {
      const testResults: { sales?: boolean; build?: boolean } = {};

      // Test sales board if provided
      if (salesBoardId) {
        try {
          testResults.sales = await service.testBoardConnection(salesBoardId);
        } catch {
          testResults.sales = false;
        }
      }

      // Test build board if provided
      if (buildBoardId) {
        try {
          testResults.build = await service.testBoardConnection(buildBoardId);
        } catch {
          testResults.build = false;
        }
      }

      setResults(testResults);
      return testResults;
    } catch (err) {
      console.error('Connection test failed:', err);
      setResults({ sales: false, build: false });
      return { sales: false, build: false };
    } finally {
      setTesting(false);
    }
  }, []);

  return {
    testing,
    results,
    testConnection,
  };
}