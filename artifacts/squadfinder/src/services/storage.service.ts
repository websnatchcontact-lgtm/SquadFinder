import { LOCAL_STORAGE_KEYS } from '@/constants';
import type { Group, GroupMember, JoinRequest, Student } from '@/types';

/**
 * Every user-generated piece of state lives behind this service. No page or
 * hook should touch `window.localStorage` directly -- that keeps the merge
 * and corruption-recovery logic in exactly one place.
 */

export interface StoredCreatedGroup {
  groupNumber: string;
  specialization: Group['specialization'];
  createdBy: string;
  createdAt: string;
  members: GroupMember[];
}

type ConfirmationsMap = Record<string, Record<string, boolean>>;
type RequestsMap = Record<string, JoinRequest[]>;
type NotesMap = Record<string, string>;

function readJson<T>(key: string, fallback: T, isValid: (value: unknown) => boolean): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!isValid(parsed)) return fallback;
    return parsed as T;
  } catch {
    // Local Storage corrupted -- recover automatically, original demo data is untouched.
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getCreatedGroups(): StoredCreatedGroup[] {
  return readJson<StoredCreatedGroup[]>(LOCAL_STORAGE_KEYS.createdGroups, [], Array.isArray);
}

export function setCreatedGroups(groups: StoredCreatedGroup[]): void {
  writeJson(LOCAL_STORAGE_KEYS.createdGroups, groups);
}

export function getRequests(): RequestsMap {
  return readJson<RequestsMap>(
    LOCAL_STORAGE_KEYS.requests,
    {},
    (v) => typeof v === 'object' && v !== null && !Array.isArray(v),
  );
}

export function setRequests(requests: RequestsMap): void {
  writeJson(LOCAL_STORAGE_KEYS.requests, requests);
}

export function getConfirmations(): ConfirmationsMap {
  return readJson<ConfirmationsMap>(
    LOCAL_STORAGE_KEYS.confirmations,
    {},
    (v) => typeof v === 'object' && v !== null && !Array.isArray(v),
  );
}

export function setConfirmations(confirmations: ConfirmationsMap): void {
  writeJson(LOCAL_STORAGE_KEYS.confirmations, confirmations);
}

export function getNotes(): NotesMap {
  return readJson<NotesMap>(
    LOCAL_STORAGE_KEYS.notes,
    {},
    (v) => typeof v === 'object' && v !== null && !Array.isArray(v),
  );
}

export function setNotes(notes: NotesMap): void {
  writeJson(LOCAL_STORAGE_KEYS.notes, notes);
}

export function getLookingForGroup(): Student[] {
  return readJson<Student[]>(LOCAL_STORAGE_KEYS.lookingForGroup, [], Array.isArray);
}

export function setLookingForGroup(students: Student[]): void {
  writeJson(LOCAL_STORAGE_KEYS.lookingForGroup, students);
}

