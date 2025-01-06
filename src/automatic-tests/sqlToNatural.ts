import OpenAI from "openai";
import { z } from "zod";
import * as dotenv from "dotenv";
import * as fs from "fs";
import { getDbStructure } from "./utils";
import { getGPTAnswer } from "./utils";
import { ChatCompletionMessageParam } from "openai/resources";

dotenv.config();

// Schemat odpowiedzi dla tłumaczenia na język naturalny
const naturalLanguageResponseSchema = z.object({
    statement: z.string(),
});

// Funkcja do zamiany zapytań SQL na język naturalny
async function translateSqlToNaturalLanguage(sqlQuery: string, dbSchema: object): Promise<string | null> {
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

    console.info("Wysyłanie zapytania do GPT w celu konwersji na język naturalny...");
    return await getGPTAnswer<{ statement: string }>(prompt, naturalLanguageResponseSchema).then(
        (response) => response?.statement || null
    );
}

async function translateSqlQueries() {
    try {
        // Wczytanie pliku z zapytaniami SQL
        const sqlQueries: string[] = JSON.parse(fs.readFileSync("generated_sql_queries.json", "utf-8"));

        // pobieranie struktury bazy danych
        const dbSchema = await getDbStructure();
        if (!dbSchema) {
            console.error("Nie można kontynuować bez struktury bazy danych.");
            return;
        }

        const translations: { sql: string; natural: string }[] = [];

        // wysyłanie zapytania do gpt dla każdego pytania sql
        for (const sqlQuery of sqlQueries) {
            const naturalQuery = await translateSqlToNaturalLanguage(sqlQuery, dbSchema.dbSchema);
            if (naturalQuery) {
                translations.push({ sql: sqlQuery, natural: naturalQuery });
                console.info("Tłumaczenie zakończone dla zapytania SQL:", sqlQuery);
            } else {
                console.error("Nie udało się przetłumaczyć zapytania SQL:", sqlQuery);
            }
        }

        // Zapisanie wyników do pliku
        fs.writeFileSync("translated_queries.json", JSON.stringify(translations, null, 2));
        console.info("Przetłumaczone zapytania zapisano w pliku: translated_queries.json");
    } catch (error) {
        console.error("Wystąpił błąd podczas tłumaczenia zapytań SQL na język naturalny:", error);
    }
}

translateSqlQueries();
