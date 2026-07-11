import { useCallback, useEffect, useState } from 'react';

import { getConflicts } from '@/services/conflict.service';
import type { ConflictRecord } from '@/types';

/** Every conflict currently visible across the app (Conflict Center data source). */
export function useConflicts(): {
  conflicts: ConflictRecord[];
  isLoading: boolean;
  refresh: () => void;
} {
  const [conflicts, setConflicts] = useState<ConflictRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setConflicts(getConflicts());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { conflicts, isLoading, refresh };
}
