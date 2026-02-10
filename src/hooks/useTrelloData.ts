'use client';

// ===========================================
// TRELLO DATA REACT HOOK
// ===========================================
// Trello data is fetched via server-side API routes that read
// TRELLO_API_KEY, TRELLO_TOKEN, TRELLO_SALES_BOARD_ID, TRELLO_BUILD_BOARD_ID from process.env.

import { useState, useEffect, useCallback } from 'react';
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

const API_URL = {
  sales: '/api/trello/sales-board',
  build: '/api/trello/build-board',
} as const;

function userFacingError(
  boardType: 'sales' | 'build',
  status: number,
  bodyError?: string
): string {
  const boardName = boardType === 'sales' ? 'Sales/Estimates' : 'Build/Jobs';
  if (status === 401) return 'Authentication failed. Please check your API Key and Token in Settings.';
  if (status === 403) return 'Access denied. Please ensure your Trello token has access to this board.';
  if (status === 404) return `Board not found. Please verify the ${boardName} Board ID in Settings.`;
  if (status === 503) return bodyError || 'Trello is not configured. Set TRELLO_* environment variables on the server.';
  if (bodyError) return bodyError;
  return `Failed to fetch ${boardType} board data. Please try again.`;
}

/**
 * Custom hook for fetching Trello board data via server API routes.
 * Supports both 'sales' and 'build' board types with independent caching.
 */
export function useTrelloBoard(boardType: 'sales' | 'build'): UseTrelloBoardReturn {
  const [data, setData] = useState<TrelloBoardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBoardData = useCallback(async () => {
    const url = API_URL[boardType];
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url);
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = userFacingError(
          boardType,
          res.status,
          typeof body?.error === 'string' ? body.error : undefined
        );
        setError(message);
        setData(null);
        return;
      }

      setData(body as TrelloBoardData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error occurred';
      if (msg.includes('fetch') || msg.includes('network')) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(`Failed to fetch ${boardType} board data: ${msg}`);
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [boardType]);

  const refresh = useCallback(() => {
    fetchBoardData();
  }, [fetchBoardData]);

  useEffect(() => {
    fetchBoardData();
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
 * Hook for Trello configuration status (server-side env only).
 * Credentials are not stored or editable in the client.
 */
export function useTrelloCredentials() {
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/trello/status')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && typeof data?.configured === 'boolean') setConfigured(data.configured);
      })
      .catch(() => {
        if (!cancelled) setConfigured(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isConfigured = useCallback(() => configured === true, [configured]);

  const saveCredentials = useCallback((_newCredentials: TrelloCredentials) => {
    // No-op: Trello is configured via server environment variables only.
  }, []);

  const clearCredentials = useCallback(() => {
    // No-op: Remove TRELLO_* env vars on the server to disconnect.
  }, []);

  return {
    credentials: configured ? {} : null,
    saveCredentials,
    clearCredentials,
    isConfigured,
    configured,
  };
}

/**
 * Hook for testing Trello connections via server (uses env vars).
 */
export function useTrelloConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{ sales?: boolean; build?: boolean } | null>(null);

  const testConnection = useCallback(async () => {
    setTesting(true);
    setResults(null);

    try {
      const res = await fetch('/api/trello/test');
      const data = await res.json();
      const testResults = {
        sales: data?.sales === true,
        build: data?.build === true,
      };
      setResults(testResults);
      return testResults;
    } catch (err) {
      console.error('Connection test failed:', err);
      const fallback = { sales: false, build: false };
      setResults(fallback);
      return fallback;
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
