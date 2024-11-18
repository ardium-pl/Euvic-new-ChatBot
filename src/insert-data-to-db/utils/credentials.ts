import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const PDF_DATA_FOLDER = path.join(__dirname, "chatbot-data");
export const JSON_DATA_FOLDER = path.join(__dirname, "json-data");

export const getDataPrompt = process.env.GET_DATA_PROMPT;
