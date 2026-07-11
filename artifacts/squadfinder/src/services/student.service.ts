import rawStudents from '@/data/students.json';
import type { DivisionCode, RegisterLookingForGroupInput, SpecializationCode, Student } from '@/types';
import { normalizeEnrollment } from '@/utils/validation';
import { getLookingForGroup, setLookingForGroup } from '@/services/storage.service';

const BASE_STUDENTS = rawStudents as Student[];

/**
 * Loads the full baseline roster: the read-only demo JSON merged with any
 * "I'm Looking For A Group" entries stored in Local Storage. Local entries
 * never overwrite the original JSON file.
 */
export function loadBaselineStudents(): Student[] {
  const localEntries = getLookingForGroup();
  const baseEnrollments = new Set(BASE_STUDENTS.map((s) => s.enrollment));
  const newLocalEntries = localEntries.filter((s) => !baseEnrollments.has(s.enrollment));
  return [...BASE_STUDENTS, ...newLocalEntries];
}

/** Registers a student as "looking for a group" in Local Storage. */
export function registerLookingForGroup(input: RegisterLookingForGroupInput): Student {
  const enrollment = normalizeEnrollment(input.enrollment);
  const entry: Student = {
    enrollment,
    name: input.name.trim(),
    specialization: input.specialization,
    division: input.division,
    group: null,
    status: 'FREE',
    addedAt: new Date().toISOString(),
  };

  const existing = getLookingForGroup().filter((s) => s.enrollment !== enrollment);
  setLookingForGroup([...existing, entry]);

  return entry;
}

export function isDuplicateEnrollment(
  students: Student[],
  enrollment: string,
): boolean {
  const normalized = normalizeEnrollment(enrollment);
  return students.some((s) => s.enrollment === normalized);
}

export type { DivisionCode, SpecializationCode };
