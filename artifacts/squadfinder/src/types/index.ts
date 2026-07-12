// Core domain types for SquadFinder's Capstone Group Coordination Platform.
// The app has two data sources that are always merged into one unified state:
//  1. data/students.json -- the original, read-only demo roster.
//  2. Local Storage -- everything students create at runtime (groups, requests,
//     confirmations, notes, and "looking for a group" registrations).

export type StudentStatus = 'GROUPED' | 'FREE';

/** Only two specializations exist anywhere in the app. */
export type SpecializationCode = 'CS' | 'AIML';

/** The two college divisions. Division has no grouping restriction. */
export type DivisionCode = 'A' | 'B';

export interface SpecializationInfo {
  code: SpecializationCode;
  label: string;
}

/** Raw student record as stored in data/students.json and Local Storage. */
export interface Student {
  enrollment: string;
  name: string;
  specialization: SpecializationCode;
  division: DivisionCode;
  group: number | null;
  status: StudentStatus;
  /** Present only for students added via "I'm Looking For A Group" (Local Storage). */
  addedAt?: string;
}

/** A pending request to join a group. Never auto-accepted -- informational only. */
export interface JoinRequest {
  id: string;
  groupNumber: number;
  name: string;
  enrollment: string;
  division: DivisionCode;
  specialization: SpecializationCode;
  note?: string;
  requestedAt: string;
  status: 'PENDING';
}

/** A single member of a group, with confirmation state. */
export interface GroupMember {
  enrollment: string;
  name: string;
  division: DivisionCode;
  specialization: SpecializationCode;
  confirmed: boolean;
  isCreator: boolean;
}

export type GroupHealth = 'healthy' | 'pending' | 'conflict';

/** A fully-derived group, merged from demo data and/or Local Storage overlays. */
export interface Group {
  groupNumber: number;
  source: 'demo' | 'local';
  specialization: SpecializationCode;
  createdBy: string | null;
  createdAt: string | null;
  members: GroupMember[];
  notes: string;
  requests: JoinRequest[];
  totalMembers: number;
  confirmedMembers: number;
  seatsLeft: number;
  isFull: boolean;
  conflictCount: number;
  health: GroupHealth;
  divisionCounts: Partial<Record<DivisionCode, number>>;
}

/** A student whose enrollment number appears in more than one group. */
export interface ConflictAppearance {
  groupNumber: number;
  createdBy: string | null;
  createdAt: string | null;
}

export interface ConflictRecord {
  enrollment: string;
  name: string;
  specialization: SpecializationCode;
  division: DivisionCode;
  severity: 'one' | 'multiple';
  appearsIn: ConflictAppearance[];
}

export interface DashboardStats {
  totalStudents: number;
  totalGroups: number;
  studentsInGroups: number;
  studentsLooking: number;
  confirmedMembers: number;
  unconfirmedMembers: number;
  pendingRequests: number;
  openSeats: number;
  conflictCount: number;
  csStudents: number;
  aimlStudents: number;
  divisionAStudents: number;
  divisionBStudents: number;
  averageGroupSize: number;
  largestGroupSize: number;
  smallestGroupSize: number;
  recentGroups: Group[];
}

export type GroupSortKey =
  | 'newest'
  | 'oldest'
  | 'mostMembers'
  | 'leastMembers'
  | 'mostConfirmed'
  | 'leastConfirmed'
  | 'mostRequests'
  | 'mostConflicts'
  | 'alphabetical';

export interface GroupFilters {
  division?: DivisionCode;
  specialization?: SpecializationCode;
  health?: GroupHealth;
  hasOpenSeats?: boolean;
  isFull?: boolean;
}

export interface CreateGroupMemberInput {
  name: string;
  enrollment: string;
  division: DivisionCode;
  specialization: SpecializationCode;
}

export interface CreateGroupInput {
  creatorName: string;
  members: CreateGroupMemberInput[];
}

export interface RequestToJoinInput {
  name: string;
  enrollment: string;
  division: DivisionCode;
  specialization: SpecializationCode;
  note?: string;
  pin: string;
}

export interface RegisterLookingForGroupInput {
  enrollment: string;
  name: string;
  division: DivisionCode;
  specialization: SpecializationCode;
  pin: string;
}

/** Result of a validation check -- never throws, always explains itself. */
export interface ValidationResult {
  valid: boolean;
  message?: string;
}
