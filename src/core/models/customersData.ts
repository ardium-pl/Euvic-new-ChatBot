import { z } from "zod";
import { ProjectData } from "./projectData";

export const CustomersData = z.object({
  customers: z.array(ProjectData),
});
