import "dotenv/config";
import path from "path";
import fs from "fs-extra";
import { TestQuestion, TestQuestionType } from "./utils";
import {
  SqlResponse,
  generateGPTAnswer,
  sqlResponse,
  finalResponse,
} from "../../src/sql-translator/gpt/openAi";
import {
  promptForSQL,
  promptForAnswer,
} from "../../src/sql-translator/gpt/prompts";
import { executeSQL } from "../../src/sql-translator/database/mySql";
import { RowDataPacket } from "mysql2";
import { fileURLToPath } from "url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_QUESTIONS_PATH = path.resolve(
  __dirname,
  "../data/string-tests/questions.json"
);

const RESULTS_PATH = path.resolve(
  __dirname,
  "../data/string-tests/results.json"
);

type ResultType = {
  question: string;
  answerRef: string;
  sqlQuery: string;
  formattedAnswer: string;
};

// generuje i zapisuje odpowiedzi aplikacji na zapytania naturalne wyciągnięte z pliku referencyjnego
async function getDbAnwser() {
  // pobiera pytania i odpowiedzi testowe z pliku
  const testQuestions: TestQuestionType[] =
    fs.readJsonSync(TEST_QUESTIONS_PATH);
  try {
    z.array(TestQuestion).parse(testQuestions);
    console.log(
      `Udało się pobrać zapytania i odpowiedzi z pliku: ${TEST_QUESTIONS_PATH}`
    );
  } catch {
    console.log(
      `Nie udało się pobrać zapytań i odpowiedzi z pliku: ${TEST_QUESTIONS_PATH}`
    );
  }

  const results: ResultType[] = [];
  for (const pair of testQuestions) {
    console.log(`Procesowanie pytania: ${pair.question}`);

    console.log(`Generowanie sql...`);
    const sqlQuery: SqlResponse | null = await generateGPTAnswer(
      promptForSQL(pair.question, null),
      sqlResponse,
      "sql_response"
    );

    if (!sqlQuery) {
      console.log(`Nie udało się wygenerować zapytania.`);
      continue;
    } else {
      console.log(`Wygenerowano zapytanie: ${sqlQuery.sqlStatement}`);
    }

    console.log(`Pytanie bazy danych...`);
    const rows = await executeSQL<RowDataPacket[]>(sqlQuery.sqlStatement);
    if (!rows) {
      console.log(`Nie dostano odpowiedzi od bazy...`);
      continue;
    } else {
      console.log(`Otrzymano odpowiedź od bazy danych!`);
    }

    console.log(`Formatowanie odpowiedzi...`);
    const answer = await generateGPTAnswer(
      promptForAnswer(pair.question, sqlQuery.sqlStatement, rows, "polish"),
      finalResponse,
      "final_response"
    );
    if (!answer) {
      console.log("Nie otrzymano odpowiedzi.");
      continue;
    } else {
      console.log(`Otrzymano odpowiedź: ${answer.formattedAnswer}`);
    }

    const result: ResultType = {
      question: pair.question,
      answerRef: pair.answerRef,
      sqlQuery: sqlQuery.sqlStatement,
      formattedAnswer: answer.formattedAnswer,
    };

    results.push(result);
  }
  fs.writeJsonSync(RESULTS_PATH, results, { spaces: 2 });
  console.log(`Zapisano wyniki do: ${RESULTS_PATH}`);
}

async function testDb() {
  const sqlStatement = "DESCRIBE projekty;";
  const rows = await executeSQL<RowDataPacket[]>(sqlStatement);
  console.log(`Oto rowsy: ${rows}`);
  return;
}

if (process.argv[1] === __filename) {
  await getDbAnwser();
  process.exit(0);
}
