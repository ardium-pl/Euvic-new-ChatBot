import { z } from "zod";
import { ChatCompletionMessageParam } from "openai/resources";
import * as fs from "fs";
import { generateGPTAnswer } from "../sql-translator/gpt/openAi";
import { DbSchema } from "../types";
import { GENERATED_SQL_PATH, promptFor10Sql } from "./utils";
import { saveToFile } from "./utils";
import { loadDbInformation } from "../sql-translator/database/mongoDb";

const sqlQueryResponseSchema = z.object({
  statements: z.array(z.string()),
});

// Na podstawie struktury bazy danych generuje przykładowe zapytania SQL
async function getSqlQueries(dbSchema: DbSchema): Promise<string[] | null> {
  console.info(
    "Generowanie przykładowych zapytań SQL na podstawie struktury ..."
  );
  const response = await generateGPTAnswer<{ statements: string[] }>(
    await promptFor10Sql(dbSchema),
    sqlQueryResponseSchema,
    "response"
  );

  // Zwrot tablicy stringów wygenerowanych przez GPT
  return response?.statements || null;
}

// Generuje i zapisuje do pliku JSON przykładowe zapytania SQL na podstawie struktury bazy danych
export async function generateSqlQueries(): Promise<void> {
  try {
    // Pobieranie struktury bazy danych
    const { dbSchema, examplesForSQL } = await loadDbInformation();
    if (!dbSchema) {
      console.error("Nie udało się dostać dbStructure.");
      return;
    }

    // Generowanie zapytań SQL
    const sqlQueries = await getSqlQueries(dbSchema);
    if (!sqlQueries || sqlQueries.length === 0) {
      console.error("Nie wygenerowano żadnych zapytań SQL.");
      return;
    } else {
      console.info("Zapytania SQL wygenerowane pomyślnie!");
    }
    // Zapisywanie wygenerowanych zapytań SQL do JSON
    saveToFile<string[]>(sqlQueries, GENERATED_SQL_PATH);
    if (!fs.existsSync(GENERATED_SQL_PATH)) {
      console.error(
        `Nie udał się zapisać danych do ścieżki: ${GENERATED_SQL_PATH}.`
      );
      return;
    }
  } catch (error) {
    console.error("Wystąpił błąd podczas generowania zapytań SQL: ", error);
  }
}
