import { z } from "zod";
import { getDbStructure } from "./utils";
import { ChatCompletionMessageParam } from "openai/resources";
import * as fs from "fs";
import { getGPTAnswer } from "./utils";
import { DbSchema } from "../types";

const sqlQueryResponseSchema = z.object({
  statements: z.array(z.string()),
});

const GENERETED_SQL_PATH = "genereted_sql.json";

// Na podstawie struktury bazy danych generuje przykładowe zapytania SQL
async function getSqlQueries(dbSchema: DbSchema): Promise<string[] | null> {
  const prompt: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `You are an AI assistant specializing in SQL query generation. Based on the provided database schema, generate 10 realistic, simple and correct SQL queries. The database schema is given below:\n\n${JSON.stringify(
        dbSchema,
        null,
        2
      )}`,
    },
    {
      role: "user",
      content: "Generate 10 SQL queries for the given database schema.",
    },
  ];

  console.info(
    "Generowanie przykładowych zapytań SQL na podstawie struktury ..."
  );
  const response = await getGPTAnswer<{ statements: string[] }>(
    prompt,
    sqlQueryResponseSchema
  );

  // Zwrot tablicy stringów wygenerowanych przez GPT
  return response?.statements || null;
}

// Zapisuje dane do pliku JSON
function saveToFile(data: string[], filename: string) {
  try {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.info(`Dane zapisano do pliku: ${filename}`);
  } catch (error) {
    console.error(
      `Wystąpił błąd podczas zapisywania do pliku ${filename}:`,
      error
    );
  }
}

// Generuje i zapisuje do pliku JSON przykładowe zapytania SQL na podstawie struktury bazy danych
export async function generateSqlQueries(): Promise<void> {
  try {
    // Pobieranie struktury bazy danych
    const dbStructure = await getDbStructure();
    if (!dbStructure) {
      console.error("Nie udało się dostać dbStructure.");
      return;
    }

    // Generowanie zapytań SQL
    const sqlQueries = await getSqlQueries(dbStructure.dbSchema);
    if (!sqlQueries || sqlQueries.length === 0) {
      console.error("Nie wygenerowano żadnych zapytań SQL.");
      return;
    } else {
      console.info("Zapytania SQL wygenerowane pomyślnie!");
    }
    // Zapisywanie wygenerowanych zapytań SQL do JSON
    saveToFile(sqlQueries, GENERETED_SQL_PATH);
    if (!fs.existsSync(GENERETED_SQL_PATH)) {
      console.error(
        `Nie udał się zapisać danych do ścieżki: ${GENERETED_SQL_PATH}.`
      );
      return;
    }
  } catch (error) {
    console.error("Wystąpił błąd podczas generowania zapytań SQL: ", error);
  }
}
