import { useEffect, useMemo, useState } from 'react';

import { searchStudentsByQuery } from '@/services/student.service';
import type { Student } from '@/types';

/**
 * Live search-as-you-type across enrollment number and name. Debounced with a
 * short delay so the UI can show a loading/skeleton state while "searching".
 */
export function useSearch(query: string, debounceMs = 150): { results: Student[]; isSearching: boolean } {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (query.trim() === debouncedQuery.trim()) return;
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, debounceMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, debounceMs]);

  const results = useMemo(() => searchStudentsByQuery(debouncedQuery), [debouncedQuery]);

  return { results, isSearching };
}
