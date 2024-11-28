import mysql, { createConnection as mysqlCreateConnection, Connection, RowDataPacket } from "mysql2/promise";
import { logger } from "../../../insert-data-to-db/utils/logger";
import { ChatHistory } from "../../../types";
import { chatHistoryDbConfig } from "../../../config";

// Utility to create a connection
async function createConnection(): Promise<Connection> {
    try {
        return await mysqlCreateConnection(chatHistoryDbConfig);;
    } catch (error) {
        logger.error(`❌ Failed to establish a database connection: ${error}`);
        throw error;
    }
}

export class ChatHistoryHandler {

    static async insertOrGetUser(whatsappNumberId: number): Promise<number | null> {
        const connection = await createConnection();
        try {
            const [rows]: any = await connection.execute("SELECT id FROM users WHERE whatsapp_number_id = ?", [
                whatsappNumberId,
            ]);

            if (rows.length) {
                logger.info("➡️ Existing user retrieved successfully.");
                return rows[0].id;
            }

            const [result]: any = await connection.execute("INSERT INTO users (whatsapp_number_id) VALUES (?)", [
                whatsappNumberId,
            ]);

            if (result.insertId) {
                logger.info("➡️ New user inserted successfully.");
                return result.insertId;
            } else {
                throw new Error("Failed to insert new user");
            }
        } finally {
            await connection.end();
        }
    }

    static async insertQuery(userId: number, query: string, answer: string, sqlQuery: string): Promise<void> {
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

    static async getRecentQueries(whatsappNumberId: number): Promise<ChatHistory[]> {
        const connection = await createConnection();
        try {
            const [rows]: any = await connection.execute(
                `SELECT q.query, q.answer, q.created_at
                 FROM queries q
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
                sql_query: row.sql_query
            }));
        } finally {
            await connection.end();
        }
    }
}

export async function insertDataMySQL(whatsappNumberId: number, userQuery: string, aiAnswer: string, sqlQuery: string): Promise<void> {
    const userId = await ChatHistoryHandler.insertOrGetUser(whatsappNumberId);
    if (userId) {
        await ChatHistoryHandler.insertQuery(userId, userQuery, aiAnswer, sqlQuery);
    } else {
        logger.error("❌ Failed to insert or retrieve user.");
    }
}
