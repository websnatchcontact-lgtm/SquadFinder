import type { SpecializationCode, SpecializationInfo, StudentStatus } from '@/types';

export const MAX_GROUP_MEMBERS = 5;
export const MIN_GROUP_MEMBERS = 3;

export const SPECIALIZATIONS: Record<SpecializationCode, SpecializationInfo> = {
  CS: { code: 'CS', label: 'Computer Science' },
  IT: { code: 'IT', label: 'Information Technology' },
  AI: { code: 'AI', label: 'AI/ML' },
  DS: { code: 'DS', label: 'Data Science' },
  CY: { code: 'CY', label: 'Cybersecurity' },
  EC: { code: 'EC', label: 'Electronics' },
};

export const SPECIALIZATION_LIST: SpecializationInfo[] = Object.values(SPECIALIZATIONS);

export const STATUS_LABELS: Record<StudentStatus, string> = {
  GROUPED: 'Grouped',
  FREE: 'Looking For A Group',
  MISMATCH: 'Mismatch',
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
} as const;
