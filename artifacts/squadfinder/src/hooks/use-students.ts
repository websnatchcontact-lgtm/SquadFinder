import { useCallback, useEffect, useState } from 'react';

import { getMergedStudents, registerLookingForGroup, removeLookingForGroup } from '@/services/student.service';
import type { RegisterLookingForGroupInput, Student } from '@/types';

/** Full merged roster (demo JSON + Local Storage "looking for a group" additions + members of created groups). */
export function useStudents(): { students: Student[]; isLoading: boolean; refresh: () => void } {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setStudents(getMergedStudents());
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

export function useRegisterLookingForGroup(): {
  register: (input: RegisterLookingForGroupInput) => Student;
} {
  return { register: registerLookingForGroup };
}

/** Removes a student from looking for a group using a safety PIN. Returns true on success. */
export function useRemoveLookingForGroup(): {
  remove: (enrollment: string, pin: string) => boolean;
} {
  return { remove: removeLookingForGroup };
}
