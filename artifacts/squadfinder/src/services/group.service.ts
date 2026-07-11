import type {
  CreateGroupInput,
  Group,
  GroupMember,
  JoinRequest,
  RequestToJoinInput,
  Student,
  ValidationResult,
} from '@/types';
import { MAX_GROUP_MEMBERS, MIN_GROUP_MEMBERS } from '@/constants';
import { loadBaselineStudents } from '@/services/student.service';
import {
  getConfirmations,
  getCreatedGroups,
  getNotes,
  getRequests,
  setConfirmations,
  setCreatedGroups,
  setNotes,
  setRequests,
  type StoredCreatedGroup,
} from '@/services/storage.service';
import { calculateGroupHealth, calculateGroupSeats, generateGroupNumber } from '@/utils/groups';
import { countGroupConflicts, detectConflicts } from '@/utils/conflicts';
import { normalizeEnrollment, validateEnrollment, validateName } from '@/utils/validation';

const DEMO_CREATED_BY = 'GLS Capstone Registry';
const DEMO_CREATED_AT = '2026-01-15T09:00:00.000Z';

/** Demo groups considered fully confirmed but left with one pending member, for variety. */
const DEMO_PENDING_GROUPS = new Set(['Group 3', 'Group 9']);

function buildDemoGroups(students: Student[]): StoredCreatedGroup[] {
  const byGroup = new Map<string, Student[]>();
  for (const student of students) {
    if (!student.group) continue;
    if (!byGroup.has(student.group)) byGroup.set(student.group, []);
    byGroup.get(student.group)!.push(student);
  }

  const groups: StoredCreatedGroup[] = [];
  for (const [groupNumber, members] of byGroup) {
    const pendingLast = DEMO_PENDING_GROUPS.has(groupNumber);
    groups.push({
      groupNumber,
      specialization: members[0]!.specialization,
      createdBy: DEMO_CREATED_BY,
      createdAt: DEMO_CREATED_AT,
      members: members.map((m, index) => ({
        enrollment: m.enrollment,
        name: m.name,
        division: m.division,
        specialization: m.specialization,
        isCreator: index === 0,
        confirmed: pendingLast && index === members.length - 1 ? false : true,
      })),
    });
  }

  return groups.sort((a, b) => a.groupNumber.localeCompare(b.groupNumber, undefined, { numeric: true }));
}

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

/** Every group in the app: demo groups plus locally-created groups, fully merged. */
export function getAllGroups(): Group[] {
  const students = loadBaselineStudents();
  const demoStored = buildDemoGroups(students);
  const localStored = getCreatedGroups();

  const confirmations = getConfirmations();
  const requestsMap = getRequests();
  const notesMap = getNotes();

  const groups = [
    ...demoStored.map((g) => toDerivedGroup(g, 'demo', confirmations, requestsMap, notesMap)),
    ...localStored.map((g) => toDerivedGroup(g, 'local', confirmations, requestsMap, notesMap)),
  ];

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
  for (const member of input.members) {
    const memberNameCheck = validateName(member.name);
    if (!memberNameCheck.valid) return memberNameCheck;

    const enrollmentCheck = validateEnrollment(member.enrollment);
    if (!enrollmentCheck.valid) return enrollmentCheck;

    const normalized = normalizeEnrollment(member.enrollment);
    if (seenEnrollments.has(normalized)) {
      return { valid: false, message: 'This student has already been added to this group.' };
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
  const demoGroupNumbers = buildDemoGroups(loadBaselineStudents()).map((g) => g.groupNumber);
  const groupNumber = generateGroupNumber([...demoGroupNumbers, ...existing.map((g) => g.groupNumber)]);
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
