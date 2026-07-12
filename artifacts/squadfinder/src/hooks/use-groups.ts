import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getAllGroups, getGroup } from '@/services/group.service';
import type { Group } from '@/types';

/**
 * Every derived group in the app, synced from Supabase.
 */
export function useGroups(): { groups: Group[]; isLoading: boolean; refresh: () => Promise<void> } {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const data = await getAllGroups();
    setGroups(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();

    // Listen to changes on relevant tables to trigger a refresh
    const channelId = `public-groups-all-${Math.random().toString(36).substring(7)}`;
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

  return { groups, isLoading, refresh };
}

/** A single derived group, looked up by group number. */
export function useGroup(groupNumber: number | null | undefined): {
  group: Group | undefined;
  isLoading: boolean;
  refresh: () => Promise<void>;
} {
  const [group, setGroup] = useState<Group | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!groupNumber) {
      setGroup(undefined);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const data = await getGroup(groupNumber);
    setGroup(data);
    setIsLoading(false);
  }, [groupNumber]);

  useEffect(() => {
    refresh();
    
    if (!groupNumber) return;

    // Listen for real-time updates
    const channelId = `public-group-${groupNumber}-${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupNumber, refresh]);

  return { group, isLoading, refresh };
}
