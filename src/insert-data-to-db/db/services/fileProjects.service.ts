import { queryDb } from "../../../sql-translator/database/mySql";
import { DataFileProject } from "../models/dataDBMoldes";
import chalk from "chalk";

export async function addFileProjectsToDB(fileProjects: DataFileProject[]) {
  for (const fileProject of fileProjects) {
    try {
      await queryDb(
        `INSERT INTO pliki_projekty (id_pliku, id_proj)
         VALUES (
           (SELECT id FROM pliki WHERE nazwa = ?),
           (SELECT id FROM projekty WHERE nazwa = ?)
         )`,
        [fileProject.fileName, fileProject.projectName]
      );
      console.log(
        chalk.green(
          `✅ File-project relationship added: File "${fileProject.fileName}" -> Project "${fileProject.projectName}".`
        )
      );
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        console.log(
          chalk.yellow(
            `⚠️ File-project relationship already exists: File "${fileProject.fileName}" -> Project "${fileProject.projectName}".`
          )
        );
      } else if (error.code === "ER_NO_REFERENCED_ROW") {
        console.log(
          chalk.red(
            `❌ File "${fileProject.fileName}" or project "${fileProject.projectName}" not found in the database.`
          )
        );
      } else {
        console.error(
          chalk.red(
            `❌ Error adding file-project relationship: File "${fileProject.fileName}" -> Project "${fileProject.projectName}".`,
            error
          )
        );
      }
    }
  }
}
