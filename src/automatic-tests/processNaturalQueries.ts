import * as http from "http";
import * as dotenv from "dotenv";
import * as fs from "fs";
import { generateGPTAnswer, sqlResponse } from "../sql-translator/gpt/openAi";
import { ChatCompletionMessageParam } from "openai/resources";
import { promptForSQL } from "../sql-translator/gpt/prompts";
import { ChatHistoryHandler } from "../meta-handling/whatsapp/chat_history/getChatHistory";
import { saveToFile } from "./utils";

const chatHistory = await ChatHistoryHandler.getRecentQueries(0, "");

type QueryType = {
  sql: string;
  natural: string;
};

// Funkcja do odczytu zapytań naturalnych z pliku
function readFromFile<T>(filename: string): T[] {
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

// Funkcja główna
async function processNaturalQueries(
  inputFile: string,
  outputFile: string
): Promise<void> {
  try {
    // Odczyt zapytań naturalnych z pliku
    const queries = readFromFile<QueryType>(inputFile);

    if (!queries || queries.length === 0) {
      console.error("Brak zapytań do przetworzenia.");
      return;
    }

    const results: { natural: string; sql: string; response: any }[] = [];

    for (const query of queries) {
      const naturalQuery = query.natural;
      console.info(`Przetwarzanie zapytania: ${naturalQuery}`);

      // Generowanie zapytania SQL
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

      // Dodanie wyniku do listy trójek
      results.push({
        sql: query.sql,
        natural: query.natural,
        response: sqlQuery.sqlStatement,
      });
    }

    // Zapisanie wyników do pliku
    saveToFile(results, outputFile);

    console.info("Przetwarzanie zakończone, wyniki zapisano do pliku.");
  } catch (error) {
    console.error(
      "Wystąpił błąd podczas przetwarzania zapytań naturalnych:",
      error
    );
  }
}

// Przetwarzanie zapytań z pliku `translated_queries` i zapis wyników do `query_results.json`
const inputFile = "translated_queries.json";
const outputFile = "query_results.json";
processNaturalQueries(inputFile, outputFile);
