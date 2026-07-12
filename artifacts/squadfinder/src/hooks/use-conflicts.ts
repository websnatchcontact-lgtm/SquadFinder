import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getConflicts } from '@/services/conflict.service';
import type { ConflictRecord } from '@/types';

/** Every conflict currently visible across the app (Conflict Center data source). */
export function useConflicts(): {
  conflicts: ConflictRecord[];
  isLoading: boolean;
  refresh: () => Promise<void>;
} {
  const [conflicts, setConflicts] = useState<ConflictRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const data = await getConflicts();
    setConflicts(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();

    const channelId = `public-conflicts-${Math.random().toString(36).substring(7)}`;
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

  return { conflicts, isLoading, refresh };
}
