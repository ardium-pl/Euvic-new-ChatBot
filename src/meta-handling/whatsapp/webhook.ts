import express, { Request, Response } from "express";
import { WEBHOOK_VERIFY_TOKEN } from "../../config";
// import { insertDataMySQL } from "../database";
import { logger } from "../../insert-data-to-db/utils/logger";
import { WhatsAppClient } from "./whatsapp-client";
import axios from "axios";
import { PORT} from "../../config";
import { LanguageToSQLResponse } from "../../types";
import { ChatHistoryHandler, insertDataMySQL } from "./chat_history/getChatHistory";

const webhookRouter = express.Router();

webhookRouter.post("/webhook", async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const mainRequestBody = data.entry[0]?.changes[0]?.value;

    const errors = mainRequestBody?.errors;
    const statuses = mainRequestBody?.statuses;
    const messages = mainRequestBody?.messages;

    if (errors) {
      logger.warn(`⚙️ Request contained errors: ${JSON.stringify(errors)}`);
    }
    if (statuses) {
      logger.info(`⚙️ Message status: ${statuses[0]?.status}`);
    }
    if (messages) {
      const incomingMessage = messages[0];
      const senderPhoneNumber = incomingMessage?.from;

      if (incomingMessage?.type === "text") {
        const userQuery = incomingMessage.text?.body;
        logger.info(
          `✅ Received message: ${userQuery} from ${senderPhoneNumber}`
        );
        try {
          const response = await axios.post(
            `https://gww-ardium-dev.up.railway.app/language-to-sql`,
            { query: userQuery, whatsappNumberId: senderPhoneNumber }
          );

          // Extract the JSON data from the response
          const aiResponse: LanguageToSQLResponse = response.data;

          logger.info("AI Response: " + JSON.stringify(aiResponse));

          await WhatsAppClient.sendMessage(aiResponse, senderPhoneNumber);

          if(aiResponse.status === 'success'){
            await insertDataMySQL(senderPhoneNumber, userQuery, aiResponse.formattedAnswer, aiResponse.sqlStatement)
          }

          logger.info("✅ AI answer sent or error reported.");
        } catch (error: any) {
          // Handle AI response errors
          const errorMessage = error.response?.data;

          logger.error(
            `❌ Error from AI response: ${JSON.stringify(errorMessage)}`
          );

          await WhatsAppClient.sendMessage(errorMessage, senderPhoneNumber);

          logger.info("⚠️ Error message sent to the user.");
        }
      } else {
        logger.warn(
          `⚠️ Received non-text message type: ${incomingMessage?.type}`
        );
      }
    }

    res.status(200).send("✅");
  } catch (error: any) {
    logger.error(`❌ Error processing HTTP request: ${error.message}`);
    res.status(400).send("❌");
  }
});

webhookRouter.get("/webhook", (req: Request, res: Response) => {
  try {
    const mode = req.query["hub.mode"] as string;
    const verifyToken = req.query["hub.verify_token"] as string;
    const challenge = req.query["hub.challenge"] as string;

    if (mode === "subscribe" && verifyToken === WEBHOOK_VERIFY_TOKEN) {
      logger.info("Webhook verified successfully!");
      res.status(200).send(challenge);
    } else {
      logger.warn("Webhook verification failed. Tokens do not match.");
      res.status(400).send("Webhook verification tokens do not match.");
    }
  } catch (error: any) {
    logger.error(`Error processing verification request: ${error.message}`);
    res.status(400).send("Error processing verification request.");
  }
});

export default webhookRouter;
