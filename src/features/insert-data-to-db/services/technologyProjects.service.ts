import { queryDb } from "../../../core/database/mySql/mysqlQueries";
import { TechnologyProject } from "../models/dataDBMoldes";
import chalk from "chalk";

export async function addTechnologyProjectsToDB(
  technologyProjects: TechnologyProject[]
) {
  for (const techProject of technologyProjects) {
    try {
      for (const technologyName of techProject.technologies) {
        try {
          await queryDb(
            `INSERT INTO technologie_projekty (id_tech, id_proj)
            VALUES (
              (SELECT id FROM technologie WHERE nazwa = ?),
              (SELECT id FROM projekty WHERE nazwa = ?)
            )`,
            [technologyName, techProject.projectName]
          );
          console.log(
            chalk.green(
              `✅ Added relationship: Technology "${technologyName}" to Project "${techProject.projectName}".`
            )
          );
        } catch (error: any) {
          if (error.code === "ER_DUP_ENTRY") {
            console.log(
              chalk.cyan(
                `ℹ️ Relationship between Technology "${technologyName}" and Project "${techProject.projectName}" already exists.`
              )
            );
          } else if (error.code === "ER_NO_REFERENCED_ROW") {
            console.log(
              chalk.yellow(
                `⚠️ Technology "${technologyName}" or Project "${techProject.projectName}" not found in the database.`
              )
            );
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      console.error(
        chalk.red(
          `❌ Error adding relationships for Project "${techProject.projectName}":`,
          error
        )
      );
    }
  }
}
