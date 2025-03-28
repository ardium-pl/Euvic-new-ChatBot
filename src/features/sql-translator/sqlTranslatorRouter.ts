import express, { Router } from "express";
import { ChatHistoryHandler } from "../meta-handling/serives/getChatHistory.js";
import {
  finalResponse,
  generateGPTAnswer,
  languageResponse,
  sqlResponse,
} from "./services/openAi.js";
import {
  promptForAnswer,
  promptForLanguageDetection,
  promptForSQL,
} from "./services/prompts.js";
import { RowDataPacket } from "mysql2";
import { queryDb } from "../../core/database/mySql/mysqlQueries.js";
import { logger } from "../../core/logs/logger.js";

export const sqlTranslatorRouter: Router = express.Router();

sqlTranslatorRouter.post("/language-to-sql", async (req, res) => {
  logger.info("📩 Received a new POST request.");

  const { query: userQuery, whatsappNumberId: senderPhoneNumber } = req.body;
  logger.debug(`📜 User Query: ${userQuery || "No query provided"}`);

  if (!userQuery) {
    logger.warn("🚨 No query found in the request.");
    res.status(400).json({
      status: "error",
      errorCode: "NO_QUERY_ERR",
    });
    return;
  }

  const chatHistory = await ChatHistoryHandler.getRecentQueries(
    senderPhoneNumber,
    userQuery
  );
  logger.info("Chat history: " + JSON.stringify(chatHistory));

  try {
    if (userQuery == "-") {
      res.status(200).json({
        status: "success",
        question: userQuery,
        sqlStatement: "-",
        formattedAnswer: "Rozpoczęto nowy wątek/A new thread has been started",
        rawData: [],
      });
      return;
    }
    // Log before calling OpenAI
    logger.info("🤖 Sending user query to OpenAI for SQL generation...");
    const sqlAnswer = await generateGPTAnswer(
      promptForSQL(userQuery, chatHistory),
      sqlResponse,
      "sql_response"
    );

    // Log the response from OpenAI
    logger.info(`🤖 OpenAI Response: ${JSON.stringify(sqlAnswer)}`);

    if (!sqlAnswer) {
      logger.error(
        "🚨 Failed to create the SQL query. Empty response from OpenAI."
      );
      res.status(500).json({
        status: "error",
        errorCode: "PROCESSING_ERR",
      });
      return;
    }

    // Log if the generated query is not a SELECT
    if (!sqlAnswer.isSelect) {
      logger.warn(`⚠️ Unsupported query type: ${sqlAnswer.sqlStatement}`);
      res.status(400).json({
        status: "error",
        errorCode: "UNSUPPORTED_QUERY_ERR",
      });
      return;
    }

    // Log before executing SQL
    logger.info(`📊 Executing SQL: ${sqlAnswer.sqlStatement}`);
    const rows = await queryDb<RowDataPacket[]>(sqlAnswer.sqlStatement);

    // Log database response
    logger.debug(`📊 SQL Execution Result: ${JSON.stringify(rows)}`);

    if (!rows) {
      logger.error("🚨 Database returned no rows or an error occurred.");
      res.status(500).json({
        status: "error",
        errorCode: "DATABASE_ERR",
      });
      return;
    }
    const language = await generateGPTAnswer(
      promptForLanguageDetection(userQuery),
      languageResponse,
      "language"
    );

    logger.info("Language ", language?.language);
    // Log before formatting the result
    logger.info("🤖 Sending data to OpenAI for formatting...");
    const formattedAnswer = await generateGPTAnswer(
      promptForAnswer(
        userQuery,
        sqlAnswer.sqlStatement,
        rows.result,
        language!.language
      ),
      finalResponse,
      "final_response"
    );

    // Log the response from OpenAI formatting
    logger.debug(`🤖 Formatted Answer: ${JSON.stringify(formattedAnswer)}`);

    if (!formattedAnswer) {
      logger.error("🚨 Failed to generate the formatted answer from OpenAI.");
      res.status(500).json({
        status: "error",
        errorCode: "PROCESSING_ERR",
      });
      return;
    }

    // Log the final success
    logger.info("✅ Successfully processed the request!");

    // Send back the response
    res.status(200).json({
      status: "success",
      question: userQuery,
      sqlStatement: sqlAnswer.sqlStatement,
      formattedAnswer: formattedAnswer.formattedAnswer,
      rawData: rows,
    });
    return;
  } catch (error: any) {
    // Log detailed error information
    logger.error(`❌ Error occurred: ${error.message}`);
    logger.error(error.stack);

    res.status(500).json({
      status: "error",
      errorCode: "PROCESSING_ERR",
    });
    return;
  }
});
