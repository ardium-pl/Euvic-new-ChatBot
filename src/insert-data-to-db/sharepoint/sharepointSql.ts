import { db } from "../db/config/database";
import chalk from "chalk";

export async function checkIfFileExists(sharepointId: string): Promise<boolean> {
    try {
      const result: any = await db.execute(
        `SELECT * FROM pliki WHERE sharepoint_id = ?`,
        [sharepointId]
      );
      return result[0].length > 0;
    } catch (error: any) {
      console.error(chalk.red(`❌ Error checking file existence:`, error));
      return false;
    }
  }
  