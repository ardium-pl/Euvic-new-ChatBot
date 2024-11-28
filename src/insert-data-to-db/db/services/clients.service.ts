import { db } from "../config/database";
import chalk from "chalk";
import { ExistingRow } from "../models/dataDBMoldes";

export async function addClientsToDB(clientNames: Set<string>) {
  for (const clientName of clientNames) {
    try {
      const [clientRows] = await db.execute(
        "SELECT id FROM klienci WHERE nazwa = ?",
        [clientName]
      );

      if ((clientRows as ExistingRow[]).length === 0) {
        await db.execute("INSERT INTO klienci (nazwa) VALUES (?)", [
          clientName,
        ]);
        console.log(
          chalk.green(`✅ Client "${clientName}" added to the database.`)
        );
      } else {
        console.log(
          chalk.yellow(
            `⚠️ Client "${clientName}" already exists in the database.`
          )
        );
      }
    } catch (error) {
      console.error(
        chalk.red(`❌ Error adding client "${clientName}":`, error)
      );
    }
  }
}
