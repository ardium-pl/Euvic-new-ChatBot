import {
  ReferenceProjectDataType,
  ProjectDataType,
} from "../../src/insert-data-to-db/zod-json/dataJsonSchema";

export type TestFile = { pdf: string; json: string; test: boolean };

export function mapCustomers(
  customersArray: ReferenceProjectDataType[]
): ProjectDataType[] {
  return customersArray.map((customer) => ({
    clientName: customer.name,
    projectName: "",
    description: customer.projects.description,
    technologies: customer.projects.technologies,
    businessCase: customer.projects.businessCase
      ? { name: [customer.projects.businessCase] }
      : undefined,
    referenceDate: customer.projects.referenceDate,
    scaleOfImplementationValue: customer.projects.scaleOfImplementationValue,
    scaleOfImplementationDescription:
      customer.projects.scaleOfImplementationDescription,
    industry: customer.projects.industry,
  }));
}
