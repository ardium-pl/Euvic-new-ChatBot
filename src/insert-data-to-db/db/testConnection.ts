import {
  addBusinessCasesToDB,
  addFilesToDB,
  addIndustriesToDB,
  addTechnologiesToDB,
} from "./messagesQuerry";
import { DataFile } from "./models";
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

  // Wywołanie funkcji do dodania business cases do bazy
  //await addBusinessCasesToDB(businessCases);
  //await addTechnologiesToDB(technologies);
  //await addIndustriesToDB(industries);
  await addFilesToDB(jsonData.filesData);
  console.log("Business cases added to the database.");
  return;
}

// Uruchamiamy przetwarzanie danych
processData().catch((error) => console.error("Error processing data:", error));
