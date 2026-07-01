import { z } from "zod";

export const JobSchema = z.object({
  type: z.string().default("generic"),
  payload: z.any().default({}),
});
