import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const PDF_DATA_FOLDER = path.join(__dirname, "chatbot-data");
export const JSON_DATA_FOLDER = path.join(__dirname, "json-data");

export const getDataPrompt = `
You are an expert in data extraction. Your task is to read the following text and extract customer data according to the specified schema:

- **technologies** (array of strings): List all technologies mentioned in the text.
- **businessCases** (array of strings): Identify and list all business cases described.
- **referenceDate** (string, optional): Extract any date references, if available.
- **scaleOfImplementation** (string, optional): Note any mention of implementation scale.
- **clients** (array of strings): List all clients mentioned.
- **industry** (string, optional): Specify the industry if mentioned.

Please ensure the extracted data is accurate and conforms to the schema requirements.
`;
