import { PoolConnection, RowDataPacket } from "mysql2/promise";
import { logger } from "../../../insert-data-to-db/utils/logger";
import { pool } from "../../../config";
import { ChatHistory } from "../../../types";
import { Chat } from "openai/resources";


// Utility to acquire a connection from the pool
async function withConnection<T>(callback: (connection: PoolConnection) => Promise<T>): Promise<T> {
    let connection: PoolConnection | null = null;

    try {
        connection = await pool.getConnection();
        const result = await callback(connection);
        return result;
    } catch (error) {
        logger.error(`❌ Database operation failed: ${error}`);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

export class ChatHistoryHandler {
    static async createTestConnection(): Promise<void> {
        await withConnection(async (connection) => {
            const [rows] = await connection.query<RowDataPacket[]>("SELECT 1");
            if (rows.length && rows[0]["1"] === 1) {
                logger.info("✅ Successfully established a test connection.");
            } else {
                throw new Error("Test connection failed.");
            }
        });
    }

    static async insertOrGetUser(whatsappNumberId: number): Promise<number | null> {
        return withConnection(async (connection) => {
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
        });
    }

    static async insertQuery(userId: number, query: string, answer: string): Promise<void> {
        await withConnection(async (connection) => {
            const [result]: any = await connection.execute("INSERT INTO queries (user_id, query, answer) VALUES (?, ?, ?)", [
                userId,
                query,
                answer,
            ]);

            if (result.affectedRows > 0) {
                logger.info("➡️ New answer-query pair inserted successfully.");
            } else {
                throw new Error("Failed to insert answer-query pair.");
            }
        });
    }

    static async getRecentQueries(whatsappNumberId: number): Promise<ChatHistory[]> {
        return withConnection(async (connection) => {
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
            }));
        });
    }
}

export async function insertDataMySQL(whatsappNumberId: number, userQuery: string, aiAnswer: string): Promise<void> {
    const userId = await ChatHistoryHandler.insertOrGetUser(whatsappNumberId);
    if (userId) {
        await ChatHistoryHandler.insertQuery(userId, userQuery, aiAnswer);
    } else {
        logger.error("❌ Failed to insert or retrieve user.");
    }
}
