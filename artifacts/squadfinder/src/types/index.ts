// Core domain types for SquadFinder.
// Avoid `any` everywhere -- every shape used across services/hooks/components lives here.

export type StudentStatus = 'GROUPED' | 'FREE' | 'MISMATCH';

export type SpecializationCode = 'CS' | 'IT' | 'AI' | 'DS' | 'CY' | 'EC';

export interface SpecializationInfo {
  code: SpecializationCode;
  label: string;
}

/** Raw student record as stored in data/students.json and Local Storage. */
export interface Student {
  enrollment: string;
  name: string;
  specialization: SpecializationCode;
  group: string | null;
  status: StudentStatus;
  /** Present only for students added via "I'm Looking For A Group" (Local Storage). */
  addedAt?: string;
}

/** A dynamically computed group, derived from the student list at read time. */
export interface Group {
  groupNumber: string;
  members: Student[];
  totalMembers: number;
  seatsLeft: number;
  isFull: boolean;
  isMismatched: boolean;
  specializationCounts: Partial<Record<SpecializationCode, number>>;
}

export interface DashboardStats {
  totalStudents: number;
  totalGroups: number;
  studentsInGroups: number;
  studentsLooking: number;
  mismatchStudents: number;
  groupsFull: number;
  groupsWithOpenSeats: number;
  availableSeatsRemaining: number;
  csStudents: number;
  aimlStudents: number;
  mixedGroups: number;
  averageGroupSize: number;
  largestGroupSize: number;
  smallestGroupSize: number;
  specializationBreakdown: Partial<Record<SpecializationCode, number>>;
}

export interface SearchResult {
  student: Student;
  group: Group | null;
}

/** A student who registered interest via "I'm Looking For A Group". */
export interface AvailableStudent extends Student {
  status: 'FREE';
}
