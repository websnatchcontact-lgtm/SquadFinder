import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getMergedStudents, registerLookingForGroup, removeLookingForGroup } from '@/services/student.service';
import type { RegisterLookingForGroupInput, Student } from '@/types';

/** Full merged roster synced from Supabase. */
export function useStudents(): { students: Student[]; isLoading: boolean; refresh: () => Promise<void> } {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const data = await getMergedStudents();
    setStudents(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const channelId = `public-students-${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  return { students, isLoading, refresh };
}

/** Students currently marked as FREE (looking for a team). */
export function useAvailableStudents(): {
  students: Student[];
  isLoading: boolean;
  refresh: () => Promise<void>;
} {
  const { students, isLoading, refresh } = useStudents();
  return { students: students.filter((s) => s.status === 'FREE'), isLoading, refresh };
}

export function useRegisterLookingForGroup(): {
  register: (input: RegisterLookingForGroupInput) => Promise<Student>;
} {
  return { register: registerLookingForGroup };
}

/** Removes a student from looking for a group using a safety PIN. Returns true on success. */
export function useRemoveLookingForGroup(): {
  remove: (enrollment: string, pin: string) => Promise<boolean>;
} {
  return { remove: removeLookingForGroup };
}
