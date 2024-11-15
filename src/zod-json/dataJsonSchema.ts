import { z } from "zod";

const ProjectData = z.object({
  technologies: z
    .array(
      z.object({
        name: z.string().optional(),
      })
    )
    .optional(),
  description: z.string(),
  businessCases: z.array(z.string()),
  referenceDate: z.string().optional(),
  scaleOfImplementationValue: z.number().optional(),
  scaleOfImplementationDescription: z.string().optional(),
  industry: z.string().optional(),
});

export const CustomersData = z.object({
  customers: z.array(
    z.object({
      name: z.string(),
      projects: z.array(ProjectData),
    })
  ),
});

export type FileData = {
  fileName: string;
  ocrText: string;
  customers: {
    name: string;
    projects: Array<ProjectDataType>;
  }[];
};

export type CustomersDataType = z.infer<typeof CustomersData>;
type ProjectDataType = z.infer<typeof ProjectData>;
