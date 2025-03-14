import { loadDbInformation } from "../sql-translator/database/mongoDb.ts";
import { z } from "zod";
import OpenAI from "openai";
import { Example, DbSchema } from "../types.ts";
import * as fs from "fs";

// Schemat odpowiedzi dla tłumaczenia na język naturalny
export const naturalLanguageResponseSchema = z.object({
  statement: z.string(),
});

export const GENERATED_SQL_PATH = "generatedSql.json";
export const GENERATED_NATURAL_PATH = "generatedNatural.json";
export const PROCESSED_QUERIES_PATH = "processedQueries.json";
export const COMPARED_QUERIES_PATH = "comparedQueries.json";

export type SqlNaturalType = {
  sql: string;
  natural: string;
};

export type ProcessedQueriesType = SqlNaturalType & {
  response: string;
};

export type ComparedQueriesType = ProcessedQueriesType & {
  isSame: boolean;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export function saveToFile<T>(data: T, filename: string): void {
  try {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.info(`Dane zapisano do pliku: ${filename}`);
  } catch (error) {
    console.error(
      `Wystąpił błąd podczas zapisywania do pliku ${filename}: ${error}`
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

// Zwraca strukturę bazy danych
export async function getDbStructure(): Promise<
  { dbSchema: DbSchema; examplesForSQL: Example[] } | undefined
> {
  try {
    // Pobieranie struktury bazy danych
    console.info("Pobieranie struktury bazy danych...");
    const { dbSchema, examplesForSQL } = await loadDbInformation();
    if (!dbSchema) {
      console.error("Nie udało się pobrać struktury bazy danych.");
      return undefined;
    } else {
      console.info("Struktura bazy danych została pobrana.");
    }

    return { dbSchema, examplesForSQL };
  } catch (error) {
    console.error("Wystąpił błąd podczas pobierania bazy danych:", error);
    throw error;
  }
}
