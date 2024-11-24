import { db } from "../config/database";
import { DataFileProject } from "../models/dataMoldes";
import chalk from "chalk";

export async function addFileProjectsToDB(fileProjects: DataFileProject[]) {
  for (const fileProject of fileProjects) {
    try {
      // Pobieranie ID projektu na podstawie opisu
      const [projectRows] = await db.execute(
        "SELECT id FROM projekty WHERE nazwa = ?",
        [fileProject.projectName]
      );

      // Pobieranie ID pliku na podstawie nazwy
      const [fileRows] = await db.execute(
        "SELECT id FROM pliki WHERE nazwa = ?",
        [fileProject.fileName]
      );

      if (
        (projectRows as any[]).length === 0 ||
        (fileRows as any[]).length === 0
      ) {
        console.log(
          chalk.red(
            `❌ File "${fileProject.fileName}" or project "${fileProject.projectName}" not found in the database.`
          )
        );
        continue;
      }

      const projectId = (projectRows as any[])[0].id;
      const fileId = (fileRows as any[])[0].id;

      // Sprawdzanie, czy relacja już istnieje
      const [existingRelationRows] = await db.execute(
        "SELECT id_pliku, id_proj FROM pliki_projekty WHERE id_pliku = ? AND id_proj = ?",
        [fileId, projectId]
      );

      if ((existingRelationRows as any[]).length === 0) {
        // Dodanie nowej relacji do tabeli `pliki_projekty`
        await db.execute(
          "INSERT INTO pliki_projekty (id_pliku, id_proj) VALUES (?, ?)",
          [fileId, projectId]
        );
        console.log(
          chalk.green(
            `✅ File-project relationship added: File "${fileProject.fileName}" -> Project "${fileProject.projectName}".`
          )
        );
      } else {
        console.log(
          chalk.yellow(
            `⚠️ File-project relationship already exists: File "${fileProject.fileName}" -> Project "${fileProject.projectName}".`
          )
        );
      }
    } catch (error) {
      console.error(
        chalk.red(
          `❌ Error adding file-project relationship: File "${fileProject.fileName}" -> Project "${fileProject.projectName}".`,
          error
        )
      );
    }
  }
}
