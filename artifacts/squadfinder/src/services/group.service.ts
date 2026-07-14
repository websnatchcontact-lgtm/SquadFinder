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
import { normalizeEnrollment } from '@/utils/validation';
import { createGroupSchema } from '@/lib/validation/createGroup.schema';
import { requestToJoinSchema } from '@/lib/validation/requestToJoin.schema';
import { hashPin } from '@/utils/crypto';

export async function getAllGroups(): Promise<Group[]> {
  return fetchAllGroups();
}

export async function getGroup(groupNumber: number): Promise<Group | undefined> {
  const allGroups = await fetchAllGroups();
  return allGroups.find((g) => g.groupNumber === groupNumber);
}

/** Validates a full Create Group submission against every business rule. */
export async function validateCreateGroupInput(input: CreateGroupInput): Promise<ValidationResult> {
  const parsed = createGroupSchema.safeParse(input);
  if (!parsed.success) {
    return { valid: false, message: parsed.error.errors[0].message };
  }

  // Use sanitized input for further business checks
  const validatedInput = parsed.data;

  const seenEnrollments = new Set<string>();
  const availableStudents = await fetchAvailableStudents();
  
  const allGroups = await fetchAllGroups();
  
  // BUSINESS RULE: A student can create ONLY ONE group.
  const creatorEnrollment = normalizeEnrollment(validatedInput.members[0].enrollment);
  const hasCreatedGroup = allGroups.some((g) => g.creatorEnrollment === creatorEnrollment);

  if (hasCreatedGroup) {
    return {
      valid: false,
      message: 'You have already created a group. A student can create only one group.',
    };
  }

  const existingEnrollments = new Set(
    allGroups.flatMap((g) => g.members.map((m) => m.enrollment)),
  );
  
  for (let index = 0; index < validatedInput.members.length; index++) {
    const member = validatedInput.members[index];

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

  const specializations = new Set(validatedInput.members.map((m) => m.specialization));
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
  const creatorEnrollment = normalizeEnrollment(input.members[0].enrollment);
  
  const membersPayload = input.members.map((m, index) => ({
    name: m.name.trim(),
    enrollment: normalizeEnrollment(m.enrollment),
    division: m.division,
    specialization: m.specialization,
    confirmed: index === 0, // creator is automatically confirmed
  }));

  const { data, error } = await supabase.rpc('create_group_atomic', {
    p_creator_name: creatorName,
    p_creator_enrollment: creatorEnrollment,
    p_members: membersPayload
  });

  if (error) {
    console.error('Failed to create group:', error.message || error);
    if (error.message.includes('create only one group')) {
      throw new Error('You have already created a group. A student can create only one group.');
    }
    throw new Error(`Failed to create group: ${error.message}`);
  }

  const newGroup = await getGroup(data.group_number);
  if (!newGroup) throw new Error("Could not retrieve newly created group.");
  return newGroup;
}

export function validateRequestToJoin(
  group: Group,
  input: RequestToJoinInput,
): ValidationResult {
  const parsed = requestToJoinSchema.safeParse(input);
  if (!parsed.success) {
    return { valid: false, message: parsed.error.errors[0].message };
  }
  
  const validatedInput = parsed.data;

  if (group.isFull) {
    return { valid: false, message: 'This group is already full.' };
  }

  if (validatedInput.specialization !== group.specialization) {
    const groupLabel = SPECIALIZATIONS[group.specialization].label;
    const studentLabel = SPECIALIZATIONS[validatedInput.specialization].label;
    return {
      valid: false,
      message: `You cannot request to join this group because it belongs to the ${groupLabel} specialization while your specialization is ${studentLabel}. Capstone groups can only contain students from the same specialization.`,
    };
  }

  const normalized = normalizeEnrollment(validatedInput.enrollment);
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
    console.error('Failed to upsert student:', upsertError.message || upsertError);
    throw new Error(`Failed to save student ${normalizedEnrollment}: ${upsertError.message}`);
  }

  const { data: requestData, error } = await supabase.from('join_requests').insert({
    group_id: groupData.id,
    enrollment: normalizedEnrollment,
    status: 'PENDING',
    note: input.note?.trim() || null,
    safety_pin: await hashPin(input.pin),
  }).select('id, created_at').single();

  if (error) {
    console.error("Failed to submit request", error.message || error);
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

export async function revokeRequest(groupNumber: number, requestId: string, pin: string): Promise<void> {
  const hashedPin = await hashPin(pin);
  const { data, error } = await supabase.from('join_requests')
    .delete()
    .eq('id', requestId)
    .or(`safety_pin.eq.${pin},safety_pin.eq.${hashedPin}`)
    .select('id');

  if (error || !data || data.length === 0) {
    throw new Error('Invalid Safety PIN or request not found.');
  }
}
