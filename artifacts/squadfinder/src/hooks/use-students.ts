import { useCallback, useEffect, useState } from 'react';

import { loadBaselineStudents, registerLookingForGroup } from '@/services/student.service';
import type { RegisterLookingForGroupInput, Student } from '@/types';

/** Full merged roster (demo JSON + Local Storage "looking for a group" additions). */
export function useStudents(): { students: Student[]; isLoading: boolean; refresh: () => void } {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setStudents(loadBaselineStudents());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { students, isLoading, refresh };
}

/** Students currently marked as FREE (looking for a team). */
export function useAvailableStudents(): {
  students: Student[];
  isLoading: boolean;
  refresh: () => void;
} {
  const { students, isLoading, refresh } = useStudents();
  return { students: students.filter((s) => s.status === 'FREE'), isLoading, refresh };
}

/** Registers a student as looking for a group, returning the created record. */
export function useRegisterLookingForGroup(): {
  register: (input: RegisterLookingForGroupInput) => Student;
} {
  return { register: registerLookingForGroup };
}
