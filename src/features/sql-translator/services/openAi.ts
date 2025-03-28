import { zodResponseFormat } from "openai/helpers/zod";
import { ChatCompletionMessageParam } from "openai/resources";
import { z, ZodTypeAny } from "zod";
import { openAiClient } from "../../../core/config";
import { logger } from "../../../core/logs/logger";

export const sqlResponse = z.object({
  isSelect: z.boolean(),
  sqlStatement: z.string(),
});
export const finalResponse = z.object({
  formattedAnswer: z.string(),
});

export const languageResponse = z.object({
  language: z.string(),
});

export async function generateGPTAnswer<T extends ZodTypeAny>(
  prompt: ChatCompletionMessageParam[],
  responseFormat: T,
  responseName: string
): Promise<z.infer<T> | null> {
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
    return null;
  }
}
