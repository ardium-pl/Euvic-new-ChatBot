import { queryDb } from "../../../sql-translator/database/mySql";
import { db } from "../config/database";
import chalk from "chalk";

export async function addIndustriesToDB(industries: Set<string>) {
  for (const industry of industries) {
    try {
      await queryDb("INSERT INTO branze (nazwa) VALUES (?)", [industry]);
      console.log(
        chalk.green(`✅ Industry "${industry}" added to the database.`)
      );
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        console.log(
          chalk.yellow(
            `⚠️ Industry "${industry}" already exists in the database.`
          )
        );
      } else {
        console.error(
          chalk.red(`❌ Error adding industry "${industry}":`),
          error
        );
      }
    }
  }
}
