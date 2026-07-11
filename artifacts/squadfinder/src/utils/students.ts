import { MAX_GROUP_MEMBERS } from '@/constants';
import type { Group, SpecializationCode, Student } from '@/types';

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
export function countBranches(students: Student[]): Partial<Record<SpecializationCode, number>> {
  const counts: Partial<Record<SpecializationCode, number>> = {};

  for (const student of students) {
    counts[student.specialization] = (counts[student.specialization] ?? 0) + 1;
  }

  return counts;
}

/** Remaining open seats for a group of the given size, floored at 0. */
export function calculateSeats(memberCount: number): number {
  return Math.max(0, MAX_GROUP_MEMBERS - memberCount);
}

/** Builds the full derived Group model for a single group number. */
export function buildGroup(groupNumber: string, members: Student[]): Group {
  const seatsLeft = calculateSeats(members.length);
  const isMismatched = members.some((m) => m.status === 'MISMATCH');

  return {
    groupNumber,
    members,
    totalMembers: members.length,
    seatsLeft,
    isFull: seatsLeft === 0,
    isMismatched,
    specializationCounts: countBranches(members),
  };
}

/** Builds derived Group models for every group present in the student list. */
export function buildAllGroups(students: Student[]): Group[] {
  const grouped = groupStudents(students);
  return Object.entries(grouped)
    .map(([groupNumber, members]) => buildGroup(groupNumber, members))
    .sort((a, b) => a.groupNumber.localeCompare(b.groupNumber));
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
    case 'MISMATCH':
      return 'Mismatch';
    default:
      return status;
  }
}

/** Case-insensitive, whitespace-trimmed search across enrollment number and name. */
export function searchStudents(students: Student[], rawQuery: string): Student[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  return students.filter(
    (s) =>
      s.enrollment.toLowerCase().includes(query) || s.name.toLowerCase().includes(query),
  );
}

/** Sorts groups by group number ascending. */
export function sortGroups(groups: Group[]): Group[] {
  return [...groups].sort((a, b) => a.groupNumber.localeCompare(b.groupNumber));
}

/** Sorts students alphabetically by name. */
export function sortStudents(students: Student[]): Student[] {
  return [...students].sort((a, b) => a.name.localeCompare(b.name));
}
