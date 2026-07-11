import type {
  CreateGroupInput,
  Group,
  GroupMember,
  JoinRequest,
  RequestToJoinInput,
  Student,
  ValidationResult,
} from '@/types';
import { MAX_GROUP_MEMBERS, MIN_GROUP_MEMBERS, SPECIALIZATIONS } from '@/constants';

import {
  getConfirmations,
  getCreatedGroups,
  getNotes,
  getRequests,
  setConfirmations,
  setCreatedGroups,
  setNotes,
  setRequests,
  getLookingForGroup,
  type StoredCreatedGroup,
} from '@/services/storage.service';
import { calculateGroupHealth, calculateGroupSeats, generateGroupNumber } from '@/utils/groups';
import { countGroupConflicts, detectConflicts } from '@/utils/conflicts';
import { normalizeEnrollment, validateEnrollment, validateName } from '@/utils/validation';



function toDerivedGroup(
  stored: StoredCreatedGroup,
  source: 'demo' | 'local',
  confirmations: Record<string, Record<string, boolean>>,
  requestsMap: Record<string, JoinRequest[]>,
  notesMap: Record<string, string>,
): Group {
  const overrides = confirmations[stored.groupNumber] ?? {};
  const members: GroupMember[] = stored.members.map((m) => ({
    ...m,
    confirmed: overrides[m.enrollment] ?? m.confirmed,
  }));

  const confirmedMembers = members.filter((m) => m.confirmed).length;
  const requests = requestsMap[stored.groupNumber] ?? [];
  const notes = notesMap[stored.groupNumber] ?? '';

  const divisionCounts: Group['divisionCounts'] = {};
  for (const member of members) {
    divisionCounts[member.division] = (divisionCounts[member.division] ?? 0) + 1;
  }

  return {
    groupNumber: stored.groupNumber,
    source,
    specialization: stored.specialization,
    createdBy: stored.createdBy,
    createdAt: stored.createdAt,
    members,
    notes,
    requests,
    totalMembers: members.length,
    confirmedMembers,
    seatsLeft: calculateGroupSeats(members.length),
    isFull: calculateGroupSeats(members.length) === 0,
    conflictCount: 0, // filled in by getAllGroups() once every group is known
    health: calculateGroupHealth(confirmedMembers, members.length, 0),
    divisionCounts,
  };
}

export function getAllGroups(): Group[] {
  const localStored = getCreatedGroups();

  const confirmations = getConfirmations();
  const requestsMap = getRequests();
  const notesMap = getNotes();

  const groups = localStored.map((g) => toDerivedGroup(g, 'local', confirmations, requestsMap, notesMap));

  const conflicts = detectConflicts(groups);
  for (const group of groups) {
    const conflictCount = countGroupConflicts(group, conflicts);
    group.conflictCount = conflictCount;
    group.health = calculateGroupHealth(group.confirmedMembers, group.totalMembers, conflictCount);
  }

  return groups.sort((a, b) =>
    a.groupNumber.localeCompare(b.groupNumber, undefined, { numeric: true }),
  );
}

export function getGroup(groupNumber: string): Group | undefined {
  return getAllGroups().find((g) => g.groupNumber === groupNumber);
}

/** Validates a full Create Group submission against every business rule. */
export function validateCreateGroupInput(input: CreateGroupInput): ValidationResult {
  const nameCheck = validateName(input.creatorName);
  if (!nameCheck.valid) return nameCheck;

  if (input.members.length < MIN_GROUP_MEMBERS) {
    return {
      valid: false,
      message: `A group needs at least ${MIN_GROUP_MEMBERS} members.`,
    };
  }
  if (input.members.length > MAX_GROUP_MEMBERS) {
    return {
      valid: false,
      message: `A group can have at most ${MAX_GROUP_MEMBERS} members.`,
    };
  }

  const seenEnrollments = new Set<string>();
  const availableStudents = getLookingForGroup();
  
  for (const member of input.members) {
    const memberNameCheck = validateName(member.name);
    if (!memberNameCheck.valid) return memberNameCheck;

    const enrollmentCheck = validateEnrollment(member.enrollment);
    if (!enrollmentCheck.valid) return enrollmentCheck;

    const normalized = normalizeEnrollment(member.enrollment);
    if (seenEnrollments.has(normalized)) {
      return { valid: false, message: 'This student has already been added to this group.' };
    }
    
    if (availableStudents.some(s => s.enrollment === normalized)) {
      return { 
        valid: false, 
        message: `This student is currently registered as Looking for a Team. Please remove them from the Available Students list before adding them to a group.`
      };
    }
    
    seenEnrollments.add(normalized);
  }

  const specializations = new Set(input.members.map((m) => m.specialization));
  if (specializations.size > 1) {
    return {
      valid: false,
      message:
        'This group contains students from different specializations. According to Capstone grouping rules, students from different specializations cannot form the same team.',
    };
  }

  return { valid: true };
}

/** Enrollment numbers in `members` that already belong to another registered group. */
export function findCrossGroupDuplicates(members: { enrollment: string }[]): string[] {
  const existingGroups = getAllGroups();
  const existingEnrollments = new Set(
    existingGroups.flatMap((g) => g.members.map((m) => m.enrollment)),
  );
  return members
    .map((m) => normalizeEnrollment(m.enrollment))
    .filter((enrollment) => existingEnrollments.has(enrollment));
}

/** Creates a new group and persists it to Local Storage. Never touches students.json. */
export function createGroup(input: CreateGroupInput): Group {
  const existing = getCreatedGroups();
  const groupNumber = generateGroupNumber([...existing.map((g) => g.groupNumber)]);
  const createdAt = new Date().toISOString();
  const specialization = input.members[0]!.specialization;

  const stored: StoredCreatedGroup = {
    groupNumber,
    specialization,
    createdBy: input.creatorName.trim(),
    createdAt,
    members: input.members.map((m, index) => ({
      enrollment: normalizeEnrollment(m.enrollment),
      name: m.name.trim(),
      division: m.division,
      specialization: m.specialization,
      isCreator: index === 0,
      confirmed: index === 0,
    })),
  };

  setCreatedGroups([...existing, stored]);

  return getGroup(groupNumber)!;
}

export function validateRequestToJoin(
  group: Group,
  input: RequestToJoinInput,
): ValidationResult {
  if (group.isFull) {
    return { valid: false, message: 'This group is already full.' };
  }

  const nameCheck = validateName(input.name);
  if (!nameCheck.valid) return nameCheck;

  const enrollmentCheck = validateEnrollment(input.enrollment);
  if (!enrollmentCheck.valid) return enrollmentCheck;

  if (input.specialization !== group.specialization) {
    const groupLabel = SPECIALIZATIONS[group.specialization].label;
    const studentLabel = SPECIALIZATIONS[input.specialization].label;
    return {
      valid: false,
      message: `You cannot request to join this group because it belongs to the ${groupLabel} specialization while your specialization is ${studentLabel}. Capstone groups can only contain students from the same specialization.`,
    };
  }

  const normalized = normalizeEnrollment(input.enrollment);
  if (group.members.some((m) => m.enrollment === normalized)) {
    return { valid: false, message: 'This student has already been added to this group.' };
  }

  return { valid: true };
}

export function requestToJoin(groupNumber: string, input: RequestToJoinInput): JoinRequest {
  const requestsMap = getRequests();
  const request: JoinRequest = {
    id: `${groupNumber}-${normalizeEnrollment(input.enrollment)}-${Date.now()}`,
    groupNumber,
    name: input.name.trim(),
    enrollment: normalizeEnrollment(input.enrollment),
    division: input.division,
    specialization: input.specialization,
    note: input.note?.trim() || undefined,
    requestedAt: new Date().toISOString(),
    status: 'PENDING',
    pin: input.pin,
  };

  requestsMap[groupNumber] = [...(requestsMap[groupNumber] ?? []), request];
  setRequests(requestsMap);

  return request;
}

/** Marks a student as confirmed within a group. Persists instantly, no page refresh needed. */
export function confirmMembership(groupNumber: string, enrollment: string): void {
  const confirmations = getConfirmations();
  const normalized = normalizeEnrollment(enrollment);
  confirmations[groupNumber] = { ...(confirmations[groupNumber] ?? {}), [normalized]: true };
  setConfirmations(confirmations);
}

export function updateGroupNotes(groupNumber: string, notes: string): void {
  const notesMap = getNotes();
  notesMap[groupNumber] = notes;
  setNotes(notesMap);
}

/** Withdraws a pending join request. Removes it from Local Storage entirely -- never soft-deleted. */
export function revokeRequest(groupNumber: string, requestId: string): void {
  const requestsMap = getRequests();
  const existing = requestsMap[groupNumber] ?? [];
  requestsMap[groupNumber] = existing.filter((r) => r.id !== requestId);
  setRequests(requestsMap);
}
