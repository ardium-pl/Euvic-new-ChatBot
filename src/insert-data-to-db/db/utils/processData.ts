import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import { addTechnologyProjectsToDB } from "../services/technologyProjects.service";
import { loadJSONFiles } from "./json-loader";
import {
  DataClient,
  DataFile,
  DataFileProject,
  DataJson,
  Project,
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
  const jsonData: DataJson[] = loadJSONFiles(jsonDataDirectory);

  const businessCases = jsonData.reduce((acc: Set<string>, file: DataJson) => {
    file.customers.forEach((customer) => {
      if (customer.businessCase) {
        acc.add(customer.businessCase);
      }
    });
    return acc;
  }, new Set<string>());

  const technologies = jsonData.reduce((acc: Set<string>, file: DataJson) => {
    file.customers.forEach((customer) => {
      if (customer.technologies) {
        customer.technologies.name.forEach((tech) => acc.add(tech));
      }
    });
    return acc;
  }, new Set<string>());

  const industries = jsonData.reduce((acc: Set<string>, file: DataJson) => {
    file.customers.forEach((customer) => {
      if (customer.industry) {
        acc.add(customer.industry);
      }
    });
    return acc;
  }, new Set<string>());

  const files: DataFile[] = jsonData.reduce(
    (acc: DataFile[], file: DataJson) => {
      if (file.fileName && file.ocrText) {
        acc.push({
          nazwa: file.fileName,
          zawartosc_ocr: file.ocrText,
        });
      }
      return acc;
    },
    []
  );

  const clientsData: DataClient[] = jsonData.reduce(
    (acc: DataClient[], file: DataJson) => {
      file.customers.forEach((customer) => {
        if (customer.clientName && customer.industry) {
          acc.push({ name: customer.clientName, industry: customer.industry });
        }
      });
      return acc;
    },
    []
  );

  const projectsData: Project[] = jsonData.reduce(
    (acc: Project[], file: DataJson) => {
      file.customers.forEach((customer) => {
        acc.push({
          projectName: customer.projectName,
          description: customer.description,
          clientName: customer.clientName,
          industryName: customer.industry,
          businessCase: customer.businessCase,
          referenceDate: customer.referenceDate,
          implementationScaleValue: customer.scaleOfImplementationValue,
          implementationScaleDescription:
            customer.scaleOfImplementationDescription,
        });
      });
      return acc;
    },
    []
  );

  const technologyProjects: TechnologyProject[] = jsonData.reduce(
    (acc: TechnologyProject[], file: DataJson) => {
      file.customers.forEach((customer) => {
        if (customer.projectName && customer.technologies?.name) {
          acc.push({
            projectName: customer.projectName,
            technologies: customer.technologies.name,
          });
        }
      });
      return acc;
    },
    []
  );

  const fileProjects: DataFileProject[] = jsonData.reduce(
    (acc: DataFileProject[], file: DataJson) => {
      file.customers.forEach((customer) => {
        if (customer.projectName) {
          acc.push({
            projectName: customer.projectName,
            fileName: file.fileName,
          });
        }
      });
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
    await addFilesToDB(files);

    // Etap 2: Dodaj klientów (zależne od industries)
    console.log("Adding clients..."); // TODO: Imo trzeba wywalic połaczenie miedzy kileni a branze(to znaczy walic w tabeli klienci id branze bo jak dany klient jest do wielu branzy to problem)
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
