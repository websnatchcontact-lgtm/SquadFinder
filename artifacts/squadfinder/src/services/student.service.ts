import rawStudents from '@/data/students.json';
import type { DivisionCode, RegisterLookingForGroupInput, SpecializationCode, Student } from '@/types';
import { normalizeEnrollment } from '@/utils/validation';
import { fetchAvailableStudents } from '@/services/supabase.service';
import { getAllGroups } from '@/services/group.service';
import { supabase } from '@/lib/supabase';

const BASE_STUDENTS = Array.isArray(rawStudents) ? (rawStudents as Student[]) : [];

/**
 * Loads the full baseline roster: the read-only demo JSON merged with any
 * "I'm Looking For A Group" entries stored in Supabase.
 */
export async function loadBaselineStudents(): Promise<Student[]> {
  const localEntries = await fetchAvailableStudents();
  const baseEnrollments = new Set(BASE_STUDENTS.map((s) => s.enrollment));
  const newLocalEntries = localEntries.filter((s) => !baseEnrollments.has(s.enrollment));
  return [...BASE_STUDENTS, ...newLocalEntries];
}

/** Registers a student as "looking for a group" in Supabase. */
export async function registerLookingForGroup(input: RegisterLookingForGroupInput): Promise<Student> {
  const enrollment = normalizeEnrollment(input.enrollment);
  
  // Rule 1: Check if already in a group
  const allGroups = await getAllGroups();
  const groupMatch = allGroups.find(g => g.members.some(m => m.enrollment === enrollment));
  if (groupMatch) {
    throw new Error(`You are already registered as a member of Group ${groupMatch.groupNumber}. A student who is already part of a group cannot register as 'Looking for a Team'.`);
  }

  // Rule 2: Check if already in Available Students
  const availableStudents = await fetchAvailableStudents();
  if (availableStudents.some(s => s.enrollment === enrollment)) {
    throw new Error("You are already registered as Looking for a Team. If you have already found a team, remove yourself from the Available Students list before registering again.");
  }

  // Upsert the student record
  await supabase.from('students').upsert({
    enrollment,
    full_name: input.name.trim(),
    division: input.division,
    specialization: input.specialization,
  }, { onConflict: 'enrollment' });

  // Insert into available_students
  const { error } = await supabase.from('available_students').insert({
    enrollment,
    note: null,
    safety_pin: input.pin,
  });

  if (error) {
    console.error("Failed to register looking for group:", error);
    throw new Error("Failed to register.");
  }

  return {
    enrollment,
    name: input.name.trim(),
    specialization: input.specialization,
    division: input.division,
    group: null,
    status: 'FREE',
    addedAt: new Date().toISOString(),
    pin: input.pin,
  };
}

/** 
 * Returns the fully merged, deduplicated roster of all students across 
 * baseline, Supabase availability, and group memberships.
 */
export async function getMergedStudents(): Promise<Student[]> {
  const baseline = await loadBaselineStudents();
  const groups = await getAllGroups();
  
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
export async function removeLookingForGroup(enrollment: string, pin: string): Promise<boolean> {
  const normalized = normalizeEnrollment(enrollment);
  const availableStudents = await fetchAvailableStudents();
  
  const student = availableStudents.find((s) => s.enrollment === normalized);
  if (!student) return false;
  if (student.pin !== pin) return false;
  
  const { error } = await supabase.from('available_students').delete().eq('enrollment', normalized);
  return !error;
}

export type { DivisionCode, SpecializationCode };
