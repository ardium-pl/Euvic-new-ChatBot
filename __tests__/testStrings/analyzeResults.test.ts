import "dotenv/config";
import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { describe, it, expect, assert } from "vitest";
import { z, ZodBoolean, ZodType } from "zod";
import { generateGPTAnswer } from "../../src/sql-translator/gpt/openAi";
import { ChatCompletionMessageParam } from "openai/resources";

import { DbData, DbRowType } from "../utils/types";
import {
  Result,
  ResultType,
  TestPackage,
  TestPackageType,
} from "../utils/types";
import {
  RESULTS_PROJECT_PATH,
  RESULTS_DATE_PATH,
  RESULTS_SCALE_PATH,
  RESULTS_BIZNES_CASE_PATH,
} from "../utils/utils";

function promptForAnalyzeResults(
  result: ResultType
): ChatCompletionMessageParam[] {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `Jesteś specjalistą w porównywaniu dwóch odpowiedzi na jedno pytanie. Twoim zadaniem jest określenie czy zformatowana odpowiedź dostarcza takich samych odpowiedzi na pytanie co odpowiedź referencyjna. W zformatowanej odopwiedzi może być wiećej informacji niż to konieczne, ale musisz sprawdzić czy jest w niej zawarte to co w odpowiedzi referencyjne.`,
    },
    {
      role: "system",
      content: `Zformatowany w formie JSON obiekt zawierający pytanie, odpowiedź referencyjną, zapytanie sql które cię nie interesuje oraz zformatowaną odpowiedź.:
      ${JSON.stringify(result, null, 2)}
      `,
    },
    {
      role: "user",
      content:
        "Porównaj answerRef i formattedAnswer i określ czy odpowiedź sformatowana zawiera informacje zawarte w answerRef. Odpowiedz true albo false.",
    },
  ];
  return messages;
}

function promptForNoData(result: ResultType): ChatCompletionMessageParam[] {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `Jesteś specjalistą w porównywaniu dwóch odpowiedzi na jedno pytanie. Twoim zadaniem jest określenie czy zformatowana odpowiedź odpowiada na pytanie. Maszy sprawdzić czy odpowiedź mówi o braku informacji na dany temat.`,
    },
    {
      role: "system",
      content: `Zformatowany w formie JSON obiekt zawierający pytanie, odpowiedź referencyjną, zapytanie sql które cię nie interesuje oraz zformatowaną odpowiedź.:
      ${JSON.stringify(result, null, 2)}
      `,
    },
    {
      role: "user",
      content:
        "Określ czy formattedAnswer mówi o nie znalezieniu informacji dotyczących projektu (false). Jeśli odpowiedź zawiera faktyczną odpowiedź zwróć true",
    },
  ];
  return messages;
}

async function isAnswersSame(
  result: ResultType
): Promise<{ areTheSame: boolean } | null> {
  const response: { areTheSame: boolean } | null = await generateGPTAnswer(
    // promptForAnalyzeResults(result),
    promptForNoData(result),
    z.object({ areTheSame: z.boolean() }),
    "response"
  );

  return response;
}

// pobiera pytania i odpowiedzi testowe z pliku
const resultsProject: ResultType[] = fs.readJsonSync(RESULTS_PROJECT_PATH);
const resultsDate: ResultType[] = fs.readJsonSync(RESULTS_DATE_PATH);
const resultsScale: ResultType[] = fs.readJsonSync(RESULTS_SCALE_PATH);
const resultsBiznesCase: ResultType[] = fs.readJsonSync(
  RESULTS_BIZNES_CASE_PATH
);

try {
  z.array(Result).parse(resultsProject);
  z.array(Result).parse(resultsDate);
  z.array(Result).parse(resultsScale);
  z.array(Result).parse(resultsBiznesCase);

  console.log(`Udało się pobrać rezultaty z plików.`);
} catch {
  console.log(`Nie udało się pobrać rezultatów z plików.`);
}

// describe("compare project description results", () => {
//   it.each(resultsProject)("", async (result) => {
//     console.log(`Odpowiedź referencyjna: ${result.answerRef}`);
//     const areTheSame = await isAnswersSame(result);
//     assert.isTrue(
//       areTheSame?.areTheSame,
//       `❌ Test failed for:\nPytanie:\n${result.question}\n\nOdpowiedź referencyjna:\n${result.answerRef}\n\nOdpowiedź wygenerowana:\n${result.formattedAnswer}`
//     );
//   });
// });

// describe("compare date description results", () => {
//   it.each(resultsDate)("", async (result) => {
//     console.log(`Odpowiedź referencyjna: ${result.answerRef}`);
//     const areTheSame = await isAnswersSame(result);
//     assert.isTrue(
//       areTheSame?.areTheSame,
//       `❌ Test failed for:\nPytanie:\n${result.question}\n\nOdpowiedź referencyjna:\n${result.answerRef}\n\nOdpowiedź wygenerowana:\n${result.formattedAnswer}`
//     );
//   });
// });

// describe("compare scale description results", () => {
//   it.each(resultsScale)("", async (result) => {
//     console.log(`Odpowiedź referencyjna: ${result.answerRef}`);
//     const areTheSame = await isAnswersSame(result);
//     assert.isTrue(
//       areTheSame?.areTheSame,
//       `❌ Test failed for:\nPytanie:\n${result.question}\n\nOdpowiedź referencyjna:\n${result.answerRef}\n\nOdpowiedź wygenerowana:\n${result.formattedAnswer}`
//     );
//   });
// });

describe("compare business case description results", () => {
  it.each(resultsBiznesCase)("", async (result) => {
    console.log(`Odpowiedź referencyjna: ${result.answerRef}`);
    const areTheSame = await isAnswersSame(result);
    assert.isTrue(
      areTheSame?.areTheSame,
      `❌ Test failed for:\nPytanie:\n${result.question}\n\nOdpowiedź referencyjna:\n${result.answerRef}\n\nOdpowiedź wygenerowana:\n${result.formattedAnswer}`
    );
  });
});
