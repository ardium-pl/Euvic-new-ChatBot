// import "dotenv/config";
import { z } from "zod";
import { getDbStructure } from "./utils";
import { ChatCompletionMessageParam } from "openai/resources";
import * as fs from "fs";
import { getGPTAnswer } from "./utils";

const sqlQueryResponseSchema = z.object({
  statements: z.array(z.string()),
});

// Funkcja do generowania zapytań SQL
async function getSqlQueries(dbSchema: object): Promise<string[] | null> {
  const prompt: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `You are an AI assistant specializing in SQL query generation. Based on the provided database schema, generate 10 realistic, simple and correct SQL queries. The database schema is given below:\n\n${JSON.stringify(dbSchema, null, 2)}`,
    },
    {
      role: "user",
      content: "Generate 10 SQL queries for the given database schema.",
    },
  ];

  console.info("Generowanie zapytań SQL...");
  const response = await getGPTAnswer<{ statements: string[] }>(prompt, sqlQueryResponseSchema);

  // Zwrot tablicy stringów z obiektu
  return response?.statements || null;}

// Funkcja zapisująca dane do pliku JSON
function saveToFile(data: any, filename: string) {
  try {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.info(`Dane zapisano do pliku: ${filename}`);
  } catch (error) {
    console.error("Wystąpił błąd podczas zapisywania do pliku:", error);
  }
}

// Funkcja główna do generowania zapytań SQL
async function generateSqlQueries() {
  try {
    const dbStructure = await getDbStructure();
    if (!dbStructure) {
      console.error("Nie można kontynuować bez struktury bazy danych.");
      return;
    }

    const sqlQueries = await getSqlQueries(dbStructure.dbSchema);
    if (!sqlQueries || sqlQueries.length === 0) {
      console.error("Nie wygenerowano żadnych zapytań SQL.");
      return;
    }

    console.info("Zapytania SQL wygenerowane pomyślnie!");
    saveToFile(sqlQueries, "generated_sql_queries.json");
  } catch (error) {
    console.error("Wystąpił błąd podczas generowania zapytań SQL:", error);
  }
}

// Uruchomienie funkcji głównej
generateSqlQueries();
