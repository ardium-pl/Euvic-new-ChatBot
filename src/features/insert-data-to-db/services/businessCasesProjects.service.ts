import chalk from "chalk";
import { BusinessCasesProject } from "../models/dataDBMoldes";
import { queryDb } from "../../../core/database/mySql/mysqlQueries";

export async function addBusinessCaseProjectsToDB(
  businessCaseProjects: BusinessCasesProject[]
) {
  for (const businessCaseProject of businessCaseProjects) {
    try {
      for (const businessCaseName of businessCaseProject.businessCases) {
        try {
          await queryDb(
            `INSERT INTO biznes_casy_projekty (id_proj, id_biznes_case)
             VALUES (
               (SELECT id FROM projekty WHERE nazwa = ?),
               (SELECT id FROM biznes_casy WHERE opis = ?)
             )`,
            [businessCaseProject.projectName, businessCaseName]
          );
          console.log(
            chalk.green(
              `✅ Added relationship: Business Case "${businessCaseName}" to Project "${businessCaseProject.projectName}".`
            )
          );
        } catch (error: any) {
          if (error.code === "ER_DUP_ENTRY") {
            console.log(
              chalk.cyan(
                `ℹ️ Relationship between Business Case "${businessCaseName}" and Project "${businessCaseProject.projectName}" already exists.`
              )
            );
          } else if (error.code === "ER_NO_REFERENCED_ROW") {
            console.log(
              chalk.yellow(
                `⚠️ Business Case "${businessCaseName}" or Project "${businessCaseProject.projectName}" not found in the database.`
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
          `❌ Error adding relationships for Project "${businessCaseProject.projectName}":`,
          error
        )
      );
    }
  }
}
