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
    aiResponse: LanguageToSQLResponse,
    senderPhoneNumber: string
  ): Promise<void> {
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
        logger.info("odpowiedź ai" + aiResponse); 
      const payload = createPayload(
        aiResponse.status === "success"
          ? aiResponse.formattedAnswer
          : getUserFriendlyMessage(aiResponse.errorCode)
      );

      const response = await axios.post(url, payload, { headers });

      if (response.status === 200) {
        logger.info("✅ Message sent successfully!");
      } else {
        logger.error(
          `❌ Failed to send message: ${response.status} - ${response.statusText}`
        );
      }
    } catch (error: any) {
      logger.error(`❌ Error while sending message: ${error.message}`);
    }
  }
}
