import chalk from "chalk";
import { queryDb } from "../../../core/database/mySql/mysqlQueries";

export async function addTechnologiesToDB(technologies: Set<string>) {
  for (const technology of technologies) {
    try {
      await queryDb("INSERT INTO technologie (nazwa) VALUES (?)", [technology]);
      console.log(
        chalk.green(`✅ Technology "${technology}" added to the database.`)
      );
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        console.log(
          chalk.yellow(
            `⚠️ Technology "${technology}" already exists in the database.`
          )
        );
      } else {
        console.error(
          chalk.red(`❌ Error adding technology "${technology}":`),
          error
        );
      }
    }
  }
}
