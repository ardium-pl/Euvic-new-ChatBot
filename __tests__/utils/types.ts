import {
  ReferenceProjectDataType,
  ProjectDataType,
} from "../../src/insert-data-to-db/zod-json/dataJsonSchema";

export type TestFile = { pdf: string; json: string; test: boolean };

export function mapCustomers(
  customersArray: ReferenceProjectDataType[]
): ProjectDataType[] {
  return customersArray.map((customer) => ({
    clientName: customer.clientName,
    projectName: "",
    description: customer.description,
    technologies: customer.technologies,
    businessCase: customer.businessCase ? customer.businessCase : undefined,
    dateDescription: customer.referenceDate,
    scaleOfImplementation: customer.scaleOfImplementationDescription,
    industry: customer.industry,
  }));
}
