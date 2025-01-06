import * as fs from 'fs';
import { executeSQL } from '../sql-translator/database/mySql'; // Import funkcji executeSQL
import { RowDataPacket } from 'mysql2';

// Funkcja zapisująca dane do pliku JSON
function saveToFile(data: any, filename: string) {
    try {
        fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf-8');
        console.info(`Dane zostały zapisane do pliku: ${filename}`);
    } catch (error) {
        console.error(`Błąd podczas zapisywania do pliku ${filename}:`, error);
    }
}

// Funkcja odczytująca dane z pliku JSON
function readFromFile(filename: string): any[] {
    try {
        const fileContent = fs.readFileSync(filename, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error(`Błąd podczas odczytu pliku ${filename}:`, error);
        return [];
    }
}

// Funkcja porównująca wyniki dwóch zapytań SQL
function compareResults(dbResult1: any, dbResult2: any): boolean {
    try {
        // Porównanie JSON-ów
        return JSON.stringify(dbResult1) === JSON.stringify(dbResult2);
    } catch (error) {
        console.error('Błąd podczas porównywania wyników:', error);
        return false;
    }
}

// Funkcja główna do przetwarzania zapytań SQL
async function processQueryResults(inputFile: string, outputFile: string): Promise<void> {
    try {
        const queries = readFromFile(inputFile);

        if (!queries || queries.length === 0) {
            console.error('Brak zapytań do przetworzenia.');
            return;
        }

        const finalResults: { sql: string; natural: string; response: string; isSame: boolean }[] = [];

        for (const { sql, natural, response } of queries) {
            console.info(`Przetwarzanie zapytań SQL:\n 1) ${sql}\n 2) ${response}`);

            // Wykonanie pierwszego zapytania SQL
            const dbResult1 = await executeSQL<RowDataPacket[]>(sql);
            if (!dbResult1) {
                console.error(`Nie udało się wykonać zapytania SQL: ${sql}`);
                finalResults.push({ sql, natural, response, isSame: false });
                continue;
            }

            // Wykonanie drugiego zapytania SQL
            const dbResult2 = await executeSQL<RowDataPacket[]>(response);
            if (!dbResult2) {
                console.error(`Nie udało się wykonać zapytania SQL: ${response}`);
                finalResults.push({ sql, natural, response, isSame: false });
                continue;
            }

            // Porównanie wyników
            const isSame = compareResults(dbResult1, dbResult2);
            console.info(`Porównanie wyników: ${isSame ? '✅ Zgodne' : '❌ Różne'}`);

            // Dodanie czwórki do wyników końcowych
            finalResults.push({ sql, natural, response, isSame });
        }

        // Zapisanie wyników do pliku
        saveToFile(finalResults, outputFile);
        console.info('Przetwarzanie zakończone, wyniki zapisano do pliku.');
    } catch (error) {
        console.error('Wystąpił błąd podczas przetwarzania zapytań:', error);
    }
}

// Wywołanie funkcji głównej
const inputFile = 'query_results.json';
const outputFile = 'query_comparison_results.json';
processQueryResults(inputFile, outputFile);
