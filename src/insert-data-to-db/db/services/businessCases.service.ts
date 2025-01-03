import { db } from "../config/database";
import chalk from "chalk";

export async function addBusinessCasesToDB(businessCases: Set<string>) {
  for (const businessCase of businessCases) {
    try {
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
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        console.log(
          chalk.yellow(
            `⚠️ Business case "${chalk.bold(
              businessCase
            )}" already exists in the database.`
          )
        );
      } else {
        console.error(
          chalk.red(
            `❌ Error adding business case "${chalk.bold(businessCase)}":`
          ),
          error
        );
      }
    }
  }
}
