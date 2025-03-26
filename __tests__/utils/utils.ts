import path from "path";
import { fileURLToPath } from "url";

import { z } from "zod";
import { DbSchema } from "../../src/types.ts";
import * as fs from "fs";
import { ChatCompletionMessageParam } from "openai/resources/index";

// Schemat odpowiedzi dla tłumaczenia na język naturalny
export const naturalLanguageResponseSchema = z.object({
  statement: z.string(),
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const TEST_FILES_INFO_PATH = path.resolve(
  __dirname,
  "../config/testFilesInfo.json"
);
export const PDF_SOURCE = path.resolve(__dirname, "../data/test-pdfs");
export const JSON_STORAGE = path.resolve(__dirname, "../data/generated-json");
export const OUTPUT_TEXT = path.resolve(__dirname, "../../output-text");
export const JSON_SERIE = "two_newModel_3";

export const GENERATED_SQL_FILENAME = "generatedSql.json";
export const GENERATED_NATURAL_FILENAME = "generatedNatural.json";
export const PROCESSED_QUERIES_FILENAME = "processedQueries.json";
export const COMPARED_QUERIES_FILENAME = "comparedQueries.json";

export const DB_DATA_PATH = path.resolve(
  __dirname,
  "../data/string-tests/dbData.json"
);
export const TEST_PACKAGES_PATH = path.resolve(
  __dirname,
  "../data/string-tests/questions.json"
);

const RESULTS_FOLDER = "../data/string-tests/results/";

export const RESULTS_PROJECT_PATH = path.resolve(
  __dirname,
  RESULTS_FOLDER,
  "projectDescription.json"
);
export const RESULTS_DATE_PATH = path.resolve(
  __dirname,
  RESULTS_FOLDER,
  "dateDescription.json"
);
export const RESULTS_SCALE_PATH = path.resolve(
  __dirname,
  RESULTS_FOLDER,
  "scaleDescription.json"
);
export const RESULTS_BIZNES_CASE_PATH = path.resolve(
  __dirname,
  RESULTS_FOLDER,
  "biznesCaseDescription.json"
);

export const SQL_FOR_DATA = "SELECT * FROM railway.projekty;";

export async function promptFor10Sql(
  dbSchema: DbSchema
): Promise<ChatCompletionMessageParam[]> {
  const userQuery: string = "Generate 10 SQL queries.";
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `You are an AI assistant specializing in SQL query generation. Based on the provided database schema, generate 10 realistic, simple and correct SQL queries. The database schema is given below:\n\n${JSON.stringify(
        dbSchema,
        null,
        2
      )}`,
    },
    {
      role: "system",
      content: `
      The comprehensive JSON formatted schema of our database:
      ${JSON.stringify(dbSchema, null, 2)}
      `,
    },
    { role: "user", content: userQuery },
  ];
  return messages;
}

export function saveToFile<T>(data: T, filename: string): void {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.info(`Dane zapisano do pliku: ${filename}`);

  if (!fs.existsSync(filename)) {
    console.error(
      `Nie udał się zapisać danych do ścieżki: ${GENERATED_SQL_FILENAME}.`
    );
  }
}

// Funkcja do odczytu zapytań naturalnych z pliku
export function readFromFile<T>(filename: string): T[] {
  try {
    const fileContent = fs.readFileSync(filename, "utf-8");
    const parsedData: T[] = JSON.parse(fileContent);
    if (!parsedData || parsedData.length === 0) {
      console.log(`Plik jest pusty: ${filename}`);
      return [];
    }
    return parsedData;
  } catch (error) {
    console.error(`Błąd podczas odczytu pliku ${filename}:`, error);
    return [];
  }
}
