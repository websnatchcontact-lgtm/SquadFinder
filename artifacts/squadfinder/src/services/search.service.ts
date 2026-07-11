import type { Student } from '@/types';
import { searchStudents as searchStudentsUtil } from '@/utils/students';

/** Full-text search across enrollment number and name (partial, case/whitespace insensitive). */
export function searchStudents(students: Student[], query: string): Student[] {
  return searchStudentsUtil(students, query);
}

/** Returns the [start, end) index of the first case-insensitive match of `query` in `text`. */
export function findHighlightRange(text: string, query: string): [number, number] | null {
  const cleanedQuery = query.trim();
  if (!cleanedQuery) return null;
  const index = text.toLowerCase().indexOf(cleanedQuery.toLowerCase());
  if (index === -1) return null;
  return [index, index + cleanedQuery.length];
}
