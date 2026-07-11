import { useCallback, useEffect, useState } from 'react';

import {
  getAvailableStudents,
  getGroup,
  loadStudents,
  registerLookingForGroup,
} from '@/services/student.service';
import type { Group, Student } from '@/types';

/** Full merged roster (base JSON + Local Storage additions). Re-reads on demand via `refresh`. */
export function useStudents(): { students: Student[]; isLoading: boolean; refresh: () => void } {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setStudents(loadStudents());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { students, isLoading, refresh };
}

/** Students currently marked as FREE (looking for a team). */
export function useAvailableStudents(): { students: Student[]; isLoading: boolean; refresh: () => void } {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setStudents(getAvailableStudents());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { students, isLoading, refresh };
}

/** Derived Group data for a given group number (recomputes when the number changes). */
export function useGroup(groupNumber: string | null | undefined): Group | undefined {
  const [group, setGroup] = useState<Group | undefined>(undefined);

  useEffect(() => {
    setGroup(groupNumber ? getGroup(groupNumber) : undefined);
  }, [groupNumber]);

  return group;
}

/** Registers a student as looking for a group, then returns the created record. */
export function useRegisterLookingForGroup(): {
  register: typeof registerLookingForGroup;
} {
  return { register: registerLookingForGroup };
}
