import { useCallback, useEffect, useState } from 'react';

import { calculateDashboardStatistics } from '@/services/statistics.service';
import type { DashboardStats } from '@/types';

/** Dashboard aggregates, derived fresh from the current roster and groups. */
export function useStatistics(): {
  stats: DashboardStats | undefined;
  isLoading: boolean;
  refresh: () => void;
} {
  const [stats, setStats] = useState<DashboardStats | undefined>(undefined);

  const refresh = useCallback(() => {
    setStats(calculateDashboardStatistics());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, isLoading: stats === undefined, refresh };
}
