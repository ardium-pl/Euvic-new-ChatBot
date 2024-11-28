import { FileData } from "../zod-json/dataJsonSchema";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import _ from "lodash";
import { generateGPTAnswer } from "../../sql-translator/gpt/openAi";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadJsonFiles = (folderPath: string): FileData[] => {
  const jsonArray: FileData[] = [];

  // Get all files in the folder
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const filePath = path.join(folderPath, file);

    // Ensure the file has a .json extension
    if (path.extname(file) === ".json") {
      try {
        // Read and parse the JSON file
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const jsonData: FileData = JSON.parse(fileContent);

        // Remove the `ocrText` key
        const sanitizedData = _.omit(jsonData, ["ocrText"]) as FileData;

        jsonArray.push(sanitizedData);
      } catch (error) {
        console.error(`Error reading or parsing file: ${filePath}`, error);
      }
    }
  }

  return jsonArray;
};

const saveJsonToFile = (folderPath: string, fileName: string, data: any): void => {
    const filePath = path.join(folderPath, fileName);
    try {
      const jsonData = JSON.stringify(data, null, 2); // Pretty-print JSON
      fs.writeFileSync(filePath, jsonData, "utf-8");
      console.log(`Data successfully saved to ${filePath}`);
    } catch (error) {
      console.error(`Error saving data to file: ${filePath}`, error);
    }
  };
  
  const folderPath = path.resolve(__dirname, "json-data");
  const allJsonData = loadJsonFiles(folderPath);
  
  // Save the stringified data to "ultimateJsonData.json"
  saveJsonToFile(folderPath, "ultimateJsonData.json", allJsonData);

  async function repairData(allJsonData: FileData[]) {
    
  }


