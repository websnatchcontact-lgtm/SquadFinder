import { MAX_GROUP_MEMBERS } from '@/constants';
import type { DivisionCode, SpecializationCode, Student } from '@/types';

/** Groups students by their `group` field, ignoring students with no group. */
export function groupStudents(students: Student[]): Record<string, Student[]> {
  const groups: Record<string, Student[]> = {};

  for (const student of students) {
    if (!student.group) continue;
    if (!groups[student.group]) groups[student.group] = [];
    groups[student.group].push(student);
  }

  return groups;
}

/** Counts students per specialization code. */
export function countBySpecialization(
  students: Student[],
): Partial<Record<SpecializationCode, number>> {
  const counts: Partial<Record<SpecializationCode, number>> = {};
  for (const student of students) {
    counts[student.specialization] = (counts[student.specialization] ?? 0) + 1;
  }
  return counts;
}

/** Counts students per division. */
export function countByDivision(students: Student[]): Partial<Record<DivisionCode, number>> {
  const counts: Partial<Record<DivisionCode, number>> = {};
  for (const student of students) {
    counts[student.division] = (counts[student.division] ?? 0) + 1;
  }
  return counts;
}

/** Remaining open seats for a group of the given size, floored at 0. */
export function calculateSeats(memberCount: number): number {
  return Math.max(0, MAX_GROUP_MEMBERS - memberCount);
}

/** Generates initials (up to 2 letters) from a full name, for avatar fallbacks. */
export function generateInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

/** Human-readable label for a status value. */
export function formatStatus(status: Student['status']): string {
  switch (status) {
    case 'GROUPED':
      return 'Grouped';
    case 'FREE':
      return 'Looking For A Group';
    default:
      return status;
  }
}

/**
 * Case-insensitive, whitespace-insensitive search across enrollment number and
 * name, matching on partial substrings anywhere in either field.
 */
export function searchStudents(students: Student[], rawQuery: string): Student[] {
  const query = rawQuery.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!query) return [];

  const compactQuery = query.replace(/\s+/g, '');

  return students.filter((s) => {
    const name = s.name.toLowerCase();
    const enrollment = s.enrollment.toLowerCase();
    return name.includes(query) || enrollment.includes(compactQuery);
  });
}

/** Sorts students alphabetically by name. */
export function sortStudents(students: Student[]): Student[] {
  return [...students].sort((a, b) => a.name.localeCompare(b.name));
}
