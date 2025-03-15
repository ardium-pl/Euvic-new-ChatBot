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

function promptForStringQuestion(
  projectObject: any
): ChatCompletionMessageParam[] {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `Jesteś specjalistą w generowaniu pytań i odpowiedzi na podstawie obiektu projektu`,
    },
    {
      role: "system",
      content: `The comprehensive JSON formatted schema of our database:
      ${JSON.stringify(projectObject, null, 2)}
      `,
    },
    {
      role: "user",
      content: "Generate natural question about the date of the project.",
    },
  ];
  return messages;
}

export async function getStringQuestion<QuestionResSchemaType>(
  projectObject: ProjectDataType
): Promise<QuestionResSchemaType | null> {
  console.info(
    "Generowanie zapytania o datę na podstawie danych projektu..."
  );

  const response: QuestionResSchemaType | null = await generateGPTAnswer(
    promptForStringQuestion(projectObject),
    questionResSchema,
    "response"
  );

  return response;
}

// pobiera obiekt projektu
// zbiera zapytanie naturalne i ref odp
// wysyła zapytanie naturalne i
async function testProjectString() {
  const jsonToTest: FileDataType = fs.readJsonSync(JSON_PATH);
  const customers: ProjectDataType[] = jsonToTest.customers;
  const customer: ProjectDataType = customers[0];
}
