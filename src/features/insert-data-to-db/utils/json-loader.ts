import fs from "fs";
import path from "path";
import { FileDataType } from "../../../core/models/dataTypes";

export function loadJSONFiles(directory: string): FileDataType[] {
  const files = fs.readdirSync(directory);
  const jsonData: FileDataType[] = [];

  files.forEach((file) => {
    const filePath = path.join(directory, file);
    if (file.endsWith(".json")) {
      const data = fs.readFileSync(filePath, "utf-8");
      try {
        const parsedData: FileDataType = JSON.parse(data);
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
