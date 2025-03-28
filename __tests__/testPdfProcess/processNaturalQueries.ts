import {
  generateGPTAnswer,
  sqlResponse,
} from "../../src/sql-translator/gpt/openAi";
import { promptForSQL } from "../../src/sql-translator/gpt/prompts";
import { ChatHistoryHandler } from "../../src/meta-handling/whatsapp/chat_history/getChatHistory";
import {
  saveToFile,
  readFromFile,
  GENERATED_NATURAL_FILENAME,
  PROCESSED_QUERIES_FILENAME,
} from "../utils/utils";
import { SqlNaturalType, ProcessedQueriesType } from "../utils/types";

const chatHistory = await ChatHistoryHandler.getRecentQueries(0, "");

// Przeprocesowuje listę zapytań naturalnych na listę SQL
export async function processNaturalQueries(): Promise<void> {
  const results: ProcessedQueriesType[] = [];

  try {
    // Odczyt zapytań naturalnych
    const queries = readFromFile<SqlNaturalType>(GENERATED_NATURAL_FILENAME);

    if (!queries || queries.length === 0) {
      console.error("Brak zapytań do przetworzenia.");
      return;
    }

    for (const query of queries) {
      const naturalQuery: string = query.natural;
      console.info(`Przetwarzanie zapytania: ${naturalQuery}`);

      // Generowanie SQL na podstawie języka naturalnego
      const sqlQuery = await generateGPTAnswer(
        promptForSQL(naturalQuery, chatHistory),
        sqlResponse,
        "sql_response"
      );
      if (!sqlQuery) {
        console.error(
          `Nie udało się wygenerować zapytania SQL dla: ${naturalQuery}`
        );
        continue;
      }
      console.info(`Wygenerowane zapytanie SQL: ${sqlQuery}`);

      // Dodanie wyniku results
      results.push({
        sql: query.sql,
        natural: query.natural,
        response: sqlQuery.sqlStatement,
      });
    }

    // Zapisanie wyników do pliku
    saveToFile(results, PROCESSED_QUERIES_FILENAME);

    console.info("Przetwarzanie zakończone, wyniki zapisano do pliku.");
  } catch (error) {
    console.error(
      "Wystąpił błąd podczas przetwarzania zapytań naturalnych:",
      error
    );
  }
}
