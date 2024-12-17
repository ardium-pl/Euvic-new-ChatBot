import express, { Request, Response } from "express";
import { WEBHOOK_VERIFY_TOKEN } from "../../config";
// import { insertDataMySQL } from "../database";
import axios from "axios";
import { logger } from "../../insert-data-to-db/utils/logger";
import { LanguageToSQLResponse } from "../../types";
import { insertDataMySQL } from "./chat_history/getChatHistory";
import { WhatsAppClient } from "./whatsapp-client";

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
            `https://demo-final-development.up.railway.app/language-to-sql`,
            { query: userQuery, whatsappNumberId: senderPhoneNumber }
          );

          const aiResponse: LanguageToSQLResponse = response.data;

          logger.info("AI Response: " + JSON.stringify(aiResponse));

          // Attempt to send the AI response
          const messageStatus = await WhatsAppClient.sendMessage(
            aiResponse,
            senderPhoneNumber
          );

          if (messageStatus === "success" && aiResponse.status === "success") {
            await insertDataMySQL(
              senderPhoneNumber,
              userQuery,
              aiResponse.formattedAnswer,
              aiResponse.sqlStatement
            );
          }

          logger.info("✅ AI answer sent or error reported.");
        } catch (error: any) {
          // Handle AI response errors
          // Handle AI response errors
          const errorMessage = error.response?.data || "Unknown error occurred";

          logger.error(
            `❌ Error from AI response: ${JSON.stringify(errorMessage)}`
          );

          // Send the error message but only log the failure
          const errorStatus = await WhatsAppClient.sendMessage(
            errorMessage,
            senderPhoneNumber
          );

          if (errorStatus === "error") {
            logger.warn("⚠️ Failed to send the error message to the user.");
          } else {
            logger.info("⚠️ Error message sent to the user.");
          }
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
