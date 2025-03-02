import { z } from "zod";

const ProjectData = z.object({
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
  referenceDate: z.string().optional(),
  scaleOfImplementationValue: z.number().optional(),
  scaleOfImplementationDescription: z.string().optional(),
  industry: z.string().optional(),
});

const ReferenceProjectData = z.object({
  name: z.string(),
  projects: z.object({
    technologies: z
      .object({
        name: z.array(z.string()),
      })
      .optional(),
    description: z.string(),
    businessCase: z.string().optional(),
    referenceDate: z.string().optional(),
    scaleOfImplementationValue: z.number().optional(),
    scaleOfImplementationDescription: z.string().optional(),
    industry: z.string().optional(),
  }),
});

export const CustomersData = z.object({
  customers: z.array(ProjectData),
});

export type FileData = {
  fileName: string;
  ocrText: string;
  customers: ProjectDataType[];
};

export type ReferenceData = {
  fileName: string;
  ocrText: string;
  customers: ReferenceProjectDataType[];
}

export type CustomersDataType = z.infer<typeof CustomersData>;
type ProjectDataType = z.infer<typeof ProjectData>;
type ReferenceProjectDataType = z.infer<typeof ReferenceProjectData>;
