import type { DashboardStats } from '@/types';
import { getMergedStudents } from '@/services/student.service';
import { getAllGroups } from '@/services/group.service';
import { getConflicts } from '@/services/conflict.service';

/**
 * Every dashboard statistic is derived from a single pass over the current
 * roster and group list -- never duplicated loops through the dataset.
 */
export async function calculateDashboardStatistics(): Promise<DashboardStats> {
  const students = await getMergedStudents();
  const groups = await getAllGroups();
  const conflicts = await getConflicts();

  let studentsInGroups = 0;
  let studentsLooking = 0;
  let csStudents = 0;
  let aimlStudents = 0;
  let divisionAStudents = 0;
  let divisionBStudents = 0;

  for (const student of students) {
    if (student.status === 'GROUPED') studentsInGroups++;
    if (student.status === 'FREE') studentsLooking++;
    if (student.specialization === 'CS') csStudents++;
    if (student.specialization === 'AIML') aimlStudents++;
    if (student.division === 'A') divisionAStudents++;
    if (student.division === 'B') divisionBStudents++;
  }

  let confirmedMembers = 0;
  let unconfirmedMembers = 0;
  let pendingRequests = 0;
  let openSeats = 0;

  const groupSizes: number[] = [];

  for (const group of groups) {
    confirmedMembers += group.confirmedMembers;
    unconfirmedMembers += group.totalMembers - group.confirmedMembers;
    pendingRequests += group.requests.length;
    openSeats += group.seatsLeft;
    groupSizes.push(group.totalMembers);
  }

  const averageGroupSize =
    groupSizes.length > 0
      ? Math.round((groupSizes.reduce((sum, n) => sum + n, 0) / groupSizes.length) * 10) / 10
      : 0;
  const largestGroupSize = groupSizes.length > 0 ? Math.max(...groupSizes) : 0;
  const smallestGroupSize = groupSizes.length > 0 ? Math.min(...groupSizes) : 0;

  const recentGroups = [...groups]
    .filter((g) => g.createdAt)
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 5);

  return {
    totalStudents: students.length,
    totalGroups: groups.length,
    studentsInGroups,
    studentsLooking,
    confirmedMembers,
    unconfirmedMembers,
    pendingRequests,
    openSeats,
    conflictCount: conflicts.length,
    csStudents,
    aimlStudents,
    divisionAStudents,
    divisionBStudents,
    averageGroupSize,
    largestGroupSize,
    smallestGroupSize,
    recentGroups,
  };
}
