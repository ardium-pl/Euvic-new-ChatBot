import { z } from "zod";
import { DbSchema } from "../../src/types.ts";
import * as fs from "fs";
import { ChatCompletionMessageParam } from "openai/resources/index";

// Schemat odpowiedzi dla tłumaczenia na język naturalny
export const naturalLanguageResponseSchema = z.object({
  statement: z.string(),
});

export const GENERATED_SQL_FILENAME = "generatedSql.json";
export const GENERATED_NATURAL_FILENAME = "generatedNatural.json";
export const PROCESSED_QUERIES_FILENAME = "processedQueries.json";
export const COMPARED_QUERIES_FILENAME = "comparedQueries.json";

export const DB_DATA_FILENAME = "../data/string-tests/dbData.json";
export const TEST_PACKAGES_FILENAME = "../data/string-tests/questions.json";

export const RESULTS_FOLDER = "../data/string-tests/results/";

export const SQL_FOR_DATA = "SELECT * FROM railway.full_data_view;";

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

const TestQuestion = z.object({
  question: z.string(),
  answerRef: z.string(),
});

export const TestPackage = z.object({
  projectDescription: TestQuestion,
  dateDescription: TestQuestion,
  scaleDescription: TestQuestion,
  biznesCaseDescription: TestQuestion,
});

export type TestPackageType = z.infer<typeof TestPackage>;

export const Result = z.object({
  question: z.string(),
  answerRef: z.string(),
  sqlQuery: z.string(),
  formattedAnswer: z.string(),
});

export const Results = z.object({
  projectDescription: z.array(Result),
  dateDescription: z.array(Result),
  scaleDescription: z.array(Result),
  biznesCaseDescription: z.array(Result),
});

export type ResultType = z.infer<typeof Result>;
export type ResultsType = z.infer<typeof Results>;

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
