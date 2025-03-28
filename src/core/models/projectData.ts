import { z } from "zod";

export const ProjectData = z.object({
  clientName: z.string(),
  projectName: z.string(),
  technologies: z
    .object({
      name: z.array(z.string()),
    })
    .optional(),
  description: z.string(),
  businessCase: z
    .object({
      name: z.array(z.string()),
    })
    .optional(),
  dateDescription: z.string().optional(),
  scaleOfImplementation: z.string().optional(),
  industry: z.string().optional(),
});
