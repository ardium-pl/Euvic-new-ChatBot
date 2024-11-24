import fs from "fs";
import path from "path";
import { DataJson } from "../models/dataDBMoldes";

export function loadJSONFiles(directory: string): DataJson[] {
  const files = fs.readdirSync(directory);
  const jsonData: DataJson[] = [];

  files.forEach((file) => {
    const filePath = path.join(directory, file);
    if (file.endsWith(".json")) {
      const data = fs.readFileSync(filePath, "utf-8");
      try {
        const parsedData = JSON.parse(data);
        if (
          parsedData.fileName &&
          parsedData.ocrText &&
          Array.isArray(parsedData.customers)
        ) {
          jsonData.push({
            fileName: parsedData.fileName,
            ocrText: parsedData.ocrText,
            customers: parsedData.customers, // Dodajemy wszystkich customers bez modyfikacji
          });
        } else {
          console.error(`Invalid structure in file: ${filePath}`);
        }
      } catch (error) {
        console.error(`Error parsing JSON from file ${file}:`, error);
      }
    }
  });

  return jsonData; // Zwróć wszystkie wczytane dane w postaci tablicy obiektów DataJson
}
