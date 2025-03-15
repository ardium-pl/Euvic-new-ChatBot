import { zodResponseFormat } from "openai/helpers/zod";
import { ChatCompletionMessageParam } from "openai/resources";
import { z, ZodObject, ZodRawShape, ZodType, ZodTypeAny } from "zod";

import { openAiClient } from "../../config";
import { logger } from "../../insert-data-to-db/utils/logger";

export const sqlResponse = z.object({
  isSelect: z.boolean(),
  sqlStatement: z.string(),
});

export type SqlResponse = z.infer<typeof sqlResponse>;

export const finalResponse = z.object({
  formattedAnswer: z.string(),
});

export async function generateGPTAnswer(prompt: ChatCompletionMessageParam[], responseFormat: ZodTypeAny, responseName: string) {
  try {
    const completion = await openAiClient.beta.chat.completions.parse({
      model: "gpt-4o",
      messages: prompt,
      response_format: zodResponseFormat(responseFormat, responseName),
    });

    const response = completion.choices[0].message;

    if (response.refusal) {
      // Custom feedback after disturbing user input
      return null;
    }
    logger.info("Successfully generated an AI response! ✅");
    return response.parsed;
  } catch (error: any) {
    logger.error(error);
    throw error
  }
}
