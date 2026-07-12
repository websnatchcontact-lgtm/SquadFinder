import { z } from "zod";
import { nameSchema, enrollmentSchema, divisionSchema, specializationSchema, safetyPinSchema, groupNotesSchema } from "./common.schema";

export const requestToJoinSchema = z.object({
  name: nameSchema,
  enrollment: enrollmentSchema,
  division: divisionSchema,
  specialization: specializationSchema,
  note: z.union([groupNotesSchema, z.literal("")]).optional(),
  pin: safetyPinSchema,
});
