import { db } from "../config/database";
import chalk from "chalk";
import { ExistingRow } from "../models/dataDBMoldes";

export async function addTechnologiesToDB(technologies: Set<string>) {
  for (const technology of technologies) {
    try {
      const [rows] = await db.execute(
        "SELECT id FROM technologie WHERE nazwa = ?",
        [technology]
      );

      if ((rows as ExistingRow[]).length === 0) {
        await db.execute("INSERT INTO technologie (nazwa) VALUES (?)", [
          technology,
        ]);
        console.log(
          chalk.green(`✅ Technology "${technology}" added to the database.`)
        );
      } else {
        console.log(
          chalk.yellow(
            `⚠️ Technology "${technology}" already exists in the database.`
          )
        );
      }
    } catch (error) {
      console.error(
        chalk.red(`❌ Error adding technology "${technology}":`, error)
      );
    }
  }
}
