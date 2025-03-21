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
  dateDescription: z.string().optional(),
  scaleOfImplementation: z.string().optional(),
  industry: z.string().optional(),
});

export const CustomersData = z.object({
  customers: z.array(ProjectData),
});

export type FileData = {
  fileName: string;
  ocrText: string;
  fileItemId: string;
  fileLink: string;
  customers: ProjectDataType[];
};

export type CustomersDataType = z.infer<typeof CustomersData>;
type ProjectDataType = z.infer<typeof ProjectData>;
