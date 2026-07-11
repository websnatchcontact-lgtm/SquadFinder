import type { DivisionCode, SpecializationCode, SpecializationInfo, StudentStatus } from '@/types';

export const MAX_GROUP_MEMBERS = 4;
export const MIN_GROUP_MEMBERS = 2;

/** Only two specializations exist anywhere in the app. Strict business rule. */
export const SPECIALIZATIONS: Record<SpecializationCode, SpecializationInfo> = {
  CS: { code: 'CS', label: 'CS' },
  AIML: { code: 'AIML', label: 'AI/ML' },
};

export const SPECIALIZATION_LIST: SpecializationInfo[] = Object.values(SPECIALIZATIONS);

export const DIVISIONS: Record<DivisionCode, string> = {
  A: 'Division A',
  B: 'Division B',
};

export const DIVISION_LIST: DivisionCode[] = ['A', 'B'];

export const STATUS_LABELS: Record<StudentStatus, string> = {
  GROUPED: 'Grouped',
  FREE: 'Looking For A Group',
};

export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  search: '/search',
  available: '/available',
  about: '/about',
} as const;

export const LOCAL_STORAGE_KEYS = {
  lookingForGroup: 'squadfinder:looking-for-group',
  createdGroups: 'squadfinder:created-groups',
  requests: 'squadfinder:join-requests',
  confirmations: 'squadfinder:confirmations',
  notes: 'squadfinder:group-notes',
} as const;
