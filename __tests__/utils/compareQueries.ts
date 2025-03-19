// Skrypt służący do porównywania odpowiedzi bazy danych na dwa pytania SQL znajdujące się w pliku o formacie
// ProcessedQueriesType
// informacje konfiguacyjne znajdują się w utilsach

import { executeSQL } from "../../src/sql-translator/database/mySql";
import { RowDataPacket } from "mysql2";
import {
  saveToFile,
  readFromFile,
  PROCESSED_QUERIES_PATH,
  COMPARED_QUERIES_PATH,
  ProcessedQueriesType,
  ComparedQueriesType,
} from "./utils";

// Funkcja porównująca wyniki dwóch zapytań SQL
function compareDbResults(
  result1: RowDataPacket[],
  result2: RowDataPacket[]
): boolean {
  try {
    const areResultsSame = JSON.stringify(result1) === JSON.stringify(result2);
    return areResultsSame;
  } catch (error) {
    console.error("Błąd podczas porównywania wyników:", error);
    return false;
  }
}

// Porównuje zapytania SQL z pliku i zapisuje rezultaty
export async function processQueryResults(): Promise<void> {
  try {
    // Odczyt SQL z pliku
    const queries = readFromFile<ProcessedQueriesType>(PROCESSED_QUERIES_PATH);

    if (!queries || queries.length === 0) {
      console.error("Brak zapytań do przetworzenia.");
      return;
    }

    // Pytanie bazy danych
    const finalResults: ComparedQueriesType[] = [];

    for (const query of queries) {
      console.info(
        `Przetwarzanie zapytań SQL:\n 1) ${query.sql}\n 2) ${query.response}`
      );

      // Wykonanie pierwszego zapytania SQL
      const resultRef = await executeSQL<RowDataPacket[]>(query.sql);
      const resultGen = await executeSQL<RowDataPacket[]>(query.response);

      if (!resultRef || !resultGen) {
        console.error(`Nie udało się wykonać zapytania SQL: ${query.sql}`);
        finalResults.push({ ...query, isSame: false });
        continue;
      }

      // Porównywanie wyników
      const isSame: boolean = compareDbResults(resultRef, resultGen);
      console.info(`Porównanie wyników: ${isSame ? "✅ Zgodne" : "❌ Różne"}`);

      // Zapisywanie końcowych wyników do pliku
      finalResults.push({ ...query, isSame });
    }

    // Zapisanie wyników do pliku
    saveToFile(finalResults, COMPARED_QUERIES_PATH);
    console.info("Przetwarzanie zakończone, wyniki zapisano do pliku.");
  } catch (error) {
    console.error("Wystąpił błąd podczas przetwarzania zapytań:", error);
  }
}
