import { useCallback, useEffect, useState } from 'react';

import { getAllGroups, getGroup } from '@/services/group.service';
import type { Group } from '@/types';

/**
 * Every derived group in the app (demo + locally created), sorted by group
 * number. Call `refresh()` after any mutation (create group, confirm,
 * request, notes) to re-derive the merged state instantly.
 */
export function useGroups(): { groups: Group[]; isLoading: boolean; refresh: () => void } {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setGroups(getAllGroups());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { groups, isLoading, refresh };
}

/** A single derived group, looked up by group number. */
export function useGroup(groupNumber: string | null | undefined): {
  group: Group | undefined;
  refresh: () => void;
} {
  const [group, setGroup] = useState<Group | undefined>(undefined);

  const refresh = useCallback(() => {
    setGroup(groupNumber ? getGroup(groupNumber) : undefined);
  }, [groupNumber]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { group, refresh };
}
