import { loadDbInformation } from "../sql-translator/database/mongoDb.ts";
import { zodResponseFormat } from "openai/helpers/zod";
import { ChatCompletionMessageParam } from "openai/resources";
import { z } from "zod";
import OpenAI from "openai";
import * as dotenv from "dotenv";
import { Example, DbSchema } from "../types.ts";
import * as fs from "fs";


// Schemat odpowiedzi dla tłumaczenia na język naturalny
export const naturalLanguageResponseSchema = z.object({
  statement: z.string(),
});

export const GENERATED_SQL_PATH = "generatedSql.json";
export const GENERATED_NATURAL_PATH = "generatedNatural.json";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export function saveToFile<T>(data: T, filename: string) {
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

// Funkcja do wysyłania zapytań do GPT
export async function getGPTAnswer<T>(
  prompt: ChatCompletionMessageParam[],
  responseSchema: z.ZodType<T>
): Promise<T | null> {
  try {
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o",
      messages: prompt,
      response_format: zodResponseFormat(responseSchema, "response"),
    });

    const response = completion.choices[0].message;

    if (!response.parsed) {
      console.error("Odpowiedź od GPT nie zawiera poprawnego pola 'parsed'.");
      return null;
    }

    return response.parsed;
  } catch (error) {
    console.error("Błąd podczas wysyłania zapytania do GPT:", error);
    throw error;
  }
}
