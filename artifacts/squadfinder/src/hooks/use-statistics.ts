import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateDashboardStatistics } from '@/services/statistics.service';
import type { DashboardStats } from '@/types';

/** Dashboard aggregates, derived fresh from the current roster and groups via Supabase. */
export function useStatistics(): {
  stats: DashboardStats | undefined;
  isLoading: boolean;
  refresh: () => Promise<void>;
} {
  const [stats, setStats] = useState<DashboardStats | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const data = await calculateDashboardStatistics();
    setStats(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();

    // Listen to changes on relevant tables to trigger a refresh
    const channelId = `public-statistics-${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  return { stats, isLoading, refresh };
}
