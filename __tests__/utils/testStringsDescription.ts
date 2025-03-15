import { ChatCompletionMessageParam } from "openai/resources";
import { generateGPTAnswer } from "../../src/sql-translator/gpt/openAi";
import { questionResSchema, QuestionRedSchemaType } from "./utils";

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

export async function getStringQuestion(
  projectObject: any
): Promise<QuestionRedSchemaType | null> {
  console.info(
    "Generowanie zapytania o datę na podstawie obiektu projektu ..."
  );

  const response = await generateGPTAnswer(
    promptForStringQuestion(projectObject),
    questionResSchema,
    "response"
  );

  return response;
}

// Generuje i zwraca zapytanie naturalne wraz z poprawną odpowiedzią na podstawie obiektu projektu
export async function generateStringQuestion(): Promise<void> {
  try {
  } catch (error) {
    console.error("Wystąpił błąd podczas generowania zapytań SQL: ", error);
  }
}


// pobiera obiekt projektu
// zbiera zapytanie naturalne i ref odp
// wysyła zapytanie naturalne i 
async function testProjectString() {
  
}