import {
  addBusinessCasesToDB,
  addClientsToDB,
  addFileProjectsToDB,
  addFilesToDB,
  addIndustriesToDB,
  addProjectsToDB,
  addTechnologiesToDB,
  addTechnologyProjectsToDB,
} from "./messagesQuerry";
import { DataClient, DataFile, TechnologyProject } from "./models";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

// Konwersja `import.meta.url` na ścieżkę pliku
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonDataDirectory = path.join(__dirname, "../utils/json-data");

function loadJSONFiles(directory: string) {
  const files = fs.readdirSync(directory);
  const jsonData: any[] = [];
  const filesData: DataFile[] = [];

  files.forEach((file) => {
    const filePath = path.join(directory, file);
    if (file.endsWith(".json")) {
      const data = fs.readFileSync(filePath, "utf-8");
      try {
        const parsedData = JSON.parse(data);
        jsonData.push(...parsedData.customers);

        let datafile: DataFile = {
          nazwa: parsedData.fileName || "Unknown File",
          zawartosc_ocr: parsedData.ocrText || "",
        };
        filesData.push(datafile);
      } catch (error) {
        console.error(`Error parsing JSON from file ${file}:`, error);
      }
    }
  });

  return { filesData, jsonData };
}

// Funkcja do przetworzenia danych
async function processData() {
  const jsonData = loadJSONFiles(jsonDataDirectory); // Ładujemy dane z plików

  // Filtrujemy dane, aby uzyskać tylko te obiekty, które zawierają 'businessCase'
  const businessCases = jsonData.jsonData.reduce(
    (acc: Set<string>, customer: any) => {
      if (customer.projects?.businessCase) {
        acc.add(customer.projects.businessCase); // Dodajemy tylko unikalne wartości
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
        acc.add(customer.projects.industry); // Dodajemy tylko unikalne wartości
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

  const fileProjects: { projectName: string; fileName: string }[] =
    jsonData.jsonData.reduce(
      (acc: { projectName: string; fileName: string }[], customer: any) => {
        if (customer.projects?.description && jsonData.filesData) {
          // Iterujemy przez wszystkie pliki i łączymy je z projektami
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

  console.log(fileProjects);

  // Wywołanie funkcji dodania tabel bez --------------
  //await addBusinessCasesToDB(businessCases);
  //await addTechnologiesToDB(technologies);
  //await addIndustriesToDB(industries);
  //await addFilesToDB(jsonData.filesData);

  // wywoływanie funkcji dowania klientów z kluczem zewnetrznym --------- // TODO: ogarnać kolejność zeby na raz wszystko odpalać
  //await addClientsToDB(clientsData);

  // wywoływanie funkcji dowania projektów z kluczem zewnetrznym --------- // TODO: ogarnać kolejność zeby na raz wszystko odpalać
  //await addProjectsToDB(projectsData);

  // tabele wiele do wielu --------- // TODO: ogarnać kolejność zeby na raz wszystko odpalać i imo brakuje klucza dla tablicy wiele do wielu
  //await addTechnologyProjectsToDB(technologyProjects);
  //await addFileProjectsToDB(fileProjects);

  console.log("Business cases added to the database.");
  return;
}

// Uruchamiamy przetwarzanie danych
processData().catch((error) => console.error("Error processing data:", error));
