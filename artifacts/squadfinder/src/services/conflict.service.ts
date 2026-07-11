import type { ConflictRecord, Group } from '@/types';
import { detectConflicts } from '@/utils/conflicts';
import { getAllGroups } from '@/services/group.service';

/** Every conflict currently visible across the whole application. */
export function getConflicts(): ConflictRecord[] {
  return detectConflicts(getAllGroups());
}

export function getConflictsForGroup(group: Group, conflicts: ConflictRecord[]): ConflictRecord[] {
  const enrollments = new Set(group.members.map((m) => m.enrollment));
  return conflicts.filter((c) => enrollments.has(c.enrollment));
}
