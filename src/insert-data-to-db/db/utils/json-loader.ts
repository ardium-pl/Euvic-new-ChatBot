import fs from "fs";
import path from "path";
import { DataFile } from "../models/dataMoldes";

export function loadJSONFiles(directory: string) {
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
