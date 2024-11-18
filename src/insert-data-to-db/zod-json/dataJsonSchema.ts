import { z } from "zod";

const ProjectData = z.object({
  technologies: 
      z.object({
        name: z.array(z.string()),
      })
    .optional(),
  description: z.string(),
  businessCase: z.string(),
  referenceDate: z.string().optional(),
  scaleOfImplementationValue: z.number().optional(),
  scaleOfImplementationDescription: z.string().optional(),
  industry: z.string().optional(),
});

export const CustomersData = z.object({
  customers: z.array(
    z.object({
      name: z.string(),
      projects: ProjectData,
    })
  ),
});

export type FileData = {
  fileName: string;
  ocrText: string;
  customers: {
    name: string;
    projects: ProjectDataType;
  }[];
};

export type CustomersDataType = z.infer<typeof CustomersData>;
type ProjectDataType = z.infer<typeof ProjectData>;
