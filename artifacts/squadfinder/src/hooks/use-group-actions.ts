import { useCallback } from 'react';

import {
  confirmMembership,
  createGroup,
  findCrossGroupDuplicates,
  requestToJoin,
  revokeRequest,
  updateGroupNotes,
  validateCreateGroupInput,
  validateRequestToJoinStrict,
} from '@/services/group.service';
import type { CreateGroupInput, Group, RequestToJoinInput, ValidationResult } from '@/types';

export function useGroupActions() {
  const validateCreate = useCallback(async (input: CreateGroupInput): Promise<ValidationResult> => {
    return validateCreateGroupInput(input);
  }, []);

  const checkCrossGroupDuplicates = useCallback(async (input: CreateGroupInput): Promise<string[]> => {
    return findCrossGroupDuplicates(input.members);
  }, []);

  const submitCreateGroup = useCallback(async (input: CreateGroupInput): Promise<Group> => {
    return createGroup(input);
  }, []);

  const validateJoin = useCallback(
    async (group: Group, input: RequestToJoinInput) => {
      return validateRequestToJoinStrict(group, input);
    },
    [],
  );

  const checkJoinDuplicate = useCallback(async (enrollment: string): Promise<boolean> => {
    const duplicates = await findCrossGroupDuplicates([{ enrollment }]);
    return duplicates.length > 0;
  }, []);

  const submitRequestToJoin = useCallback(
    async (groupNumber: number, input: RequestToJoinInput) => {
      return requestToJoin(groupNumber, input);
    },
    [],
  );

  const confirm = useCallback(async (groupNumber: number, enrollment: string) => {
    return confirmMembership(groupNumber, enrollment);
  }, []);

  const saveNotes = useCallback(async (groupNumber: number, notes: string) => {
    return updateGroupNotes(groupNumber, notes);
  }, []);

  const revoke = useCallback(async (groupNumber: number, requestId: string) => {
    return revokeRequest(groupNumber, requestId);
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
