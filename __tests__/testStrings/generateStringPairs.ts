import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";

import { ChatCompletionMessageParam } from "openai/resources";
import { generateGPTAnswer } from "../../src/sql-translator/gpt/openAi";
import { TestPackage, TestPackageType } from "../utils/utils";
import { DB_DATA_FILENAME, TEST_PACKAGES_FILENAME } from "../utils/utils";
import { DbData, DbRowType } from "../utils/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_DATA_PATH = path.resolve(__dirname, DB_DATA_FILENAME);
const TEST_PACKAGES_PATH = path.resolve(__dirname, TEST_PACKAGES_FILENAME);

// zwraca zformatowany prompt do GPT pytający o generowanie pytań do projektów
function promptForStringQuestion(
  projectObject: DbRowType
): ChatCompletionMessageParam[] {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `Jesteś specjalistą w generowaniu pytań i odpowiedzi na nie.
      Twoim zadaniem jest wygenerowanie 4 pytań i 4 odpowiedzi dotyczących odpowiednio:
      - opisu projektu,
      - opisu dat,
      - opisu skali wdrożenia,
      - opisu biznes case'u.
      Odpowiedzi na pytania powinny być zwięzłe i odpowiadać na pytanie.`,
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
        "Wygeneruj 4 pytania oraz poprawne odpowiedzi dotyczące opisu projektu, opisu dat, opisu skali wdrożenia i opisu biznes case'u.",
    },
  ];
  return messages;
}

// zwraca wygenerowane referencyjne pytanie z odpowiedzią
export async function getPackage(
  dbRow: DbRowType
): Promise<TestPackageType | null> {
  try {
    const response: TestPackageType | null = await generateGPTAnswer(
      promptForStringQuestion(dbRow),
      TestPackage,
      "response"
    );
    return response;
  } catch {
    console.log("Błąd podczas generowania zapytań i odpowiedzi.");
    return null;
  }
}

async function createTestPackages() {
  const dbData: DbRowType[] = fs.readJsonSync(DB_DATA_PATH);

  const dbDataSample: DbRowType[] = dbData.slice(0, 10);
  try {
    DbData.parse(dbDataSample);
    console.log("Data is valid.");
  } catch (error) {
    console.log(`Data is not valid: ${error}`);
    return;
  }

  const testPackages: TestPackageType[] = (
    await Promise.all(
      dbDataSample.map(async (row) => {
        console.log(
          `Generowanie zapytań i odpowiedzi dla projektu: ${row.projekty_nazwa}`
        );
        const testPackage: TestPackageType | null = await getPackage(row);
        try {
          TestPackage.parse(testPackage);
        } catch (error) {
          console.log(`Wystąpił błąd podczas generowania: ${error}`);
          return null;
        }
        console.log(`Wygenerowano zapytania i odpowiedzi.`);
        return testPackage;
      })
    )
  ).filter((testPackage) => {
    return testPackage !== null;
  });

  fs.writeJsonSync(TEST_PACKAGES_PATH, testPackages, { spaces: 2 });

  console.log(`Zapisano pytania do pliku: ${TEST_PACKAGES_PATH}`);
}

if (process.argv[1] === __filename) {
  await createTestPackages();
  process.exit(0);
}
