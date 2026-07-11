import { useCallback } from 'react';

import {
  confirmMembership,
  createGroup,
  findCrossGroupDuplicates,
  requestToJoin,
  revokeRequest,
  updateGroupNotes,
  validateCreateGroupInput,
  validateRequestToJoin,
} from '@/services/group.service';
import type { CreateGroupInput, Group, RequestToJoinInput, ValidationResult } from '@/types';

/**
 * Every mutation that touches a group (create, join request, confirmation,
 * notes) lives behind this hook. Callers should call the returned `refresh`
 * callbacks from `useGroups`/`useGroup`/`useStatistics`/`useConflicts` after
 * any of these succeed so the whole UI stays in sync -- no page refresh ever
 * needed.
 */
export function useGroupActions() {
  const validateCreate = useCallback((input: CreateGroupInput): ValidationResult => {
    return validateCreateGroupInput(input);
  }, []);

  const checkCrossGroupDuplicates = useCallback((input: CreateGroupInput): string[] => {
    return findCrossGroupDuplicates(input.members);
  }, []);

  const submitCreateGroup = useCallback((input: CreateGroupInput): Group => {
    return createGroup(input);
  }, []);

  const validateJoin = useCallback(
    (group: Group, input: RequestToJoinInput): ValidationResult => {
      return validateRequestToJoin(group, input);
    },
    [],
  );

  const checkJoinDuplicate = useCallback((enrollment: string): boolean => {
    return findCrossGroupDuplicates([{ enrollment }]).length > 0;
  }, []);

  const submitRequestToJoin = useCallback(
    (groupNumber: string, input: RequestToJoinInput) => {
      return requestToJoin(groupNumber, input);
    },
    [],
  );

  const confirm = useCallback((groupNumber: string, enrollment: string) => {
    confirmMembership(groupNumber, enrollment);
  }, []);

  const saveNotes = useCallback((groupNumber: string, notes: string) => {
    updateGroupNotes(groupNumber, notes);
  }, []);

  const revoke = useCallback((groupNumber: string, requestId: string) => {
    revokeRequest(groupNumber, requestId);
  }, []);


  return {
    validateCreate,
    checkCrossGroupDuplicates,
    submitCreateGroup,
    validateJoin,
    checkJoinDuplicate,
    submitRequestToJoin,
    confirm,
    saveNotes,
    revoke,
  };
}
