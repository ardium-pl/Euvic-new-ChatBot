import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const PDF_DATA_FOLDER = path.join(__dirname, "chatbot-data");
export const JSON_DATA_FOLDER = path.join(__dirname, "json-data");

export const getDataPrompt = `
You are an expert in data extraction. Your task is to read the following text and extract customer data according to the specified schema.
While extracting data, please obey those rules:
    1. scaleOfImplementation can be described by different values, e.g. how many users would use this project or the complexity of the project, not the price of the project.
    2. While assigning technologies take into consideration only technologies that were used directly in the project and in the specific client. Don't assign technologies that were not directly written in the project.
Please ensure the extracted data is accurate and conforms to the schema requirements.
`;
