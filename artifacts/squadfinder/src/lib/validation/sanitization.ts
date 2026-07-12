import { z } from "zod";

/**
 * Normalizes a string by:
 * 1. Removing invisible Unicode control characters
 * 2. Normalizing to NFC (canonical composition)
 * 3. Trimming leading and trailing whitespace
 * 4. Collapsing multiple spaces into a single space
 */
export const normalizeString = (val: string) => {
  return val
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
    .normalize("NFC") // Normalize Unicode
    .trim() // Trim ends
    .replace(/\s+/g, " "); // Collapse multiple spaces
};

/**
 * Checks for obvious XSS/SQL injection patterns.
 * This is an extra layer of defense; our main defense is strict character whitelisting in Zod schemas.
 */
export const isSafeString = (val: string) => {
  // Reject <script> tags or html-like tags
  if (/<[a-z][\s\S]*>/i.test(val)) return false;
  
  // Reject basic SQL injection signatures like SELECT, UNION, DROP
  // We make it basic since legitimate names might contain some combinations if we aren't careful,
  // but we mostly rely on our strict regexes.
  if (/(\b(SELECT|UNION|INSERT|UPDATE|DELETE|DROP|ALTER)\b)|(--\s)/i.test(val)) return false;
  
  return true;
};

/**
 * A Zod preprocessor that applies `normalizeString` to any string input before validation.
 */
export const preprocessString = z.preprocess((val) => {
  if (typeof val === "string") {
    return normalizeString(val);
  }
  return val;
}, z.string());
