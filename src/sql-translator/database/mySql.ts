import mysql, { Connection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { logger } from "../../insert-data-to-db/utils/logger";

const dbConfig: mysql.ConnectionOptions = {
  host: process.env.MYSQL_HOST as string,
  user: process.env.MYSQL_USER as string,
  password: process.env.MYSQL_PASSWORD as string,
  database: process.env.MYSQL_DATABASE as string,
  port: parseInt(process.env.MYSQL_PORT as string, 10),
};

export async function createConnection(): Promise<Connection | null> {
  let connection: Connection | null = null;
  try {
    connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    logger.error("❌ Error creating a connection.");
    logger.error(error);
    if (connection) {
      await connection.end();
    }
    return null;
  }
}

export async function createTestConnection(): Promise<void> {
  const connection = await createConnection();
  if (connection) {
    await connection.end();
    logger.info("Successfully established a database connection! ✅");
  }
}

export async function executeSQL<T extends RowDataPacket[] | ResultSetHeader>(
    query: string
  ): Promise<T | null> {
    const connection = await createConnection();
    if (connection) {
      try {
        const [rows] = await connection.execute<T>(query);
        logger.info("Successfully fetched the raw data! ✅");
        logger.info(`💾 Number of rows fetched: ${(Array.isArray(rows) ? rows.length : 0)}`);
        return rows;
      } catch (error) {
        logger.error("❌ Error executing the query.");
        logger.error(error);
        return null;
      } finally {
        await connection.end();
      }
    }
    return null;
  }

// export async function fetchPassword(): Promise<string | null> {
//   const query = `SELECT password_hash FROM secrets WHERE id = 1`;
//   const result = await executeSQL<RowDataPacket[]>(query);

//   if (result && result.length > 0 && result[0].password_hash) {
//     logger.info("Password hash fetched from the db.");
//     return result[0].password_hash;
//   } else {
//     logger.error("❌ Failed to fetch the password.");
//     return null;
//   }
// }

// Test the connection
createTestConnection().catch((error) => {
  logger.error("❌ Failed to test the connection.");
  logger.error(error);
});
