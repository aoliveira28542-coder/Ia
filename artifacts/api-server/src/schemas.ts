
import { z } from "zod";

export const jobSchema = z.object({
  payload: z.any()
});
