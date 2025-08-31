// src/admin/hooks/useAdminData.ts
import { useState, useCallback } from 'react';
import { ApiResponse } from '../types';

interface UseAdminDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseAdminDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
  setData: (data: T | null) => void;
}

export function useAdminData<T>(
  apiCall: (...args: any[]) => Promise<ApiResponse<T>>
): UseAdminDataReturn<T> {
  const [state, setState] = useState<UseAdminDataState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args: any[]) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiCall(...args);
      
      if (result.success) {
        setState({
          data: result.data || null,
          loading: false,
          error: null,
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: result.error || 'An error occurred',
        });
      }
    } catch (error: any) {
      setState({
        data: null,
        loading: false,
        error: error.error || error.message || 'An unexpected error occurred',
      });
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({
      ...prev,
      data,
    }));
  }, []);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute,
    reset,
    setData,
  };
}