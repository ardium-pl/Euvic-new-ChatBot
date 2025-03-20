import "dotenv/config";
import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { describe, it, expect, assert } from "vitest";

import { DbData, DbRowType } from "../utils/types";
import {
  Result,
  ResultType,
  TestQuestion,
  TestQuestionType,
} from "../utils/utils";
import { ChatCompletionMessageParam } from "openai/resources";
import { generateGPTAnswer } from "../../src/sql-translator/gpt/openAi";
import { z, ZodBoolean, ZodType } from "zod";
import { result } from "lodash";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RESULTS_PATH = path.resolve(
  __dirname,
  "../data/string-tests/results.json"
);

function promptForAnalyzeResults(
  result: ResultType
): ChatCompletionMessageParam[] {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `Jesteś specjalistą w porównywaniu dwóch odpowiedzi na jedno pytanie. Twoim zadaniem jest określenie czy zformatowana odpowiedź dostarcza takich samych odpowiedzi na pytanie co odpowiedź referencyjna.`,
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
        "Porównaj answerRef i formattedAnswer i określ czy w taki sam sposób odpowiadają na pytanie. Odpowiedz true albo false.",
    },
  ];
  return messages;
}

async function isAnswersSame(
  result: ResultType
): Promise<{ areTheSame: boolean } | null> {
  const response: { areTheSame: boolean } | null = await generateGPTAnswer(
    promptForAnalyzeResults(result),
    z.object({ areTheSame: z.boolean() }),
    "response"
  );

  return response;
}

// pobiera pytania i odpowiedzi testowe z pliku
const results: ResultType[] = fs.readJsonSync(RESULTS_PATH);
try {
  z.array(Result).parse(results);
  console.log(`Udało się pobrać rezultatów z pliku: ${RESULTS_PATH}`);
} catch {
  console.log(`Nie udało się pobrać rezultatów z pliku: ${RESULTS_PATH}`);
}

describe("compare results", () => {
  it.each(results)("%s", async (result) => {
    console.log(`Odpowiedź referencyjna: ${result.answerRef}`);
    const areTheSame = await isAnswersSame(result);
    assert.isTrue(
      areTheSame?.areTheSame,
      `❌ Test failed for:\nPytanie:\n${result.question}\n\nOdpowiedź referencyjna:\n${result.answerRef}\n\nOdpowiedź wygenerowana:\n${result.formattedAnswer}`
    );
  });
});
