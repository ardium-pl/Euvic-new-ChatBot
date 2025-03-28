import "dotenv/config";
import { zodResponseFormat } from "openai/helpers/zod";
import { openAiClient } from "../../../core/config";
import { CustomersDataType } from "../../../core/models/dataTypes";
import { CustomersData } from "../../../core/models/customersData";

export async function parseOcrText(
  ocrText: string,
  prompt: string
): Promise<CustomersDataType> {
  const completion = await openAiClient.beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
    messages: [
      {
        role: "system",
        content: prompt,
      },
      { role: "user", content: ocrText },
    ],
    response_format: zodResponseFormat(CustomersData, "customersData"),
  });

  const message = completion.choices[0]?.message;
  if (message?.parsed) {
    return message.parsed;
  } else if (message?.refusal) {
    throw new Error(` 🤖 AI refused to process the text: ${message.refusal}`);
  } else {
    throw new Error("Failed to parse OCR text");
  }
}
