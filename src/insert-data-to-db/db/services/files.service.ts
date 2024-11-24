import { db } from "../config/database";
import { DataFile } from "../models/dataDBMoldes";
import chalk from "chalk";

export async function addFilesToDB(dataFiles: DataFile[]) {
  for (const file of dataFiles) {
    try {
      const [rows] = await db.execute("SELECT id FROM pliki WHERE nazwa = ?", [
        file.nazwa,
      ]);

      if ((rows as any[]).length === 0) {
        await db.execute(
          "INSERT INTO pliki (nazwa, zawartosc_ocr) VALUES (?, ?)",
          [file.nazwa, file.zawartosc_ocr]
        );
        console.log(
          chalk.green(`✅ File "${file.nazwa}" added to the database.`)
        );
      } else {
        console.log(
          chalk.yellow(
            `⚠️ File "${file.nazwa}" already exists in the database.`
          )
        );
      }
    } catch (error) {
      console.error(chalk.red(`❌ Error adding file "${file.nazwa}":`, error));
    }
  }
}
