import { createConnection } from "../../sql-translator/database/mySql";
import { logger } from "../utils/logger";

export async function checkIfFileExists(
  sharepointId: string
): Promise<boolean | null> {
  const connection = await createConnection();
  if (!connection) {
    return null;
  }
  try {
    const result: any = await connection.execute(
      `SELECT * FROM pliki WHERE sharepoint_id = ?`,
      [sharepointId]
    );

    return result[0].length > 0;
  } catch (error) {
    logger.error("➡️ Error checking if user chat ID exists:", error);
    await connection.end();
    return null;
  } finally {
    await connection.end();
  }
}
