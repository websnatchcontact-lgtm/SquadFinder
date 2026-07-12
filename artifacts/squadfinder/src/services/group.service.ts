import type {
  CreateGroupInput,
  Group,
  JoinRequest,
  RequestToJoinInput,
  ValidationResult,
} from '@/types';
import { MAX_GROUP_MEMBERS, MIN_GROUP_MEMBERS, SPECIALIZATIONS } from '@/constants';

import { supabase } from '@/lib/supabase';
import { fetchAllGroups, fetchAvailableStudents } from '@/services/supabase.service';
import { normalizeEnrollment, validateEnrollment, validateName } from '@/utils/validation';

export async function getAllGroups(): Promise<Group[]> {
  return fetchAllGroups();
}

export async function getGroup(groupNumber: number): Promise<Group | undefined> {
  const allGroups = await fetchAllGroups();
  return allGroups.find((g) => g.groupNumber === groupNumber);
}

/** Validates a full Create Group submission against every business rule. */
export async function validateCreateGroupInput(input: CreateGroupInput): Promise<ValidationResult> {
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
  const availableStudents = await fetchAvailableStudents();
  
  const allGroups = await fetchAllGroups();
  const existingEnrollments = new Set(
    allGroups.flatMap((g) => g.members.map((m) => m.enrollment)),
  );
  
  for (let index = 0; index < input.members.length; index++) {
    const member = input.members[index];
    const memberNameCheck = validateName(member.name);
    if (!memberNameCheck.valid) return memberNameCheck;

    const enrollmentCheck = validateEnrollment(member.enrollment);
    if (!enrollmentCheck.valid) return enrollmentCheck;

    const normalized = normalizeEnrollment(member.enrollment);
    
    if (existingEnrollments.has(normalized)) {
      if (index === 0) {
        return { valid: false, message: 'You already belong to an existing group. A student cannot create or belong to multiple groups.' };
      }
      // Non-creator duplicates are soft-blocked via UI warnings
    }
    
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
export async function findCrossGroupDuplicates(members: { enrollment: string }[]): Promise<string[]> {
  const existingGroups = await getAllGroups();
  const existingEnrollments = new Set(
    existingGroups.flatMap((g) => g.members.map((m) => m.enrollment)),
  );
  return members
    .map((m) => normalizeEnrollment(m.enrollment))
    .filter((enrollment) => existingEnrollments.has(enrollment));
}

/** Creates a new group and persists it to Supabase. */
export async function createGroup(input: CreateGroupInput): Promise<Group> {
  const creatorName = input.creatorName.trim();
  
  // 1. Insert Group
  const { data: groupData, error: groupError } = await supabase
    .from('groups')
    .insert({ creator_name: creatorName })
    .select('id, group_number')
    .single();

  if (groupError || !groupData) {
    console.error('Failed to create group:', groupError);
    throw new Error('Failed to create group.');
  }

  const groupId = groupData.id;
  const groupNumber = groupData.group_number;

  // 2. Upsert Students
  for (const member of input.members) {
    const normalizedEnrollment = normalizeEnrollment(member.enrollment);
    
    // Attempt upsert (only updates name, division, specialization)
    // Note: The prompt asks me to implement standard Supabase, so I'll just use standard upsert
    // This depends on Supabase constraints, assuming enrollment is UNIQUE.
    const { error: upsertError } = await supabase.from('students').upsert({
      enrollment: normalizedEnrollment,
      full_name: member.name.trim(),
      division: member.division,
      specialization: member.specialization,
    }, { onConflict: 'enrollment' });

    if (upsertError) {
      console.error('Failed to upsert student:', upsertError);
      throw new Error(`Failed to save student ${normalizedEnrollment}: ${upsertError.message}`);
    }
  }

  // 3. Insert Group Members
  const membersToInsert = input.members.map((m, index) => ({
    group_id: groupId,
    enrollment: normalizeEnrollment(m.enrollment),
    confirmed: index === 0, // creator is automatically confirmed
  }));

  const { error: membersError } = await supabase
    .from('group_members')
    .insert(membersToInsert);

  if (membersError) {
    console.error('Failed to add members:', membersError);
    throw new Error(`Failed to add group members: ${membersError.message}`);
  }

  const newGroup = await getGroup(groupNumber);
  if (!newGroup) throw new Error("Could not retrieve newly created group.");
  return newGroup;
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

export async function validateRequestToJoinStrict(
  group: Group,
  input: RequestToJoinInput,
): Promise<ValidationResult> {
  const syncResult = validateRequestToJoin(group, input);
  if (!syncResult.valid) return syncResult;

  const duplicates = await findCrossGroupDuplicates([{ enrollment: input.enrollment }]);
  if (duplicates.length > 0) {
    return { valid: false, message: 'You already belong to an existing group. A student cannot create or belong to multiple groups.' };
  }
  
  return { valid: true };
}

export async function requestToJoin(groupNumber: number, input: RequestToJoinInput): Promise<JoinRequest | null> {
  // First, find the group id
  const { data: groupData } = await supabase.from('groups').select('id').eq('group_number', groupNumber).single();
  if (!groupData) throw new Error("Group not found");
  
  const normalizedEnrollment = normalizeEnrollment(input.enrollment);
  
  // Upsert student just in case
  const { error: upsertError } = await supabase.from('students').upsert({
    enrollment: normalizedEnrollment,
    full_name: input.name.trim(),
    division: input.division,
    specialization: input.specialization,
  }, { onConflict: 'enrollment' });

  if (upsertError) {
    console.error('Failed to upsert student:', upsertError);
    throw new Error(`Failed to save student ${normalizedEnrollment}: ${upsertError.message}`);
  }

  const { data: requestData, error } = await supabase.from('join_requests').insert({
    group_id: groupData.id,
    enrollment: normalizedEnrollment,
    status: 'PENDING',
    note: input.note?.trim() || null,
    safety_pin: input.pin,
  }).select().single();

  if (error) {
    console.error("Failed to submit request", error);
    return null;
  }

  return {
    id: requestData.id.toString(),
    groupNumber,
    name: input.name.trim(),
    enrollment: normalizedEnrollment,
    division: input.division,
    specialization: input.specialization,
    note: input.note?.trim() || undefined,
    requestedAt: requestData.created_at,
    status: 'PENDING',
    pin: input.pin,
  };
}

export async function confirmMembership(groupNumber: number, enrollment: string): Promise<void> {
  const { data: groupData } = await supabase.from('groups').select('id').eq('group_number', groupNumber).single();
  if (!groupData) return;

  const normalizedEnrollment = normalizeEnrollment(enrollment);
  
  await supabase.from('group_members')
    .update({ confirmed: true })
    .eq('group_id', groupData.id)
    .eq('enrollment', normalizedEnrollment);
}

export async function updateGroupNotes(groupNumber: number, notes: string): Promise<void> {
  await supabase.from('groups')
    .update({ notes })
    .eq('group_number', groupNumber);
}

export async function revokeRequest(groupNumber: number, requestId: string): Promise<void> {
  await supabase.from('join_requests')
    .delete()
    .eq('id', requestId);
}
