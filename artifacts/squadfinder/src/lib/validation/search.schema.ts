import { z } from "zod";
import { isSafeString, preprocessString } from "./sanitization";

/**
 * Validates the search query.
 * Detects if it's purely numeric (Enrollment search) or alphabetic (Name search).
 * Rejects any script/HTML/SQL injection strings.
 */
export const searchSchema = preprocessString
  .refine(isSafeString, { message: "Invalid search query." })
  .refine((val) => {
    // If it contains any letters, we treat it as a name search.
    // If it contains only digits, it's an enrollment search.
    // Either way, it must be safe and valid.
    if (val === "") return true; // empty search is fine
    if (/^\d+$/.test(val)) return true; // purely numeric
    if (/^[a-zA-Z\s\-'.]+$/.test(val)) return true; // purely name-like characters
    return false;
  }, { message: "Search can only contain letters (for name) or numbers (for enrollment)." });
