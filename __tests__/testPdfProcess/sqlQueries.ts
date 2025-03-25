import { z } from "zod";
import * as fs from "fs";
import { generateGPTAnswer } from "../../src/sql-translator/gpt/openAi";
import { DbSchema } from "../../src/types";
import { GENERATED_SQL_FILENAME, promptFor10Sql } from "../utils/utils";
import { saveToFile } from "../utils/utils";
import { loadDbInformation } from "../../src/sql-translator/database/mongoDb";

const sqlQueryResponseSchema = z.object({
  statements: z.array(z.string()),
});
// Na podstawie struktury bazy danych generuje przykładowe zapytania SQL
async function get10SqlQueries(dbSchema: DbSchema): Promise<string[] | null> {
  console.info(
    "Generowanie przykładowych zapytań SQL na podstawie struktury ..."
  );
  const response = await generateGPTAnswer(
    await promptFor10Sql(dbSchema),
    sqlQueryResponseSchema,
    "response"
  );

  // Zwrot tablicy stringów wygenerowanych przez GPT
  return response?.statements || null;
}

// Generuje i zapisuje do pliku JSON 10 przykładowych zapytań SQL na podstawie struktury bazy danych
export async function generateSqlQueries(): Promise<void> {
  try {
    // Pobieranie struktury bazy danych
    const { dbSchema, examplesForSQL } = await loadDbInformation();
    if (!dbSchema) {
      console.error("Nie udało się dostać dbStructure.");
      return;
    }

    // Generowanie zapytań SQL
    const sqlQueries = await get10SqlQueries(dbSchema);
    if (!sqlQueries || sqlQueries.length === 0) {
      console.error("Nie wygenerowano żadnych zapytań SQL.");
      return;
    }
    console.info("Zapytania SQL wygenerowane pomyślnie!");
    // Zapisywanie wygenerowanych zapytań SQL do JSON
    saveToFile<string[]>(sqlQueries, GENERATED_SQL_FILENAME);
  } catch (error) {
    console.error("Wystąpił błąd podczas generowania zapytań SQL: ", error);
  }
}
