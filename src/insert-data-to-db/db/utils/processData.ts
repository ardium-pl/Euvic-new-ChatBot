import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import { addTechnologyProjectsToDB } from "../services/technologyProjects.service";
import { loadJSONFiles } from "./json-loader";
import {
  DataClient,
  DataFileProject,
  TechnologyProject,
} from "../models/dataMoldes";
import { addBusinessCasesToDB } from "../services/businessCases.service";
import { addFilesToDB } from "../services/files.service";
import { addIndustriesToDB } from "../services/industries.service";
import { addProjectsToDB } from "../services/projects.service";
import { addTechnologiesToDB } from "../services/technologies.service";
import { addClientsToDB } from "../services/clients.service";
import { addFileProjectsToDB } from "../services/fileProjects.service";
import chalk from "chalk";

// Konwersja `import.meta.url` na ścieżkę pliku
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonDataDirectory = path.join(__dirname, "../../utils/json-data");

export async function processData() {
  const jsonData = loadJSONFiles(jsonDataDirectory);

  const businessCases = jsonData.jsonData.reduce(
    (acc: Set<string>, customer: any) => {
      if (customer.projects?.businessCase) {
        acc.add(customer.projects.businessCase);
      }
      return acc;
    },
    new Set<string>()
  );

  const technologies = jsonData.jsonData.reduce(
    (acc: Set<string>, customer: any) => {
      if (customer.projects?.technologies?.name) {
        customer.projects.technologies.name.forEach((tech: string) => {
          acc.add(tech);
        });
      }
      return acc;
    },
    new Set<string>()
  );

  const industries = jsonData.jsonData.reduce(
    (acc: Set<string>, customer: any) => {
      if (customer.projects?.industry) {
        acc.add(customer.projects.industry);
      }
      return acc;
    },
    new Set<string>()
  );

  const clientsData: DataClient[] = jsonData.jsonData.reduce(
    (acc: DataClient[], customer: any) => {
      if (customer.name && customer.projects?.industry) {
        acc.push({ name: customer.name, industry: customer.projects.industry });
      }
      return acc;
    },
    []
  );

  const projectsData = jsonData.jsonData.map((customer: any) => ({
    clientName: customer.name,
    industryName: customer.projects?.industry,
    businessCase: customer.projects?.businessCase,
    description: customer.projects?.description,
    referenceDate: customer.projects?.referenceDate,
    implementationScaleValue: customer.projects?.scaleOfImplementationValue,
    implementationScaleDescription:
      customer.projects?.scaleOfImplementationDescription,
  }));

  const technologyProjects: TechnologyProject[] = jsonData.jsonData.reduce(
    (acc: TechnologyProject[], customer: any) => {
      if (
        customer.projects?.description &&
        customer.projects?.technologies?.name
      ) {
        acc.push({
          projectName: customer.projects.description,
          technologies: customer.projects.technologies.name, // TODO: powinno sie zrobic po project names a nie po opisie tak mi sie wydaje
        });
      }
      return acc;
    },
    []
  );

  const fileProjects: DataFileProject[] = jsonData.jsonData.reduce(
    (acc: { projectName: string; fileName: string }[], customer: any) => {
      if (customer.projects?.description && jsonData.filesData) {
        jsonData.filesData.forEach((file) => {
          acc.push({
            projectName: customer.projects.description,
            fileName: file.nazwa,
          });
        });
      }
      return acc;
    },
    []
  );

  try {
    // Etap 1: Dodaj dane niezależne
    console.log("Adding business cases...");
    await addBusinessCasesToDB(businessCases);

    console.log("Adding technologies...");
    await addTechnologiesToDB(technologies);

    console.log("Adding industries...");
    await addIndustriesToDB(industries);

    console.log("Adding files...");
    await addFilesToDB(jsonData.filesData);

    // Etap 2: Dodaj klientów (zależne od industries)
    console.log("Adding clients...");
    await addClientsToDB(clientsData);

    // Etap 3: Dodaj projekty (zależne od clients i business cases)
    console.log("Adding projects...");
    await addProjectsToDB(projectsData);

    // Etap 4: Dodaj relacje wiele-do-wielu
    console.log("Adding technology-project relationships...");
    await addTechnologyProjectsToDB(technologyProjects);

    console.log("Adding file-project relationships...");
    await addFileProjectsToDB(fileProjects);

    console.log(chalk.green(`✅ All data processed successfully!`));
  } catch (error) {
    console.error(chalk.red(`❌ Error during data processing:`, error));
  }

  console.log("Business cases added to the database.");
  return;
}
