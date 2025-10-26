import { useState, useCallback, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext.tsx';

export function useLibraryData<T>(
  fetchFunction: (workspaceId: string) => Promise<T[]>,
  entityName: string // e.g., 'templates', 'tools'
) {
  const { currentWorkspace } = useWorkspace();
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!currentWorkspace) {
      // Set loading to false and clear data if there's no workspace
      setData([]);
      setIsLoading(false);
      return;
    };

    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFunction(currentWorkspace.id);
      setData(result);
    } catch (err) {
      setError(`Failed to load ${entityName}. Please try again later.`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace, fetchFunction, entityName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
