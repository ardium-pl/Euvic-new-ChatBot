import fs from "fs";
import path from "path";
import { FileData } from "../../zod-json/dataJsonSchema";
export function loadJSONFiles(directory: string): FileData[] {
  const files = fs.readdirSync(directory);
  const jsonData: FileData[] = [];


  files.forEach((file) => {
    const filePath = path.join(directory, file);
    if (file.endsWith(".json")) {
      const data = fs.readFileSync(filePath, "utf-8");
      try {
        const parsedData: FileData = JSON.parse(data);
        if (
          parsedData.fileName &&
          parsedData.ocrText &&
          Array.isArray(parsedData.customers)
        ) {
          jsonData.push({
            fileName: parsedData.fileName,
            ocrText: parsedData.ocrText,
            customers: parsedData.customers,
            fileItemId: parsedData.fileItemId,
            fileLink: parsedData.fileLink,
          });
        } else {
          console.error(`Invalid structure in file: ${filePath}`);
        }
      } catch (error) {
        console.error(`Error parsing JSON from file ${file}:`, error);
      }
    }
  });

  return jsonData;
}
