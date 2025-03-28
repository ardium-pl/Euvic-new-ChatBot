import chalk from "chalk";
import { queryDb } from "../../../core/database/mySql/mysqlQueries";

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
