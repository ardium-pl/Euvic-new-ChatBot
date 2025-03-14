import { string, z } from "zod";

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

const ReferenceProjectData = z.object({
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
  scaleOfImplementationValue: z.string().optional(),
  scaleOfImplementationDescription: z.string().optional(),
  industry: z.string().optional(),
});

export const CustomersData = z.object({
  customers: z.array(ProjectData),
});

const FileData = z.object({
  fileName: z.string(),
  ocrText: z.string(),
  customers: z.array(ProjectData)
})

const ReferenceFileData = z.object({
  fileName: z.string(),
  ocrText: z.string(),
  customers: z.array(ReferenceProjectData)
})

export type FileDataType = z.infer<typeof FileData>
export type ReferenceFileDataType = z.infer<typeof ReferenceFileData>


export type CustomersDataType = z.infer<typeof CustomersData>;
export type ProjectDataType = z.infer<typeof ProjectData>;
export type ReferenceProjectDataType = z.infer<typeof ReferenceProjectData>;
