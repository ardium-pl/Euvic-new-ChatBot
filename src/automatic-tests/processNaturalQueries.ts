import {
  generateGPTAnswer,
  sqlResponse,
  SqlResponse,
} from "../sql-translator/gpt/openAi";
import { promptForSQL } from "../sql-translator/gpt/prompts";
import { ChatHistoryHandler } from "../meta-handling/whatsapp/chat_history/getChatHistory";
import {
  saveToFile,
  readFromFile,
  SqlNaturalType,
  ProcessedQueriesType,
  GENERATED_NATURAL_PATH,
  PROCESSED_QUERIES_PATH,
} from "./utils";

const chatHistory = await ChatHistoryHandler.getRecentQueries(0, "");

// Przeprocesowuje listę zapytań naturalnych na listę SQL
export async function processNaturalQueries(): Promise<void> {
  try {
    // Odczyt zapytań naturalnych
    const queries = readFromFile<SqlNaturalType>(GENERATED_NATURAL_PATH);

    if (!queries || queries.length === 0) {
      console.error("Brak zapytań do przetworzenia.");
      return;
    }

    const results: ProcessedQueriesType[] = [];

    for (const query of queries) {
      const naturalQuery: string = query.natural;
      console.info(`Przetwarzanie zapytania: ${naturalQuery}`);

      // Generowanie SQL na podstawie języka naturalnego
      const sqlQuery: SqlResponse | null = await generateGPTAnswer(
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
    saveToFile(results, PROCESSED_QUERIES_PATH);

    console.info("Przetwarzanie zakończone, wyniki zapisano do pliku.");
  } catch (error) {
    console.error(
      "Wystąpił błąd podczas przetwarzania zapytań naturalnych:",
      error
    );
  }
}
