import * as fs from "fs";
import { generateGPTAnswer } from "../../src/sql-translator/gpt/openAi";
import { ChatCompletionMessageParam } from "openai/resources";
import { naturalLanguageResponseSchema } from "../utils/utils";
import { DbSchema } from "../../src/types";
import { GENERATED_SQL_FILENAME } from "../utils/utils";
import { GENERATED_NATURAL_FILENAME } from "../utils/utils";
import { loadDbInformation } from "../../src/sql-translator/database/mongoDb";

// Zwraca zapytanie naturalne wygenerowane na podstawie SQL
async function translateSqlToNaturalLanguage(
  sqlQuery: string,
  dbSchema: DbSchema
): Promise<string | null> {
  const prompt: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `Jesteś asystentem AI specjalizującym się w tłumaczeniu zapytań SQL na język naturalny. Na podstawie dostarczonego schematu bazy danych oraz zapytania SQL, przetłumacz zapytanie SQL na język naturalny. Pytanie naturalne powinno odzwierciedlać sens zapytania sql. Powinno wyglądać tak jakby to pytanie zadała osoba do bazy danych. Schemat bazy danych znajduje się poniżej:
      ${JSON.stringify(dbSchema, null, 2)}`,
    },
    {
      role: "user",
      content: `Przetłumacz następujące zapytanie SQL na język polski:
      ${sqlQuery}`,
    },
  ];

  console.info(
    "Wysyłanie zapytania do GPT w celu konwersji na język naturalny..."
  );
  const response = await generateGPTAnswer(
    prompt,
    naturalLanguageResponseSchema,
    "response"
  );

  // Zwrot zapytania naturalnego wygenerowanego przez GPT
  return response?.statement || null;
}

export async function translateSqlQueries() {
  try {
    // Wczytanie zapytań SQL z pliku JSON
    const sqlQueries: string[] = JSON.parse(
      fs.readFileSync(GENERATED_SQL_FILENAME, "utf-8")
    );
    if (sqlQueries.length === 0) {
      console.error(
        `Nie udało się odczytać zapytań SQL z pliku: ${GENERATED_SQL_FILENAME}`
      );
      return;
    }

    // Pobieranie struktury bazy danych
    const { dbSchema, examplesForSQL } = await loadDbInformation();
    if (!dbSchema) {
      console.error("Nie można kontynuować bez struktury bazy danych.");
      return;
    }

    const translations: { sql: string; natural: string }[] = [];

    // procesowanie SQL przez GPT
    for (const sqlQuery of sqlQueries) {
      const naturalQuery = await translateSqlToNaturalLanguage(
        sqlQuery,
        dbSchema
      );
      if (!naturalQuery) {
        console.error(`Nie udało się przetłumaczyć zapytania SQL: ${sqlQuery}`);
        continue;
      }
      translations.push({ sql: sqlQuery, natural: naturalQuery });
      console.info("Tłumaczenie zakończone dla zapytania SQL:", sqlQuery);
    }

    // Zapisanie wyników do pliku
    fs.writeFileSync(
      GENERATED_NATURAL_FILENAME,
      JSON.stringify(translations, null, 2)
    );
    console.info(
      `Przetłumaczone zapytania zapisano w pliku: ${GENERATED_NATURAL_FILENAME}`
    );
  } catch (error) {
    console.error(
      "Wystąpił błąd podczas tłumaczenia zapytań SQL na język naturalny:",
      error
    );
  }
}
