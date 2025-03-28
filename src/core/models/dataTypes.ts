import { z } from "zod";
import { CustomersData } from "./customersData";
import { ProjectData } from "./projectData";

export type FileDataType = {
  fileName: string;
  ocrText: string;
  fileItemId: string;
  fileLink: string;
  customers: ProjectDataType[];
};
export type CustomersDataType = z.infer<typeof CustomersData>;
export type ProjectDataType = z.infer<typeof ProjectData>;
