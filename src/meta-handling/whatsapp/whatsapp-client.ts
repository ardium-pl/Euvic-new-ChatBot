import axios from "axios";
import { logger } from "../../insert-data-to-db/utils/logger";
import { META_ENDPOINT, PHONE_NUMBER_ID, ACCESS_TOKEN } from "../../config";
import { LanguageToSQLResponse } from "../../types";
import { getUserFriendlyMessage } from "../../types.ts";

export class WhatsAppClient {
  /**
   * Sends a message via WhatsApp based on the AI response.
   * @param aiResponse The AI response containing the status and message.
   * @param senderPhoneNumber The recipient's phone number.
   */
  static async sendMessage(
    aiResponse: LanguageToSQLResponse | string, // Allow error messages to be sent
    senderPhoneNumber: string
  ): Promise<"success" | "error"> {
    const url = `${META_ENDPOINT}${PHONE_NUMBER_ID}/messages`;

    const createPayload = (message: string) => ({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: senderPhoneNumber,
      type: "text",
      text: {
        preview_url: false,
        body: message,
      },
    });

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    };

    try {
      const message =
        typeof aiResponse === "string"
          ? aiResponse
          : aiResponse.status === "success"
          ? aiResponse.formattedAnswer
          : getUserFriendlyMessage(aiResponse.errorCode);

      const payload = createPayload(message);
      logger.info("Payload: " + JSON.stringify(payload));

      const response = await axios.post(url, payload, { headers });

      if (response.status === 200) {
        logger.info("✅ Message sent successfully!");
        return "success";
      } else {
        logger.error(
          `❌ Failed to send message: ${response.status} - ${response.statusText}`
        );
        return "error";
      }
    } catch (error: any) {
      logger.error(`❌ Error while sending message: ${error.message}`);

      // Send a fallback message to the user
      const fallbackMessage =
        "Wystąpił problem z przesłaniem odpowiedzi, spróbuj ponownie.";

      try {
        const fallbackPayload = createPayload(fallbackMessage);
        await axios.post(url, fallbackPayload, { headers });
        logger.warn("⚠️ Fallback message sent to the user.");
      } catch (fallbackError: any) {
        logger.error(
          `❌ Failed to send fallback message: ${fallbackError.message}`
        );
      }

      return "error";
    }
  }
}
