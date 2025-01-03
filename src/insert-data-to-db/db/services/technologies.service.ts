import { db } from "../config/database";
import chalk from "chalk";

export async function addTechnologiesToDB(technologies: Set<string>) {
  for (const technology of technologies) {
    try {
      await db.execute("INSERT INTO technologie (nazwa) VALUES (?)", [
        technology,
      ]);
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
