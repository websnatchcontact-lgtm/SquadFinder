import rawStudents from '@/data/students.json';
import type { DivisionCode, RegisterLookingForGroupInput, SpecializationCode, Student } from '@/types';
import { normalizeEnrollment } from '@/utils/validation';
import { getLookingForGroup, setLookingForGroup } from '@/services/storage.service';
import { getAllGroups } from '@/services/group.service';

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
  
  // Rule 1: Check if already in a group
  const allGroups = getAllGroups();
  const groupMatch = allGroups.find(g => g.members.some(m => m.enrollment === enrollment));
  if (groupMatch) {
    throw new Error(`You are already registered as a member of Group ${groupMatch.groupNumber}. A student who is already part of a group cannot register as 'Looking for a Team'.`);
  }

  // Rule 2: Check if already in Available Students
  const availableStudents = getLookingForGroup();
  if (availableStudents.some(s => s.enrollment === enrollment)) {
    throw new Error("You are already registered as Looking for a Team. If you have already found a team, remove yourself from the Available Students list before registering again.");
  }

  const entry: Student = {
    enrollment,
    name: input.name.trim(),
    specialization: input.specialization,
    division: input.division,
    group: null,
    status: 'FREE',
    addedAt: new Date().toISOString(),
    pin: input.pin,
  };

  const existing = availableStudents.filter((s) => s.enrollment !== enrollment);
  setLookingForGroup([...existing, entry]);

  return entry;
}

/** 
 * Returns the fully merged, deduplicated roster of all students across 
 * baseline, local storage availability, and group memberships.
 */
export function getMergedStudents(): Student[] {
  const baseline = loadBaselineStudents();
  const groups = getAllGroups();
  
  const studentMap = new Map<string, Student>();
  
  // 1. Add baseline + looking for group students
  for (const student of baseline) {
    studentMap.set(student.enrollment, { ...student });
  }
  
  // 2. Add/override with students from all groups
  for (const group of groups) {
    for (const member of group.members) {
      studentMap.set(member.enrollment, {
        enrollment: member.enrollment,
        name: member.name,
        specialization: member.specialization,
        division: member.division,
        group: group.groupNumber,
        status: 'GROUPED',
      });
    }
  }
  
  return Array.from(studentMap.values());
}

export function isDuplicateEnrollment(
  students: Student[],
  enrollment: string,
): boolean {
  const normalized = normalizeEnrollment(enrollment);
  return students.some((s) => s.enrollment === normalized);
}

/** Removes a student from "looking for a group" if the provided PIN matches the stored PIN. */
export function removeLookingForGroup(enrollment: string, pin: string): boolean {
  const normalized = normalizeEnrollment(enrollment);
  const allStudents = getLookingForGroup();
  
  const student = allStudents.find((s) => s.enrollment === normalized);
  if (!student) return false;
  if (student.pin !== pin) return false;
  
  const remaining = allStudents.filter((s) => s.enrollment !== normalized);
  setLookingForGroup(remaining);
  return true;
}

export type { DivisionCode, SpecializationCode };
