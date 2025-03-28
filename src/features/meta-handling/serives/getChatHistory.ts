import {
  Connection,
  createConnection as mysqlCreateConnection,
} from "mysql2/promise";
import { chatHistoryDbConfig } from "../../../core/config";
import { logger } from "../insert-data-to-db/utils/logger";
import { ChatHistory } from "../../../core/types";

// Utility to create a connection
async function createConnection(): Promise<Connection> {
  try {
    return await mysqlCreateConnection(chatHistoryDbConfig);
  } catch (error) {
    logger.error(`❌ Failed to establish a database connection: ${error}`);
    throw error;
  }
}

export class ChatHistoryHandler {
  static async insertOrGetUser(
    whatsappNumberId: number
  ): Promise<number | null> {
    const connection = await createConnection();
    try {
      const [result]: any = await connection.execute(
        `
        INSERT INTO users (whatsapp_number_id)
        VALUES (?)
        ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id);
        `,
        [whatsappNumberId]
      );

      logger.info("➡️ User processed successfully.");
      return result.insertId; // Returns the ID of the existing or newly inserted user
    } catch (error) {
      logger.error("➡️ Error processing user:", error);
      throw error;
    } finally {
      await connection.end();
    }
  }

  static async insertQuery(
    userId: number,
    query: string,
    answer: string,
    sqlQuery: string
  ): Promise<void> {
    const connection = await createConnection();
    try {
      const [result]: any = await connection.execute(
        "INSERT INTO queries (user_id, query, answer, sql_query) VALUES (?, ?, ?, ?)",
        [userId, query, answer, sqlQuery]
      );

      if (result.affectedRows > 0) {
        logger.info("➡️ New answer-query pair inserted successfully.");
      } else {
        throw new Error("Failed to insert answer-query pair.");
      }
    } finally {
      await connection.end();
    }
  }

  static async getRecentQueries(
    whatsappNumberId: number,
    userQuery: string
  ): Promise<ChatHistory[]> {
    const connection = await createConnection();
    try {
      if (userQuery == "-") {
        await connection.execute(
          `DELETE q
                     FROM chat_history q
                     JOIN users u ON q.user_id = u.id
                     WHERE u.whatsapp_number_id = ?
                     AND q.created_at >= NOW() - INTERVAL 2 HOUR`,
          [whatsappNumberId]
        );
        return [];
      } else {
        const [rows]: any = await connection.execute(
          `SELECT q.query, q.answer, q.created_at
                     FROM chat_history q
                     JOIN users u ON q.user_id = u.id
                     WHERE u.whatsapp_number_id = ?
                     AND q.created_at >= NOW() - INTERVAL 2 HOUR
                     ORDER BY q.created_at DESC
                     LIMIT 5`,
          [whatsappNumberId]
        );

        logger.info("➡️ Chat history retrieved successfully.");
        return rows.map((row: ChatHistory) => ({
          query: row.query,
          answer: row.answer,
          created_at: new Date(row.created_at).toISOString(),
          sql_query: row.sql_query,
        }));
      }
    } finally {
      await connection.end();
    }
  }
}

export async function insertDataMySQL(
  whatsappNumberId: number,
  userQuery: string,
  aiAnswer: string,
  sqlQuery: string
): Promise<void> {
  const userId = await ChatHistoryHandler.insertOrGetUser(whatsappNumberId);
  if (userId) {
    await ChatHistoryHandler.insertQuery(userId, userQuery, aiAnswer, sqlQuery);
  } else {
    logger.error("❌ Failed to insert or retrieve user.");
  }
}
