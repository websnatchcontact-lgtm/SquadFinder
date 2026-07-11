import type { ConflictAppearance, ConflictRecord, Group } from '@/types';

/**
 * Detects every enrollment number that appears as a member of more than one
 * group. The app never decides who is "right" -- it only surfaces the
 * conflict for students to resolve themselves.
 */
export function detectConflicts(groups: Group[]): ConflictRecord[] {
  const byEnrollment = new Map<
    string,
    { name: string; specialization: ConflictRecord['specialization']; division: ConflictRecord['division']; appearsIn: ConflictAppearance[] }
  >();

  for (const group of groups) {
    for (const member of group.members) {
      const existing = byEnrollment.get(member.enrollment);
      const appearance: ConflictAppearance = {
        groupNumber: group.groupNumber,
        createdBy: group.createdBy,
        createdAt: group.createdAt,
      };

      if (existing) {
        existing.appearsIn.push(appearance);
      } else {
        byEnrollment.set(member.enrollment, {
          name: member.name,
          specialization: member.specialization,
          division: member.division,
          appearsIn: [appearance],
        });
      }
    }
  }

  const conflicts: ConflictRecord[] = [];
  for (const [enrollment, record] of byEnrollment) {
    if (record.appearsIn.length < 2) continue;
    conflicts.push({
      enrollment,
      name: record.name,
      specialization: record.specialization,
      division: record.division,
      severity: record.appearsIn.length > 2 ? 'multiple' : 'one',
      appearsIn: record.appearsIn,
    });
  }

  return conflicts;
}

/** Number of conflicted members that belong to a specific group. */
export function countGroupConflicts(group: Group, conflicts: ConflictRecord[]): number {
  const conflictedEnrollments = new Set(conflicts.map((c) => c.enrollment));
  return group.members.filter((m) => conflictedEnrollments.has(m.enrollment)).length;
}
