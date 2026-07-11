import rawStudents from '@/data/students.json';
import { LOCAL_STORAGE_KEYS, MIN_GROUP_MEMBERS } from '@/constants';
import type { DashboardStats, Group, SpecializationCode, Student } from '@/types';
import { buildAllGroups, buildGroup, groupStudents, searchStudents } from '@/utils/students';

const BASE_STUDENTS = rawStudents as Student[];

/** Reads the "looking for a group" entries a visitor has registered on this device. */
function readLocalLookingForGroup(): Student[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEYS.lookingForGroup);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Student[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

/**
 * Loads the full student roster: the base JSON dataset merged with any
 * "I'm Looking For A Group" entries stored in Local Storage. Local entries
 * are merged by enrollment number and never overwrite the original JSON file.
 */
export function loadStudents(): Student[] {
  const localEntries = readLocalLookingForGroup();
  const baseEnrollments = new Set(BASE_STUDENTS.map((s) => s.enrollment));
  const newLocalEntries = localEntries.filter((s) => !baseEnrollments.has(s.enrollment));

  return [...BASE_STUDENTS, ...newLocalEntries];
}

/** Finds a single student by exact enrollment number (case-insensitive, trimmed). */
export function getStudent(enrollment: string): Student | undefined {
  const query = enrollment.trim().toLowerCase();
  if (!query) return undefined;
  return loadStudents().find((s) => s.enrollment.toLowerCase() === query);
}

/** Returns the derived Group for a given group number, if it exists. */
export function getGroup(groupNumber: string): Group | undefined {
  const students = loadStudents();
  const members = groupStudents(students)[groupNumber];
  if (!members) return undefined;
  return buildGroup(groupNumber, members);
}

/** Full-text search across enrollment number and name. */
export function searchStudentsByQuery(query: string): Student[] {
  return searchStudents(loadStudents(), query);
}

/** Students currently marked as FREE (looking for a team). */
export function getAvailableStudents(): Student[] {
  return loadStudents().filter((s) => s.status === 'FREE');
}

/** Computes every dashboard aggregate from the current roster. */
export function getDashboardStatistics(): DashboardStats {
  const students = loadStudents();
  const groups = buildAllGroups(students);

  const studentsInGroups = students.filter((s) => s.status === 'GROUPED').length;
  const studentsLooking = students.filter((s) => s.status === 'FREE').length;
  const mismatchStudents = students.filter((s) => s.status === 'MISMATCH').length;

  const groupsFull = groups.filter((g) => g.isFull).length;
  const groupsWithOpenSeats = groups.filter((g) => !g.isFull).length;
  const availableSeatsRemaining = groups.reduce((sum, g) => sum + g.seatsLeft, 0);

  const specializationBreakdown: Partial<Record<SpecializationCode, number>> = {};
  for (const student of students) {
    specializationBreakdown[student.specialization] =
      (specializationBreakdown[student.specialization] ?? 0) + 1;
  }

  const mixedGroups = groups.filter(
    (g) => Object.keys(g.specializationCounts).length > 1,
  ).length;

  const groupSizes = groups.map((g) => g.totalMembers);
  const averageGroupSize =
    groupSizes.length > 0
      ? Math.round((groupSizes.reduce((sum, n) => sum + n, 0) / groupSizes.length) * 10) / 10
      : 0;
  const largestGroupSize = groupSizes.length > 0 ? Math.max(...groupSizes) : 0;
  const smallestGroupSize = groupSizes.length > 0 ? Math.min(...groupSizes) : 0;

  return {
    totalStudents: students.length,
    totalGroups: groups.length,
    studentsInGroups,
    studentsLooking,
    mismatchStudents,
    groupsFull,
    groupsWithOpenSeats,
    availableSeatsRemaining,
    csStudents: specializationBreakdown.CS ?? 0,
    aimlStudents: specializationBreakdown.AI ?? 0,
    mixedGroups,
    averageGroupSize,
    largestGroupSize,
    smallestGroupSize,
    specializationBreakdown,
  };
}

/** Every derived group, sorted by group number. */
export function getAllGroups(): Group[] {
  return buildAllGroups(loadStudents());
}

/**
 * Registers a student as "looking for a group" in Local Storage. Never
 * overwrites the base JSON dataset -- this only ever touches Local Storage.
 * A minimum group size constant is exported for UI copy/validation use.
 */
export function registerLookingForGroup(input: {
  enrollment: string;
  name: string;
  specialization: Student['specialization'];
}): Student {
  const entry: Student = {
    enrollment: input.enrollment.trim(),
    name: input.name.trim(),
    specialization: input.specialization,
    group: null,
    status: 'FREE',
    addedAt: new Date().toISOString(),
  };

  const existing = readLocalLookingForGroup().filter(
    (s) => s.enrollment.toLowerCase() !== entry.enrollment.toLowerCase(),
  );
  const next = [...existing, entry];

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LOCAL_STORAGE_KEYS.lookingForGroup, JSON.stringify(next));
  }

  return entry;
}

export { MIN_GROUP_MEMBERS };
