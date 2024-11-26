import { db } from "../config/database";
import chalk from "chalk";
import { ExistingRow } from "../models/dataDBMoldes";

export async function addIndustriesToDB(industries: Set<string>) {
  for (const industry of industries) {
    try {
      const [rows] = await db.execute("SELECT id FROM branze WHERE nazwa = ?", [
        industry,
      ]);

      if ((rows as ExistingRow[]).length === 0) {
        await db.execute("INSERT INTO branze (nazwa) VALUES (?)", [industry]);
        console.log(
          chalk.green(`✅ Industry "${industry}" added to the database.`)
        );
      } else {
        console.log(
          chalk.yellow(
            `⚠️ Industry "${industry}" already exists in the database.`
          )
        );
      }
    } catch (error) {
      console.error(
        chalk.red(`❌ Error adding industry "${industry}":`, error)
      );
    }
  }
}
