import { useMemo } from 'react';
import { useGroups } from './use-groups';
import type { JoinRequest } from '@/types';

export function useAllRequests(): { requests: JoinRequest[]; isLoading: boolean } {
  const { groups, isLoading } = useGroups();

  const requests = useMemo(() => {
    if (!groups) return [];
    
    return groups
      .flatMap(g => g.requests)
      .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }, [groups]);

  return { requests, isLoading };
}
