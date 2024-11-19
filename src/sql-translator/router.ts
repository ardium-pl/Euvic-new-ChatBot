import express from 'express';
import {
  generateGPTAnswer,
  sqlResponse,
  finalResponse,
} from "./gpt/openAi.js";
import { promptForSQL, promptForAnswer } from "./gpt/prompts.js";
import { executeSQL } from "./database/mySql.js";
import { logger } from '../insert-data-to-db/utils/logger';

export const router = express.Router();

router.post("/language-to-sql", async (req, res) => {
    logger.info("📩 Received a new POST request.");
  
    const userQuery = req.body?.query;
  
    if (!userQuery) {
      res.status(400).json({ status: "error", errorCode: "NO_QUERY_ERR" });
      return
    }
    try {
      // Call OpenAI to translate natural language to SQL
      const sqlAnswer = await generateGPTAnswer(
        promptForSQL(userQuery),
        sqlResponse,
        "sql_response"
      );
      logger.info(`🤖 Generated SQL: ${sqlAnswer.sqlStatement}`);
  
      if (!sqlAnswer) {
        logger.error("Failed to create the SQL query.");
        res.status(500).json({
          status: "error",
          errorCode: "PROCESSING_ERR",
        });
  
        return;
      }
  
      if (!sqlAnswer.isSelect) {
        res.status(400).json({
          status: "error",
          errorCode: "UNSUPPORTED_QUERY_ERR",
        });
  
        return;
      }
  
      // Execute the generated SQL query
      const rows = await executeSQL(sqlAnswer.sqlStatement);
      if (!rows) {
        res.status(500).json({
          status: "error",
          errorCode: "DATABASE_ERR",
        });
  
        return;
      }
  
      // Call OpenAI to format the result
      const formattedAnswer = await generateGPTAnswer(
        promptForAnswer(userQuery, sqlAnswer.sqlStatement, rows),
        finalResponse,
        "final_response"
      );
      if (!formattedAnswer) {
        logger.error("Failed to generate the formatted answer.");
        res.status(500).json({
          status: "error",
          errorCode: "PROCESSING_ERR",
        });
  
        return;
      }
  
      // Send back the response
      res.status(200).json({
        status: "success",
        question: userQuery,
        sqlStatement: sqlAnswer.sqlStatement,
        formattedAnswer: formattedAnswer.formattedAnswer,
        rawData: rows,
      });
      logger.info("✅ Successfully processed the request!");
    } catch (error) {
      logger.error(error);
      res.status(500).json({
        status: "error",
        errorCode: "PROCESSING_ERR",
      });
    }

});