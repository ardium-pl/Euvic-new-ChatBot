import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";

import { ChatCompletionMessageParam } from "openai/resources";
import { generateGPTAnswer } from "../../src/sql-translator/gpt/openAi";
import { TestQuestion, TestQuestionType } from "./utils";
import { DbData, DbRowType } from "./types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DATA_PATH = path.resolve(
  __dirname,
  "../data/string-tests/dbData.json"
);

const QUESTIONS_PATH = path.resolve(
  __dirname,
  "../data/string-tests/questions.json"
);

// zwraca zformatowany prompt do GPT pytający o generowanie pytań do projektów
function promptForStringQuestion(
  projectObject: DbRowType
): ChatCompletionMessageParam[] {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `Jesteś specjalistą w generowaniu pytań i odpowiedzi na nie, dotyczących czasu trwania projektu. Odpowiedź do pytania powinna być zwięzła i odpowiadać na pytanie.`,
    },
    {
      role: "system",
      content: `Zformatowany w formie JSON obiekt zawierający dane o projekcie:
      ${JSON.stringify(projectObject, null, 2)}
      `,
    },
    {
      role: "user",
      content:
        "Wygeneruj pytanie oraz poprawną odpowiedź dotyczące czasu trwania projektu.",
    },
  ];
  return messages;
}

// zwraca wygenerowane referencyjne pytanie z odpowiedzią
export async function getStringPair(
  dbRow: DbRowType
): Promise<TestQuestionType | null> {
  const response: TestQuestionType | null = await generateGPTAnswer(
    promptForStringQuestion(dbRow),
    TestQuestion,
    "response"
  );

  return response;
}

async function createStringPairs() {
  const dbData: DbRowType[] = fs.readJsonSync(DB_DATA_PATH);

  const dbBaseSample: DbRowType[] = dbData.slice(0, 10);
  try {
    DbData.parse(dbBaseSample);
    console.log("Data is valid.");
  } catch (error) {
    console.log(`Data is not valid: ${error}`);
    return;
  }

  const stringPairs: TestQuestionType[] = (
    await Promise.all(
      dbBaseSample.map(async (row) => {
        console.log(`Generowanie zapytania o datę dla projektu: ${row.projekty_nazwa}`)
        const stringPair = await getStringPair(row);
        try {
          TestQuestion.parse(stringPair);
        } catch (error) {
          console.log(`Wystąpił błąd podczas generowania: ${error}`)
          return null;
        }
        console.log(`Wygenerowano zapytanie: ${stringPair?.question}`)
        return stringPair;
      })
    )
  ).filter((stringPair) => {
    return stringPair !== null;
  });

  const questionObjects: TestQuestionType[] = [];
  questionObjects.push(...stringPairs);
  fs.writeJsonSync(QUESTIONS_PATH, questionObjects, { spaces: 2 });

  console.log(`Zapisano pytania do pliku: ${QUESTIONS_PATH}`);
}

if (process.argv[1] === __filename) {
  await createStringPairs();
  process.exit(0);
}
