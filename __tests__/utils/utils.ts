import { z } from "zod";
import { DbSchema } from "../../src/types.ts";
import * as fs from "fs";
import { ChatCompletionMessageParam } from "openai/resources/index";

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

export const questionResSchema = z.object({
  question: z.string(),
  answerRef: z.string(),
});

export type QuestionResSchemaType = z.infer<typeof questionResSchema>


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
