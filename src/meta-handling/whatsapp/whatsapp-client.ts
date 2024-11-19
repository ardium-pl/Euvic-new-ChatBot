import axios from "axios";
import { logger } from "../../insert-data-to-db/utils/logger";
import { META_ENDPOINT, PHONE_NUMBER_ID, ACCESS_TOKEN } from "../../config";
import { LanguageToSQLResponse } from "../../types";

export class WhatsAppClient {
  static async sendMessage(
    aiResponse: LanguageToSQLResponse,
    senderPhoneNumber: string
  ): Promise<void> {
    const url = `${META_ENDPOINT}${PHONE_NUMBER_ID}/messages`;
    try {
      if (aiResponse.status === "success") {
        const payload = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: senderPhoneNumber,
          type: "text",
          text: {
            preview_url: false,
            body: aiResponse.formattedAnswer,
          },
        };

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        };
        const response = await axios.post(url, payload, { headers });
        if (response.status === 200) {
          logger.info("✅ AI answer sent successfully!");
        } else {
          logger.error(
            `❌ Failed to send message: ${response.status} ${response.statusText}`
          );
        }
      }
    } catch (error: any) {
      logger.error(`❌ Error while sending message: ${error.message}`);
    }
  }
}
