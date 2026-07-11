import type { ValidationResult } from '@/types';

/**
 * Normalizes and validates an enrollment number. Enrollment Number is the
 * PRIMARY IDENTIFIER of a student -- numeric only, whitespace stripped
 * automatically, no fixed length. Rejects letters, symbols, punctuation, and
 * emoji.
 */
export function validateEnrollment(raw: string): ValidationResult {
  const cleaned = raw.replace(/\s+/g, '');

  if (!cleaned) {
    return { valid: false, message: 'Enrollment number is required.' };
  }

  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, message: 'Enrollment number must contain digits only.' };
  }

  return { valid: true };
}

/** Strips all whitespace from an enrollment number, for use as a lookup key. */
export function normalizeEnrollment(raw: string): string {
  return raw.replace(/\s+/g, '');
}

export function validateName(raw: string): ValidationResult {
  if (!raw.trim()) {
    return { valid: false, message: 'Name is required.' };
  }
  return { valid: true };
}
