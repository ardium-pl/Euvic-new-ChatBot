import { queryDb } from "../../../sql-translator/database/mySql";
import { db } from "../config/database";
import chalk from "chalk";

export async function addClientsToDB(clientNames: Set<string>) {
  for (const clientName of clientNames) {
    try {
      await queryDb("INSERT INTO klienci (nazwa) VALUES (?)", [clientName]);
      console.log(
        chalk.green(`✅ Client "${clientName}" added to the database.`)
      );
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        console.log(
          chalk.yellow(
            `⚠️ Client "${clientName}" already exists in the database.`
          )
        );
      } else {
        console.error(
          chalk.red(`❌ Error adding client "${clientName}":`, error)
        );
      }
    }
  }
}
