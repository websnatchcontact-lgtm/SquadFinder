import { z } from "zod";
import { isSafeString, preprocessString } from "./sanitization";

/**
 * Common Name Schema:
 * - Length: 2 to 100 characters.
 * - Allows ONLY: Letters and spaces.
 */
export const nameSchema = preprocessString
  .refine(isSafeString, { message: "Invalid characters detected" })
  .refine((val) => val.length >= 2, { message: "Name must be at least 2 characters long." })
  .refine((val) => val.length <= 100, { message: "Name must be at most 100 characters long." })
  .refine((val) => /^[a-zA-Z\s]+$/.test(val), {
    message: "Name can only contain alphabetic characters and spaces.",
  });

/**
 * Common Enrollment Schema:
 * - Automatically strips all spaces.
 * - Allows ONLY digits (0-9).
 */
export const enrollmentSchema = z.preprocess((val) => {
  if (typeof val === "string") {
    return val.replace(/\s+/g, ""); // Strip all spaces aggressively for enrollment
  }
  return val;
}, z.string())
  .refine((val) => val.length > 0, { message: "Enrollment number is required." })
  .refine((val) => /^\d+$/.test(val), { message: "Enrollment number must contain only digits." });

/**
 * Common Division Schema:
 * - Strictly Division A or Division B
 */
export const divisionSchema = z.enum(["A", "B"], {
  errorMap: () => ({ message: "Please select a valid division." }),
});

/**
 * Common Specialization Schema:
 * - Strictly CS or AIML (Wait, the user approved "CS" | "AIML")
 */
export const specializationSchema = z.enum(["CS", "AIML"], {
  errorMap: () => ({ message: "Please select a valid specialization." }),
});

/**
 * Common Safety PIN Schema:
 * - Length: 4 to 8 digits
 * - Allows ONLY digits (0-9).
 */
export const safetyPinSchema = z.preprocess((val) => {
  if (typeof val === "string") {
    return val.replace(/\s+/g, "");
  }
  return val;
}, z.string())
  .refine((val) => val.length >= 4, { message: "Safety PIN must be at least 4 digits." })
  .refine((val) => val.length <= 8, { message: "Safety PIN must be at most 8 digits." })
  .refine((val) => /^\d+$/.test(val), { message: "Safety PIN must contain only numbers." });

/**
 * Common Group Notes Schema:
 * - Max length: 300 characters
 * - Allows letters, numbers, and basic punctuation.
 * - Prevents HTML/Scripts.
 */
export const groupNotesSchema = preprocessString
  .refine(isSafeString, { message: "Invalid content detected." })
  .refine((val) => val.length <= 300, { message: "Notes cannot exceed 300 characters." })
  .refine((val) => val === "" || /^[a-zA-Z0-9\s.,!?'"()\-]+$/.test(val), {
    message: "Notes can only contain letters, numbers, and basic punctuation.",
  });
