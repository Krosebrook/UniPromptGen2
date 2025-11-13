import { useState, useEffect, useCallback } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext.tsx';
import { MOCK_LOGGED_IN_USER } from '../constants.ts';

type FetchFunction<T> = (workspaceId: string, folderId: string | null, userId: string) => Promise<T[]>;

export const useLibraryData = <T,>(
  fetchFunction: FetchFunction<T>,
  dataType: string,
  folderId: string | null,
  refreshKey?: number,
) => {
  const { currentWorkspace } = useWorkspace();
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!currentWorkspace) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFunction(currentWorkspace.id, folderId, MOCK_LOGGED_IN_USER.id);
      setData(result);
    } catch (e) {
      console.error(`Failed to fetch ${dataType}:`, e);
      setError(`Could not load ${dataType}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace, fetchFunction, dataType, folderId]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refreshData, setData };
};
