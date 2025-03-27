import "dotenv/config";
import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { number, z } from "zod";

import {
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

import {
  TestPackage,
  TestPackageType,
  ResultType,
  ResultsType,
} from "../utils/types";
import {
  TEST_PACKAGES_PATH,
  RESULTS_PROJECT_PATH,
  RESULTS_DATE_PATH,
  RESULTS_SCALE_PATH,
  RESULTS_BIZNES_CASE_PATH,
} from "../utils/utils";

function getRandomElements(arr: TestPackageType[], count: number) {
  const indices = new Set<number>();

  while (indices.size < count) {
    indices.add(Math.floor(Math.random() * arr.length));
  }

  return [...indices].map((i) => arr[i]);
}

// generuje i zapisuje odpowiedzi aplikacji na zapytania naturalne wyciągnięte z pliku referencyjnego
async function createResults() {
  // pobiera pytania i odpowiedzi testowe z pliku
  const testPackages: TestPackageType[] = fs.readJsonSync(TEST_PACKAGES_PATH);
  const testPackagesSample: TestPackageType[] = getRandomElements(
    testPackages,
    100
  );
  try {
    z.array(TestPackage).parse(testPackagesSample);
    console.log(
      `Udało się pobrać zapytania i odpowiedzi z pliku: ${TEST_PACKAGES_PATH}`
    );
  } catch {
    console.log(
      `Nie udało się pobrać zapytań i odpowiedzi z pliku: ${TEST_PACKAGES_PATH}`
    );
  }

  const results: ResultsType = {
    projectDescription: [],
    dateDescription: [],
    scaleDescription: [],
    biznesCaseDescription: [],
  };

  for (const testPackage of testPackagesSample) {
    for (const testQuestion in testPackage) {
      const key = testQuestion as keyof typeof testPackage;
      console.log(`Procesowanie pytania: ${testPackage[key].question}`);

      console.log(`Generowanie sql...`);
      const sqlQuery = await generateGPTAnswer(
        promptForSQL(testPackage[key].question, null),
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
        promptForAnswer(
          testPackage[key].question,
          sqlQuery.sqlStatement,
          rows,
          "polish"
        ),
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
        question: testPackage[key].question,
        answerRef: testPackage[key].answerRef,
        sqlQuery: sqlQuery.sqlStatement,
        formattedAnswer: answer.formattedAnswer,
      };

      results[key].push(result);
    }
  }
  fs.writeJsonSync(RESULTS_PROJECT_PATH, results.projectDescription, {
    spaces: 2,
  });
  fs.writeJsonSync(RESULTS_DATE_PATH, results.dateDescription, { spaces: 2 });
  fs.writeJsonSync(RESULTS_SCALE_PATH, results.scaleDescription, { spaces: 2 });
  fs.writeJsonSync(RESULTS_BIZNES_CASE_PATH, results.biznesCaseDescription, {
    spaces: 2,
  });

  console.log(`Zapisano wszystkie wyniki do plików.`);
}

async function testDb() {
  const sqlStatement = "DESCRIBE projekty;";
  const rows = await executeSQL<RowDataPacket[]>(sqlStatement);
  console.log(`Oto rowsy: ${rows}`);
  return;
}

if (process.argv[1] === __filename) {
  await createResults();
  process.exit(0);
}
