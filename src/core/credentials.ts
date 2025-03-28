import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const PDF_DATA_FOLDER = path.resolve(__dirname, "data/chatbot-data");
export const JSON_DATA_FOLDER = path.resolve(__dirname, "data/json-data");

export const getDataPrompt = process.env.GET_DATA_PROMPT;

export const IMAGES_FOLDER = path.resolve(__dirname, "data/images");
export const OUTPUT_TEXT_FOLDER = path.resolve(__dirname, "data/output-text");
export const XML_FILES_FOLDER = path.resolve(__dirname, "data/xml-files");
