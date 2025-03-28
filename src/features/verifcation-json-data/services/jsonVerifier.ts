import { zodResponseFormat } from "openai/helpers/zod";
import { openAiClient } from "../../../core/config";
import {
  CustomersData,
  CustomersDataType,
} from "../../zod-json/dataJsonSchema";
import { logger } from "../../utils/logger";

export async function verifyJson(
  ocrText: string,
  currentJson: CustomersDataType,
  instructions: string
): Promise<CustomersDataType> {
  try {
    const verificationPrompt = `
    Tekst OCR:
    ${ocrText}

    Obecny JSON:
    ${JSON.stringify(currentJson, null, 2)}

    Instrukcje do poprawy:
    ${instructions}

    Proszę zweryfikować i poprawić JSON zgodnie z podanym tekstem OCR oraz instrukcjami. Zadbaj, aby wszystkie wartości finansowe były wyrażone w złotych i były zgodne z tekstem. Jeśli JSON jest poprawny, zwróć go bez zmian.
    `;

    const completion = await openAiClient.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: "Jesteś asystentem do weryfikacji danych OCR.",
        },
        { role: "user", content: verificationPrompt },
      ],
      response_format: zodResponseFormat(CustomersData, "customersData"),
    });

    const message = completion.choices[0]?.message;

    if (message?.parsed) {
      return message.parsed;
    } else if (message?.refusal) {
      throw new Error(` 🤖 AI refused to verify the JSON: ${message.refusal}`);
    } else {
      throw new Error("Failed to verify JSON from OCR text.");
    }
  } catch (error: any) {
    logger.error(`Error during JSON verification: ${error.message}`);
    throw new Error("Failed to verify json");
  }
}
