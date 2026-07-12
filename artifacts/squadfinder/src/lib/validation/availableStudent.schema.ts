import { z } from "zod";
import { nameSchema, enrollmentSchema, divisionSchema, specializationSchema, safetyPinSchema } from "./common.schema";

export const availableStudentSchema = z.object({
  name: nameSchema,
  enrollment: enrollmentSchema,
  division: divisionSchema,
  specialization: specializationSchema,
  pin: safetyPinSchema,
});
