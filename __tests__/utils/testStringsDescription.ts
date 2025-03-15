import "dotenv/config";
import { ChatCompletionMessageParam } from "openai/resources";
import { generateGPTAnswer } from "../../src/sql-translator/gpt/openAi";
import { questionResSchema, QuestionResSchemaType } from "./utils";
import { fileURLToPath } from "url";
import path from "path";
import {
  FileDataType,
  ProjectDataType,
} from "../../src/insert-data-to-db/zod-json/dataJsonSchema";
import fs from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JSON_PATH = path.resolve(
  __dirname,
  "../data/generated-json/two_newModel_1/2023_API.json"
);

const QUESTIONS_PATH = path.resolve(
  __dirname,
  "../data/string-tests/questions.json"
);

function promptForStringQuestion(
  projectObject: any
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

export async function getStringQuestion(
  projectObject: ProjectDataType
): Promise<QuestionResSchemaType | null> {
  console.info("Generowanie zapytania o datę na podstawie danych projektu...");

  const response: QuestionResSchemaType | null = await generateGPTAnswer(
    promptForStringQuestion(projectObject),
    questionResSchema,
    "response"
  );

  return response;
}

async function generateStringPairs() {
  const jsonToTest: FileDataType = fs.readJsonSync(JSON_PATH);
  const customers: ProjectDataType[] = jsonToTest.customers;
  const customer: ProjectDataType = customers[0];

  const stringPairs: QuestionResSchemaType[] = (
    await Promise.all(
      customers.map(async (customer) => {
        const stringPair = await getStringQuestion(customer);

        return stringPair;
      })
    )
  ).filter((stringPair) => {
    return stringPair !== null;
  });

  const jsonData: QuestionResSchemaType[] = [];

  if (fs.existsSync(QUESTIONS_PATH)) {
    const fileContent: QuestionResSchemaType[] =
      fs.readJsonSync(QUESTIONS_PATH);
    jsonData.push(...fileContent);
  }

  jsonData.push(...stringPairs);
  fs.writeJsonSync(QUESTIONS_PATH, jsonData, { spaces: 2 });

  console.log(`Zapisano pytanie do pliku: ${QUESTIONS_PATH}`);
}

if (process.argv[1] === __filename) {
  await generateStringPairs();
  process.exit(0);
}
