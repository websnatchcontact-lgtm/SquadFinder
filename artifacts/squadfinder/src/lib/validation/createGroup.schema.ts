import { z } from "zod";
import { nameSchema, enrollmentSchema, divisionSchema, specializationSchema } from "./common.schema";
import { MIN_GROUP_MEMBERS, MAX_GROUP_MEMBERS } from "@/constants";

/**
 * Validates an individual member within the Create Group payload.
 */
export const groupMemberSchema = z.object({
  name: nameSchema,
  enrollment: enrollmentSchema,
  division: divisionSchema,
  specialization: specializationSchema,
});

/**
 * Validates the entire Create Group payload.
 */
export const createGroupSchema = z.object({
  creatorName: nameSchema,
  members: z.array(groupMemberSchema)
    .min(MIN_GROUP_MEMBERS, `A group needs at least ${MIN_GROUP_MEMBERS} members.`)
    .max(MAX_GROUP_MEMBERS, `A group can have at most ${MAX_GROUP_MEMBERS} members.`),
});
