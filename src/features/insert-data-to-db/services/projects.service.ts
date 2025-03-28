import { queryDb } from "../../../core/database/mySql/mysqlQueries";
import { Project } from "../models/dataDBMoldes";
import chalk from "chalk";

export async function addProjectsToDB(projectsData: Project[]) {
  for (const project of projectsData) {
    try {
      try {
        await queryDb(
          `INSERT INTO projekty 
          (nazwa, opis, id_klienta, id_branzy, data_opis, skala_wdrozenia_opis)
          VALUES (?, ?, 
            (SELECT id FROM klienci WHERE nazwa = ?), 
            (SELECT id FROM branze WHERE nazwa = ?), 
            ?, ?)`,
          [
            project.projectName,
            project.description,
            project.clientName,
            project.industryName,
            project.dateDescription,
            project.scaleOfImplementation,
          ]
        );
        console.log(
          chalk.green(
            `✅ Project "${project.projectName}" added to the database.`
          )
        );
      } catch (insertError: any) {
        if (insertError.code === "ER_DUP_ENTRY") {
          console.log(
            chalk.yellow(
              `⚠️ Project "${project.projectName}" already exists in the database.`
            )
          );
        } else if (insertError.code === "ER_NO_REFERENCED_ROW") {
          console.error(
            chalk.red(
              `❌ Missing foreign key for project "${project.projectName}". Check client or industry.`
            )
          );
        } else {
          throw insertError;
        }
      }
    } catch (error) {
      console.error(
        chalk.red(`❌ Error adding project "${project.projectName}":`, error)
      );
    }
  }
}
