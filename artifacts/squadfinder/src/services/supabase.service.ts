import { supabase } from '@/lib/supabase';
import type { Group, GroupMember, JoinRequest, Student, DivisionCode, SpecializationCode } from '@/types';
import { calculateGroupHealth, calculateGroupSeats } from '@/utils/groups';
import { detectConflicts, countGroupConflicts } from '@/utils/conflicts';

export async function fetchAllGroups(): Promise<Group[]> {
  const { data, error } = await supabase.from('groups').select(`
    id, group_number, created_at, notes, creator_name,
    group_members (
      id, enrollment, confirmed, created_at,
      students ( full_name, division, specialization )
    ),
    join_requests (
      id, enrollment, status, note, created_at,
      students ( full_name, division, specialization )
    )
  `);

  if (error || !data) {
    console.error('Error fetching groups from Supabase:', error?.message || error);
    return [];
  }

  const groups: Group[] = data.map((g: any) => {
    // Sort members so the first added (creator) is first
    const rawMembers = g.group_members.sort((a: any, b: any) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const members: GroupMember[] = rawMembers.map((m: any, index: number) => ({
      enrollment: m.enrollment,
      name: m.students?.full_name || 'Unknown',
      division: (m.students?.division as DivisionCode) || 'A',
      specialization: (m.students?.specialization as SpecializationCode) || 'CS',
      confirmed: m.confirmed,
      isCreator: index === 0, // Assume first member is the creator
    }));

    const requests: JoinRequest[] = g.join_requests
      .filter((r: any) => r.status === 'PENDING')
      .map((r: any) => ({
        id: r.id.toString(), // The DB id is int8, so cast to string
        groupNumber: g.group_number,
        name: r.students?.full_name || 'Unknown',
        enrollment: r.enrollment,
        division: (r.students?.division as DivisionCode) || 'A',
        specialization: (r.students?.specialization as SpecializationCode) || 'CS',
        note: r.note,
        requestedAt: r.created_at,
        status: r.status,
      }));

    const confirmedMembers = members.filter((m) => m.confirmed).length;

    const divisionCounts: Group['divisionCounts'] = {};
    for (const member of members) {
      divisionCounts[member.division] = (divisionCounts[member.division] ?? 0) + 1;
    }

    return {
      groupNumber: g.group_number,
      source: 'local',
      specialization: members.length > 0 ? members[0].specialization : 'CS',
      createdBy: g.creator_name,
      createdAt: g.created_at,
      members,
      notes: g.notes || '',
      requests,
      totalMembers: members.length,
      confirmedMembers,
      seatsLeft: calculateGroupSeats(members.length),
      isFull: calculateGroupSeats(members.length) === 0,
      conflictCount: 0,
      health: calculateGroupHealth(confirmedMembers, members.length, 0),
      divisionCounts,
    };
  });

  const conflicts = detectConflicts(groups);
  for (const group of groups) {
    const conflictCount = countGroupConflicts(group, conflicts);
    group.conflictCount = conflictCount;
    group.health = calculateGroupHealth(group.confirmedMembers, group.totalMembers, conflictCount);
  }

  return groups.sort((a, b) => a.groupNumber - b.groupNumber);
}

export async function fetchAvailableStudents(): Promise<Student[]> {
  const { data, error } = await supabase.from('available_students').select(`
    id, enrollment, note, created_at,
    students ( full_name, division, specialization )
  `);

  if (error || !data) {
    console.error('Error fetching available students:', error?.message || error);
    return [];
  }

  return data.map((row: any) => ({
    enrollment: row.enrollment,
    name: row.students?.full_name || 'Unknown',
    specialization: (row.students?.specialization as SpecializationCode) || 'CS',
    division: (row.students?.division as DivisionCode) || 'A',
    group: null,
    status: 'FREE',
    addedAt: row.created_at,
  }));
}
