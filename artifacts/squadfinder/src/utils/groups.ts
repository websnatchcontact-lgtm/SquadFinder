import { MAX_GROUP_MEMBERS } from '@/constants';
import type { Group, GroupFilters, GroupSortKey } from '@/types';

/** Computes the next sequential group number given every existing group number. */
export function generateGroupNumber(existingGroupNumbers: number[]): number {
  if (existingGroupNumbers.length === 0) return 1;
  return Math.max(...existingGroupNumbers) + 1;
}

/** A group is healthy when it has no conflicts and every member has confirmed. */
export function calculateGroupHealth(
  confirmedMembers: number,
  totalMembers: number,
  conflictCount: number,
): Group['health'] {
  if (conflictCount > 0) return 'conflict';
  if (confirmedMembers < totalMembers) return 'pending';
  return 'healthy';
}

export function calculateGroupSeats(memberCount: number): number {
  return Math.max(0, MAX_GROUP_MEMBERS - memberCount);
}

export function filterGroups(groups: Group[], filters: GroupFilters): Group[] {
  return groups.filter((group) => {
    if (filters.division && group.divisionCounts[filters.division] === undefined) return false;
    if (filters.specialization && group.specialization !== filters.specialization) return false;
    if (filters.health && group.health !== filters.health) return false;
    if (filters.hasOpenSeats && group.seatsLeft === 0) return false;
    if (filters.isFull && !group.isFull) return false;
    return true;
  });
}

export function sortGroups(groups: Group[], key: GroupSortKey = 'alphabetical'): Group[] {
  const list = [...groups];
  
  switch (key) {
    case 'newest':
      return list.sort((a, b) => b.groupNumber - a.groupNumber);
    case 'oldest':
      return list.sort((a, b) => a.groupNumber - b.groupNumber);
    case 'mostMembers':
      return list.sort((a, b) => b.totalMembers - a.totalMembers);
    case 'leastMembers':
      return list.sort((a, b) => a.totalMembers - b.totalMembers);
    case 'mostConfirmed':
      return list.sort((a, b) => b.confirmedMembers - a.confirmedMembers);
    case 'leastConfirmed':
      return list.sort((a, b) => a.confirmedMembers - b.confirmedMembers);
    case 'mostRequests':
      return list.sort((a, b) => b.requests.length - a.requests.length);
    case 'mostConflicts':
      return list.sort((a, b) => b.conflictCount - a.conflictCount);
    case 'alphabetical':
    default:
      return list.sort((a, b) => a.groupNumber - b.groupNumber);
  }
}
