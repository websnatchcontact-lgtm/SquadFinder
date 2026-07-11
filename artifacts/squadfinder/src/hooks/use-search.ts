import { useEffect, useMemo, useState } from 'react';

import { useStudents } from '@/hooks/use-students';
import { searchStudents } from '@/services/search.service';
import type { Student } from '@/types';

/**
 * Live search-as-you-type across enrollment number and name, supporting
 * partial matches on either field. Debounced with a short delay so the UI
 * can show a "searching" state while results settle.
 */
export function useSearch(query: string, debounceMs = 150): { results: Student[]; isSearching: boolean } {
  const { students } = useStudents();
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

  const results: Student[] = useMemo(
    () => searchStudents(students, debouncedQuery),
    [students, debouncedQuery],
  );

  return { results, isSearching };
}
