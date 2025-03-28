import { RowDataPacket } from "mysql2";
import { createConnection, queryDb } from "../../sql-translator/database/mySql";
import { logger } from "../utils/logger";

export async function checkIfFileExists(
  sharepointId: string
): Promise<boolean | null> {
  try {
    const result = await queryDb<RowDataPacket[]>(
      `SELECT * FROM pliki WHERE sharepoint_id = ?`,
      [sharepointId]
    );

    return result.result.length > 0;
  } catch (error) {
    logger.error("➡️ Error checking if user chat ID exists:", error);
    return null;
  }
}
