import { useEffect, useState } from 'react';

import { getAllGroups, getDashboardStatistics } from '@/services/student.service';
import type { DashboardStats, Group } from '@/types';

/** Dashboard aggregates, derived fresh from the current roster. */
export function useStatistics(): { stats: DashboardStats | undefined; isLoading: boolean } {
  const [stats, setStats] = useState<DashboardStats | undefined>(undefined);

  useEffect(() => {
    setStats(getDashboardStatistics());
  }, []);

  return { stats, isLoading: stats === undefined };
}

/** Every derived group in the roster, sorted by group number. */
export function useGroups(): { groups: Group[]; isLoading: boolean } {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setGroups(getAllGroups());
    setIsLoading(false);
  }, []);

  return { groups, isLoading };
}
