import { db } from "../config/database";
import chalk from "chalk";

export async function addBusinessCasesToDB(businessCases: Set<string>) {
  for (const businessCase of businessCases) {
    try {
      const [rows] = await db.execute(
        "SELECT id FROM biznes_casy WHERE opis = ?",
        [businessCase]
      );

      if ((rows as any[]).length === 0) {
        await db.execute("INSERT INTO biznes_casy (opis) VALUES (?)", [
          businessCase,
        ]);
        console.log(
          chalk.green(
            `✅ Business case "${chalk.bold(
              businessCase
            )}" added to the database.`
          )
        );
      } else {
        console.log(
          chalk.yellow(
            `⚠️ Business case "${chalk.bold(
              businessCase
            )}" already exists in the database.`
          )
        );
      }
    } catch (error) {
      console.error(
        chalk.red(
          `❌ Error adding business case "${chalk.bold(businessCase)}":`
        ),
        error
      );
    }
  }
}
