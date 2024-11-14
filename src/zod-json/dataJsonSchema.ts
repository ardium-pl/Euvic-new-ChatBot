import { z } from "zod";


export const CustomerData = z.object({
  technologies: z.array(z.string()),
  businessCases: z.array(z.string()),
  referenceDate: z.string().optional(),
  scaleOfImplementation: z.string().optional(),
  clients: z.array(z.string()),
  industry: z.string().optional(),
});


export type CustomerDataType = z.infer<typeof CustomerData>;
